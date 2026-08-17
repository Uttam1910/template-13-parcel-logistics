import { describe, expect, it } from "vitest";
import { shipments } from "@/data/shipments";
import { LIFECYCLE_STAGES } from "@/data/types";
import {
  advanceStage,
  getShipmentById,
  getShipmentByTracking,
  markDelayed,
  markDelivered,
  markException,
  normalizeTrackingNumber,
  routeFacilities,
  transitHours,
  wasOnTime,
} from "@/lib/shipments";
import { availableActions, matchesStatusFilter, stageOf, STATUS_FILTERS } from "@/lib/status";
import { filterShipments, hasActiveFilters } from "@/lib/filters";
import { routeProgress } from "@/components/art/RouteMap";

describe("tracking number lookup", () => {
  it("finds a shipment by its exact number", () => {
    expect(getShipmentByTracking("PKL-10482")?.id).toBe("shp-10482");
  });

  it("accepts the forms people actually paste", () => {
    for (const input of ["pkl-10482", "PKL10482", "  PKL 10482 ", "10482", "pkl_10482"]) {
      expect(normalizeTrackingNumber(input)).toBe("PKL-10482");
      expect(getShipmentByTracking(input)?.id).toBe("shp-10482");
    }
  });

  it("returns undefined for numbers that are not in the dataset", () => {
    for (const input of ["PKL-00000", "nonsense", "", "PKL-1", "12345678"]) {
      expect(getShipmentByTracking(input)).toBeUndefined();
    }
  });

  it("does not mangle input it cannot interpret", () => {
    expect(normalizeTrackingNumber("hello world")).toBe("HELLOWORLD");
  });

  it("finds shipments by internal id", () => {
    expect(getShipmentById("shp-31765")?.trackingNumber).toBe("PKL-31765");
    expect(getShipmentById("shp-does-not-exist")).toBeUndefined();
  });
});

describe("public tracking and the workspace read the same record", () => {
  it("resolves the same object by tracking number and by id", () => {
    for (const shipment of shipments) {
      expect(getShipmentByTracking(shipment.trackingNumber)).toBe(getShipmentById(shipment.id));
    }
  });
});

describe("status transitions", () => {
  it("advances a shipment one lifecycle stage at a time", () => {
    const shipment = getShipmentByTracking("PKL-93518")!; // picked_up
    const before = stageOf(shipment);
    const mutation = advanceStage(shipment);

    expect(mutation).not.toBeNull();
    const expected = LIFECYCLE_STAGES[LIFECYCLE_STAGES.indexOf(before) + 1];
    expect(mutation!.status).toBe(expected);
    expect(mutation!.event.stage).toBe(expected);
    expect(new Date(mutation!.event.at).getTime()).toBeGreaterThan(
      new Date(shipment.events.at(-1)!.at).getTime(),
    );
  });

  it("never advances straight to delivered", () => {
    for (const shipment of shipments) {
      const mutation = advanceStage(shipment);
      if (mutation) expect(mutation.status).not.toBe("delivered");
    }
  });

  it("produces proof of delivery when marking delivered", () => {
    const shipment = getShipmentByTracking("PKL-10482")!;
    const mutation = markDelivered(shipment);

    expect(mutation).not.toBeNull();
    expect(mutation!.status).toBe("delivered");
    expect(mutation!.event.stage).toBe("delivered");
    expect(mutation!.proofOfDelivery).toBeDefined();
    expect(mutation!.proofOfDelivery!.deliveredAt).toBe(mutation!.event.at);
  });

  it("refuses to act on an already delivered shipment", () => {
    const delivered = getShipmentByTracking("PKL-31765")!;
    expect(delivered.status).toBe("delivered");
    expect(advanceStage(delivered)).toBeNull();
    expect(markDelivered(delivered)).toBeNull();
    expect(markException(delivered, "Something went wrong")).toBeNull();
    expect(markDelayed(delivered, "Running behind")).toBeNull();
  });

  it("raises an exception without moving the shipment forward", () => {
    const shipment = getShipmentByTracking("PKL-10482")!;
    const before = stageOf(shipment);
    const mutation = markException(shipment, "Address could not be verified.");

    expect(mutation!.status).toBe("exception");
    expect(mutation!.event.stage).toBe(before);
    expect(mutation!.event.description).toBe("Address could not be verified.");
    expect(mutation!.proofOfDelivery).toBeUndefined();
  });

  it("flags a delay without moving the shipment forward", () => {
    const shipment = getShipmentByTracking("PKL-10482")!;
    const before = stageOf(shipment);
    const mutation = markDelayed(shipment, "Trunk departure missed.");

    expect(mutation!.status).toBe("delayed");
    expect(mutation!.event.stage).toBe(before);
  });

  it("does not offer to re-raise the state a shipment is already in", () => {
    const flagged = getShipmentByTracking("PKL-58291")!; // exception
    expect(flagged.status).toBe("exception");
    expect(availableActions(flagged).canFlagException).toBe(false);
    expect(availableActions(flagged).canFlagDelay).toBe(true);

    const delayed = getShipmentByTracking("PKL-44120")!;
    expect(delayed.status).toBe("delayed");
    expect(availableActions(delayed).canFlagDelay).toBe(false);
  });
});

