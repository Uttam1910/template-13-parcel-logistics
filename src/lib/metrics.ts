import {
  DEMO_TODAY,
  SHIPMENT_STATUSES,
  type Shipment,
  type ShipmentStatus,
} from "@/data/types";
import { transitHours, wasOnTime } from "./shipments";

/**
 * Operating metrics, computed from the shipment records themselves.
 *
 * Nothing here is a hard-coded headline number: mark a shipment delivered in
 * the workspace and these values move, which is the point.
 */

export type NetworkMetrics = {
  active: number;
  inTransit: number;
  outForDelivery: number;
  deliveredToday: number;
  exceptions: number;
  delayed: number;
  onTimeRate: number | null;
  averageTransitHours: number | null;
};

/** "Today" is the demo's anchor date so the dataset reads the same on any machine. */
function isDemoToday(iso: string): boolean {
  return iso.slice(0, 10) === DEMO_TODAY;
}

const IN_TRANSIT_STATUSES: ShipmentStatus[] = [
  "picked_up",
  "origin_facility",
  "in_transit",
  "destination_facility",
];

export function networkMetrics(shipments: Shipment[]): NetworkMetrics {
  const delivered = shipments.filter((shipment) => shipment.status === "delivered");

  const onTimeJudged = delivered
    .map(wasOnTime)
    .filter((value): value is boolean => value !== null);

  const transit = delivered
    .map(transitHours)
    .filter((value): value is number => value !== null);

  return {
    active: shipments.filter((shipment) => shipment.status !== "delivered").length,
    inTransit: shipments.filter((shipment) => IN_TRANSIT_STATUSES.includes(shipment.status))
      .length,
    outForDelivery: shipments.filter((shipment) => shipment.status === "out_for_delivery")
      .length,
    deliveredToday: delivered.filter(
      (shipment) =>
        shipment.proofOfDelivery && isDemoToday(shipment.proofOfDelivery.deliveredAt),
    ).length,
    exceptions: shipments.filter((shipment) => shipment.status === "exception").length,
    delayed: shipments.filter((shipment) => shipment.status === "delayed").length,
    onTimeRate: onTimeJudged.length
      ? (onTimeJudged.filter(Boolean).length / onTimeJudged.length) * 100
      : null,
    averageTransitHours: transit.length
      ? transit.reduce((sum, hours) => sum + hours, 0) / transit.length
      : null,
  };
}

/** Counts per status, in canonical order, for the distribution chart. */
export function statusCounts(
  shipments: Shipment[],
): { status: ShipmentStatus; count: number }[] {
  return SHIPMENT_STATUSES.map((status) => ({
    status,
    count: shipments.filter((shipment) => shipment.status === status).length,
  }));
}

export type CustomerStats = {
  total: number;
  delivered: number;
  exceptions: number;
  active: number;
  lastShipmentAt: string | null;
  onTimeRate: number | null;
};

export function customerStats(shipments: Shipment[]): CustomerStats {
  const delivered = shipments.filter((shipment) => shipment.status === "delivered");
  const judged = delivered.map(wasOnTime).filter((value): value is boolean => value !== null);

  const latest = shipments
    .map((shipment) => shipment.createdAt)
    .sort()
    .at(-1);

  return {
    total: shipments.length,
    delivered: delivered.length,
    exceptions: shipments.filter((shipment) => shipment.status === "exception").length,
    active: shipments.filter((shipment) => shipment.status !== "delivered").length,
    lastShipmentAt: latest ?? null,
    onTimeRate: judged.length ? (judged.filter(Boolean).length / judged.length) * 100 : null,
  };
}

/**
 * Daily shipment volume over the last seven demo days, derived from when each
 * shipment was created. Small numbers — this is the demo dataset, not the
 * illustrative network figures on `/analytics`.
 */
export function volumeByDay(shipments: Shipment[]): { label: string; value: number }[] {
  const anchor = new Date(`${DEMO_TODAY}T00:00:00.000Z`);
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(anchor.getTime() + (index - 6) * 86_400_000);
    const key = date.toISOString().slice(0, 10);
    return {
      label: weekdays[date.getUTCDay()],
      value: shipments.filter((shipment) => shipment.createdAt.slice(0, 10) === key).length,
    };
  });
}

/** Deliveries per day over the same window, for the performance chart. */
export function deliveriesByDay(shipments: Shipment[]): { label: string; value: number }[] {
  const anchor = new Date(`${DEMO_TODAY}T00:00:00.000Z`);
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(anchor.getTime() + (index - 6) * 86_400_000);
    const key = date.toISOString().slice(0, 10);
    return {
      label: weekdays[date.getUTCDay()],
      value: shipments.filter(
        (shipment) => shipment.proofOfDelivery?.deliveredAt.slice(0, 10) === key,
      ).length,
    };
  });
}
