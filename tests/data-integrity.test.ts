import { describe, expect, it } from "vitest";
import { customers } from "@/data/customers";
import { facilities, getFacility } from "@/data/facilities";
import { featuredTrackingNumbers, shipments } from "@/data/shipments";
import { users } from "@/data/users";
import {
  LIFECYCLE_STAGES,
  SERVICE_LEVELS,
  SHIPMENT_STATUSES,
  type ShipmentStatus,
} from "@/data/types";
import { statusMeta } from "@/lib/status";

/**
 * These tests exist because the shipment dataset is the product's single source
 * of truth. If a record's status, history and location can drift apart, both
 * the public tracking page and the operations workspace start lying.
 */

describe("facilities", () => {
  it("have unique ids and codes", () => {
    expect(new Set(facilities.map((f) => f.id)).size).toBe(facilities.length);
    expect(new Set(facilities.map((f) => f.code)).size).toBe(facilities.length);
  });

  it("sit inside the abstract 0–100 coordinate space", () => {
    for (const facility of facilities) {
      expect(facility.point.x).toBeGreaterThanOrEqual(0);
      expect(facility.point.x).toBeLessThanOrEqual(100);
      expect(facility.point.y).toBeGreaterThanOrEqual(0);
      expect(facility.point.y).toBeLessThanOrEqual(100);
    }
  });
});

describe("customers", () => {
  it("have unique ids and slugs", () => {
    expect(new Set(customers.map((c) => c.id)).size).toBe(customers.length);
    expect(new Set(customers.map((c) => c.slug)).size).toBe(customers.length);
  });

  it("use demo-only contact details", () => {
    for (const customer of customers) {
      expect(customer.contact.email).toMatch(/\.demo$/);
    }
  });
});

describe("users", () => {
  it("use demo-only email addresses", () => {
    for (const user of users) expect(user.email).toMatch(/@parcel\.demo$/);
  });
});

