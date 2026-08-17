import { requireFacility } from "@/data/facilities";
import { shipments } from "@/data/shipments";
import type {
  Facility,
  LifecycleStage,
  ProofOfDelivery,
  Shipment,
  TrackingEvent,
} from "@/data/types";
import { availableActions, stageOf } from "./status";

/**
 * Every read of the shipment dataset goes through this module.
 *
 * That is deliberate: when you replace the demo data with a real carrier or WMS
 * integration, these are the functions to reimplement (as async lookups) and
 * nothing in `src/app` or `src/components` has to change shape.
 */

/* ------------------------------------------------------------------ *
 * Lookups
 * ------------------------------------------------------------------ */

const byId = new Map(shipments.map((shipment) => [shipment.id, shipment]));
const byTracking = new Map(shipments.map((shipment) => [shipment.trackingNumber, shipment]));

/**
 * Accepts what people actually paste: `pkl-10482`, `PKL 10482`, `PKL10482` and
 * the bare `10482` all resolve to `PKL-10482`.
 */
export function normalizeTrackingNumber(input: string): string {
  const cleaned = input
    .trim()
    .toUpperCase()
    .replace(/[\s_-]/g, "");
  const digits = cleaned.replace(/^PKL/, "");
  if (!/^\d{5}$/.test(digits)) return cleaned;
  return `PKL-${digits}`;
}

export function getShipmentById(id: string): Shipment | undefined {
  return byId.get(id);
}

export function getShipmentByTracking(trackingNumber: string): Shipment | undefined {
  return byTracking.get(normalizeTrackingNumber(trackingNumber));
}

export function getAllShipments(): Shipment[] {
  return shipments;
}

export function getShipmentsForCustomer(customerId: string): Shipment[] {
  return shipments.filter((shipment) => shipment.customerId === customerId);
}

/* ------------------------------------------------------------------ *
 * Derived views
 * ------------------------------------------------------------------ */

export function originFacility(shipment: Shipment): Facility {
  return requireFacility(shipment.originId);
}

export function destinationFacility(shipment: Shipment): Facility {
  return requireFacility(shipment.destinationId);
}

export function routeFacilities(shipment: Shipment): Facility[] {
  return shipment.routeFacilityIds.map(requireFacility);
}

/** Newest event first — the order timelines and "last update" readouts want. */
export function eventsNewestFirst(shipment: Shipment): TrackingEvent[] {
  return [...shipment.events].reverse();
}

export function lastEvent(shipment: Shipment): TrackingEvent {
  return shipment.events[shipment.events.length - 1];
}

/**
 * Whether the shipment was delivered on or before its estimated delivery.
 * Returns `null` while it is still moving, so callers can exclude it from
 * on-time calculations rather than guessing.
 */
export function wasOnTime(shipment: Shipment): boolean | null {
  if (!shipment.proofOfDelivery) return null;
  return new Date(shipment.proofOfDelivery.deliveredAt) <= new Date(shipment.eta);
}

/** Transit time in hours for delivered shipments, otherwise `null`. */
export function transitHours(shipment: Shipment): number | null {
  if (!shipment.proofOfDelivery) return null;
  const start = new Date(shipment.createdAt).getTime();
  const end = new Date(shipment.proofOfDelivery.deliveredAt).getTime();
  return (end - start) / 3_600_000;
}

/* ------------------------------------------------------------------ *
 * Demo mutations
 *
 * Pure functions: they take a shipment and return the event that should be
 * appended plus the resulting status. The demo store persists the result in
 * browser storage; there is no backend and no carrier is contacted.
 * ------------------------------------------------------------------ */

export type ShipmentMutation = {
  status: Shipment["status"];
  event: TrackingEvent;
  proofOfDelivery?: ProofOfDelivery;
};

/**
 * Timestamps a locally-created event.
 *
 * Uses the wall clock, but never lets a new scan sort before the last authored
 * one — otherwise a demo dataset dated in the future would produce a timeline
 * that runs backwards.
 */
function nextTimestamp(shipment: Shipment): string {
  const previous = new Date(lastEvent(shipment).at).getTime();
  return new Date(Math.max(Date.now(), previous + 3_600_000)).toISOString();
}

function nextEventId(shipment: Shipment): string {
  return `${shipment.id}-ev-local-${shipment.events.length + 1}`;
}

/** Move the shipment to the next lifecycle stage. */
export function advanceStage(shipment: Shipment): ShipmentMutation | null {
  const next = availableActions(shipment).advance;
  if (!next) return null;

  const destination = destinationFacility(shipment);
  const origin = originFacility(shipment);
  const placement: Record<LifecycleStage, { location: string; facilityId: string | null }> = {
    created: { location: origin.city, facilityId: null },
    picked_up: { location: origin.city, facilityId: null },
    origin_facility: { location: origin.name, facilityId: origin.id },
    in_transit: {
      location: `${origin.city} → ${destination.city}`,
      facilityId: null,
    },
    destination_facility: { location: destination.name, facilityId: destination.id },
    out_for_delivery: { location: destination.city, facilityId: destination.id },
    delivered: { location: destination.city, facilityId: null },
  };

  const where = placement[next];
  return {
    status: next,
    event: {
      id: nextEventId(shipment),
      at: nextTimestamp(shipment),
      stage: next,
      status: next,
      facilityId: where.facilityId,
      location: where.location,
      description: `Status advanced to “${next.replace(/_/g, " ")}” from the operations workspace.`,
    },
  };
}

/** Complete the shipment and generate its proof of delivery. */
export function markDelivered(shipment: Shipment): ShipmentMutation | null {
  if (stageOf(shipment) === "delivered") return null;

  const destination = destinationFacility(shipment);
  const at = nextTimestamp(shipment);
  const receivedBy = initialsOf(shipment.recipient.name);

  return {
    status: "delivered",
    event: {
      id: nextEventId(shipment),
      at,
      stage: "delivered",
      status: "delivered",
      facilityId: null,
      location: `${destination.city} — ${shipment.recipient.company ?? "residential"}`,
      description: `Delivered and signed for by ${receivedBy}.`,
    },
    proofOfDelivery: {
      deliveredAt: at,
      receivedBy,
      signatureInitials: receivedBy.replace(/[^A-Z]/g, "").slice(0, 2),
      location: `${destination.city} — ${shipment.recipient.company ?? "residential address"}`,
      method: "signature",
      packageCondition: "good",
      note: "Recorded in the demo operations workspace. No parcel was actually delivered.",
    },
  };
}

/** Raise an exception against the shipment without moving it forward. */
export function markException(shipment: Shipment, reason: string): ShipmentMutation | null {
  if (!availableActions(shipment).canFlagException) return null;
  const previous = lastEvent(shipment);
  return {
    status: "exception",
    event: {
      id: nextEventId(shipment),
      at: nextTimestamp(shipment),
      stage: previous.stage,
      status: "exception",
      facilityId: previous.facilityId,
      location: previous.location,
      description: reason,
    },
  };
}

/** Flag the shipment as running behind its estimate. */
export function markDelayed(shipment: Shipment, reason: string): ShipmentMutation | null {
  if (!availableActions(shipment).canFlagDelay) return null;
  const previous = lastEvent(shipment);
  return {
    status: "delayed",
    event: {
      id: nextEventId(shipment),
      at: nextTimestamp(shipment),
      stage: previous.stage,
      status: "delayed",
      facilityId: previous.facilityId,
      location: previous.location,
      description: reason,
    },
  };
}

export function initialsOf(name: string): string {
  const parts = name
    .replace(/[^\p{L}\s.]/gu, "")
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}. ${parts[parts.length - 1]}`;
}
