import { describe, expect, it } from "vitest";
import {
  demoReducer,
  initialDemoState,
  resolveShipment,
  resolveShipments,
  type DemoState,
} from "@/lib/demo/store";
import { shipments } from "@/data/shipments";
import { getShipmentByTracking, markDelivered, markException } from "@/lib/shipments";
import { networkMetrics } from "@/lib/metrics";
import { stageOf } from "@/lib/status";

const base = getShipmentByTracking("PKL-10482")!;

function apply(state: DemoState, ...actions: Parameters<typeof demoReducer>[1][]): DemoState {
  return actions.reduce(demoReducer, state);
}

describe("demo store", () => {
  it("starts signed out with no local edits", () => {
    expect(initialDemoState.signedIn).toBe(false);
    expect(initialDemoState.shipments).toEqual({});
    expect(initialDemoState.events).toEqual({});
    expect(initialDemoState.pods).toEqual({});
  });

  it("signs in and out", () => {
    const signedIn = demoReducer(initialDemoState, { type: "sign-in" });
    expect(signedIn.signedIn).toBe(true);
    expect(demoReducer(signedIn, { type: "sign-out" }).signedIn).toBe(false);
  });

  it("records a mutation as a status patch plus an appended event", () => {
    const mutation = markException(base, "Address could not be verified.")!;
    const state = demoReducer(initialDemoState, {
      type: "apply-mutation",
      shipmentId: base.id,
      mutation,
    });

    expect(state.shipments[base.id].status).toBe("exception");
    expect(state.events[base.id]).toHaveLength(1);
    expect(state.pods[base.id]).toBeUndefined();
  });

  it("stores proof of delivery when a mutation carries one", () => {
    const mutation = markDelivered(base)!;
    const state = demoReducer(initialDemoState, {
      type: "apply-mutation",
      shipmentId: base.id,
      mutation,
    });
    expect(state.pods[base.id]).toBeDefined();
  });

  it("keeps notes newest-first and can delete them", () => {
    const note = { id: "n1", at: "2026-08-17T10:00:00.000Z", author: "Ops", body: "First" };
    const other = { id: "n2", at: "2026-08-17T11:00:00.000Z", author: "Ops", body: "Second" };

    let state = apply(
      initialDemoState,
      { type: "add-note", shipmentId: base.id, note },
      { type: "add-note", shipmentId: base.id, note: other },
    );
    expect(state.notes[base.id].map((n) => n.id)).toEqual(["n2", "n1"]);

    state = demoReducer(state, { type: "delete-note", shipmentId: base.id, noteId: "n2" });
    expect(state.notes[base.id].map((n) => n.id)).toEqual(["n1"]);
  });

  it("deduplicates and caps recently tracked numbers", () => {
    let state = initialDemoState;
    for (const number of ["PKL-10482", "PKL-20841", "PKL-10482"]) {
      state = demoReducer(state, { type: "record-tracking", trackingNumber: number });
    }
    expect(state.recentTracking).toEqual(["PKL-10482", "PKL-20841"]);

    for (let index = 0; index < 12; index += 1) {
      state = demoReducer(state, {
        type: "record-tracking",
        trackingNumber: `PKL-9${index}000`,
      });
    }
    expect(state.recentTracking.length).toBeLessThanOrEqual(6);
  });

  it("merges preference and notification patches rather than replacing them", () => {
    const state = apply(
      initialDemoState,
      { type: "set-preferences", patch: { density: "compact" } },
      { type: "set-notifications", patch: { weeklySummary: true } },
    );
    expect(state.preferences.density).toBe("compact");
    expect(state.preferences.defaultRange).toBe(initialDemoState.preferences.defaultRange);
    expect(state.notifications.weeklySummary).toBe(true);
    expect(state.notifications.exceptions).toBe(initialDemoState.notifications.exceptions);
  });

  it("returns to the starting state on reset", () => {
    const dirty = apply(
      initialDemoState,
      { type: "sign-in" },
      { type: "set-preferences", patch: { density: "compact" } },
      {
        type: "apply-mutation",
        shipmentId: base.id,
        mutation: markDelivered(base)!,
      },
    );
    expect(demoReducer(dirty, { type: "reset" })).toEqual(initialDemoState);
  });
});

describe("resolveShipment", () => {
  it("returns the authored record untouched when there are no local edits", () => {
    expect(resolveShipment(base, initialDemoState)).toBe(base);
  });

  it("applies status, events, location and proof of delivery together", () => {
    const mutation = markDelivered(base)!;
    const state = demoReducer(initialDemoState, {
      type: "apply-mutation",
      shipmentId: base.id,
      mutation,
    });
    const resolved = resolveShipment(base, state);

    expect(resolved.status).toBe("delivered");
    expect(stageOf(resolved)).toBe("delivered");
    expect(resolved.events).toHaveLength(base.events.length + 1);
    // Current location stays derived from the merged history, as in the dataset.
    expect(resolved.currentLocation).toBe(resolved.events.at(-1)!.location);
    expect(resolved.proofOfDelivery).toEqual(mutation.proofOfDelivery);
  });

  it("never mutates the authored record", () => {
    const snapshot = JSON.stringify(base);
    const state = demoReducer(initialDemoState, {
      type: "apply-mutation",
      shipmentId: base.id,
      mutation: markDelivered(base)!,
    });
    resolveShipment(base, state);
    expect(JSON.stringify(base)).toBe(snapshot);
  });

  it("puts local notes ahead of authored ones", () => {
    const note = { id: "n1", at: "2026-08-17T10:00:00.000Z", author: "Ops", body: "Local" };
    const withNotes = getShipmentByTracking("PKL-44120")!;
    const state = demoReducer(initialDemoState, {
      type: "add-note",
      shipmentId: withNotes.id,
      note,
    });
    const resolved = resolveShipment(withNotes, state);

    expect(resolved.notes[0].id).toBe("n1");
    expect(resolved.notes).toHaveLength(withNotes.notes.length + 1);
  });

  it("leaves other shipments alone", () => {
    const state = demoReducer(initialDemoState, {
      type: "apply-mutation",
      shipmentId: base.id,
      mutation: markDelivered(base)!,
    });
    const resolved = resolveShipments(shipments, state);
    const untouched = resolved.filter((shipment) => shipment.id !== base.id);
    const original = shipments.filter((shipment) => shipment.id !== base.id);
    expect(untouched).toEqual(original);
  });

  it("moves the dashboard metrics when a shipment is delivered locally", () => {
    const before = networkMetrics(shipments);
    const state = demoReducer(initialDemoState, {
      type: "apply-mutation",
      shipmentId: base.id,
      mutation: markDelivered(base)!,
    });
    const after = networkMetrics(resolveShipments(shipments, state));

    expect(after.active).toBe(before.active - 1);
    expect(after.inTransit).toBe(before.inTransit - 1);
  });

  it("moves the exception count when an exception is raised locally", () => {
    const before = networkMetrics(shipments);
    const state = demoReducer(initialDemoState, {
      type: "apply-mutation",
      shipmentId: base.id,
      mutation: markException(base, "Held for address verification.")!,
    });
    const after = networkMetrics(resolveShipments(shipments, state));

    expect(after.exceptions).toBe(before.exceptions + 1);
  });
});