describe("shipments", () => {
  it("have unique ids", () => {
    expect(new Set(shipments.map((s) => s.id)).size).toBe(shipments.length);
  });

  it("have unique tracking numbers in the documented format", () => {
    const numbers = shipments.map((s) => s.trackingNumber);
    expect(new Set(numbers).size).toBe(numbers.length);
    for (const number of numbers) expect(number).toMatch(/^PKL-\d{5}$/);
  });

  it("reference customers and facilities that exist", () => {
    const customerIds = new Set(customers.map((c) => c.id));
    for (const shipment of shipments) {
      expect(customerIds.has(shipment.customerId)).toBe(true);
      expect(getFacility(shipment.originId)).toBeDefined();
      expect(getFacility(shipment.destinationId)).toBeDefined();
      for (const id of shipment.routeFacilityIds) expect(getFacility(id)).toBeDefined();
    }
  });

  it("have a route that starts at the origin and ends at the destination", () => {
    for (const shipment of shipments) {
      expect(shipment.routeFacilityIds.length).toBeGreaterThanOrEqual(2);
      expect(shipment.routeFacilityIds[0]).toBe(shipment.originId);
      expect(shipment.routeFacilityIds.at(-1)).toBe(shipment.destinationId);
      // No facility appears twice on one route.
      expect(new Set(shipment.routeFacilityIds).size).toBe(shipment.routeFacilityIds.length);
    }
  });

  it("only use known statuses and service levels", () => {
    for (const shipment of shipments) {
      expect(SHIPMENT_STATUSES).toContain(shipment.status);
      expect(SERVICE_LEVELS).toContain(shipment.service);
    }
  });

  it("carry a status that matches the last recorded event", () => {
    for (const shipment of shipments) {
      const last = shipment.events.at(-1);
      expect(last, `${shipment.trackingNumber} has no events`).toBeDefined();
      expect(shipment.status).toBe(last!.status);
    }
  });

  it("carry a current location that matches the last recorded event", () => {
    for (const shipment of shipments) {
      expect(shipment.currentLocation).toBe(shipment.events.at(-1)!.location);
    }
  });

  it("have events in chronological order with unique ids", () => {
    for (const shipment of shipments) {
      const times = shipment.events.map((event) => new Date(event.at).getTime());
      for (let index = 1; index < times.length; index += 1) {
        expect(times[index]).toBeGreaterThanOrEqual(times[index - 1]);
      }
      expect(new Set(shipment.events.map((e) => e.id)).size).toBe(shipment.events.length);
    }
  });

  it("never move backwards through the lifecycle", () => {
    for (const shipment of shipments) {
      let highest = -1;
      for (const event of shipment.events) {
        const index = LIFECYCLE_STAGES.indexOf(event.stage);
        expect(index).toBeGreaterThanOrEqual(0);
        expect(index).toBeGreaterThanOrEqual(highest);
        highest = index;
      }
    }
  });

  it("start with a creation event dated the shipment's creation", () => {
    for (const shipment of shipments) {
      expect(shipment.events[0].stage).toBe("created");
      expect(shipment.events[0].at).toBe(shipment.createdAt);
    }
  });

  it("only reference facilities from their own route in events", () => {
    for (const shipment of shipments) {
      for (const event of shipment.events) {
        if (!event.facilityId) continue;
        expect(shipment.routeFacilityIds).toContain(event.facilityId);
      }
    }
  });

  it("attach proof of delivery to delivered shipments only", () => {
    for (const shipment of shipments) {
      const delivered = shipment.events.at(-1)!.stage === "delivered";
      if (delivered) {
        expect(shipment.proofOfDelivery, `${shipment.trackingNumber}`).not.toBeNull();
      } else {
        expect(shipment.proofOfDelivery, `${shipment.trackingNumber}`).toBeNull();
      }
    }
  });

  it("record proof of delivery at or after the last delivery scan", () => {
    for (const shipment of shipments) {
      if (!shipment.proofOfDelivery) continue;
      const deliveryScan = shipment.events.findLast((event) => event.stage === "delivered")!;
      expect(new Date(shipment.proofOfDelivery.deliveredAt).getTime()).toBe(
        new Date(deliveryScan.at).getTime(),
      );
    }
  });

  it("have a positive weight and at least one piece", () => {
    for (const shipment of shipments) {
      expect(shipment.package.weightKg).toBeGreaterThan(0);
      expect(shipment.package.pieces).toBeGreaterThanOrEqual(1);
    }
  });

  it("cover every status the interface can display", () => {
    const present = new Set(shipments.map((s) => s.status));
    const expected: ShipmentStatus[] = [
      "created",
      "picked_up",
      "origin_facility",
      "in_transit",
      "destination_facility",
      "out_for_delivery",
      "delivered",
      "delayed",
      "exception",
    ];
    for (const status of expected) {
      expect(present.has(status), `no demo shipment is "${status}"`).toBe(true);
    }
  });
});

describe("featured tracking numbers", () => {
  it("all resolve to a shipment in the dataset", () => {
    const known = new Set(shipments.map((s) => s.trackingNumber));
    for (const number of featuredTrackingNumbers) expect(known.has(number)).toBe(true);
  });

  it("show a range of statuses rather than six identical ones", () => {
    const statuses = featuredTrackingNumbers.map(
      (number) => shipments.find((s) => s.trackingNumber === number)!.status,
    );
    expect(new Set(statuses).size).toBeGreaterThanOrEqual(4);
  });
});

describe("status metadata", () => {
  it("covers every status exactly once", () => {
    expect(Object.keys(statusMeta).sort()).toEqual([...SHIPMENT_STATUSES].sort());
  });

  it("gives every status a label, headline, description and icon", () => {
    for (const status of SHIPMENT_STATUSES) {
      const meta = statusMeta[status];
      expect(meta.label.length).toBeGreaterThan(0);
      expect(meta.short.length).toBeGreaterThan(0);
      expect(meta.short.length).toBeLessThanOrEqual(meta.label.length);
      expect(meta.headline).toBe(meta.headline.toUpperCase());
      expect(meta.description.length).toBeGreaterThan(20);
      // lucide-react icons are `forwardRef` objects, not plain functions.
      expect(meta.icon).toBeDefined();
    }
  });
});