describe("route progress", () => {
  it("places every shipment somewhere on its own route", () => {
    for (const shipment of shipments) {
      const progress = routeProgress(shipment);
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(shipment.routeFacilityIds.length - 1);
    }
  });

  it("puts delivered shipments at the destination", () => {
    const delivered = shipments.filter((shipment) => shipment.status === "delivered");
    expect(delivered.length).toBeGreaterThan(0);
    for (const shipment of delivered) {
      expect(routeProgress(shipment)).toBe(shipment.routeFacilityIds.length - 1);
    }
  });

  it("puts newly created shipments at the origin", () => {
    const created = shipments.find((shipment) => shipment.status === "created")!;
    expect(routeProgress(created)).toBe(0);
  });

  it("resolves every route facility", () => {
    for (const shipment of shipments) {
      expect(routeFacilities(shipment)).toHaveLength(shipment.routeFacilityIds.length);
    }
  });
});

describe("delivery performance helpers", () => {
  it("reports on-time only for delivered shipments", () => {
    for (const shipment of shipments) {
      if (shipment.proofOfDelivery) {
        expect(typeof wasOnTime(shipment)).toBe("boolean");
        expect(transitHours(shipment)).toBeGreaterThan(0);
      } else {
        expect(wasOnTime(shipment)).toBeNull();
        expect(transitHours(shipment)).toBeNull();
      }
    }
  });
});

describe("filters", () => {
  it("partitions the dataset without losing or duplicating anything", () => {
    const groups = STATUS_FILTERS.filter((filter) => filter !== "all");
    const counted = groups.reduce(
      (total, filter) =>
        total + shipments.filter((s) => matchesStatusFilter(s.status, filter)).length,
      0,
    );
    expect(counted).toBe(shipments.length);
  });

  it("returns everything for the default query", () => {
    const query = { search: "", status: "all" as const, sort: "latest" as const };
    expect(filterShipments(shipments, query)).toHaveLength(shipments.length);
    expect(hasActiveFilters(query)).toBe(false);
  });

  it("searches tracking numbers with or without the dash", () => {
    for (const search of ["PKL-10482", "pkl10482", "10482"]) {
      const results = filterShipments(shipments, { search, status: "all", sort: "latest" });
      expect(results).toHaveLength(1);
      expect(results[0].trackingNumber).toBe("PKL-10482");
    }
  });

  it("searches by customer and by destination city", () => {
    expect(
      filterShipments(shipments, { search: "Lumen", status: "all", sort: "latest" }).length,
    ).toBeGreaterThan(0);
    expect(
      filterShipments(shipments, { search: "Kingsmere", status: "all", sort: "latest" }).length,
    ).toBeGreaterThan(0);
  });

  it("returns an empty list rather than throwing for a search with no matches", () => {
    expect(
      filterShipments(shipments, { search: "zzzzzz", status: "all", sort: "latest" }),
    ).toEqual([]);
  });

  it("sorts by ETA ascending", () => {
    const results = filterShipments(shipments, { search: "", status: "all", sort: "eta" });
    for (let index = 1; index < results.length; index += 1) {
      expect(results[index].eta >= results[index - 1].eta).toBe(true);
    }
  });

  it("treats any non-default control as an active filter", () => {
    expect(hasActiveFilters({ search: "x", status: "all", sort: "latest" })).toBe(true);
    expect(hasActiveFilters({ search: "", status: "delivered", sort: "latest" })).toBe(true);
    expect(hasActiveFilters({ search: "", status: "all", sort: "eta" })).toBe(true);
  });
});
