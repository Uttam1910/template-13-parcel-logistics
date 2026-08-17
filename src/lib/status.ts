import {
  AlertTriangle,
  ClipboardList,
  Clock,
  PackageCheck,
  PackageSearch,
  Truck,
  Warehouse,
  type LucideIcon,
} from "lucide-react";
import {
  LIFECYCLE_STAGES,
  type LifecycleStage,
  type Shipment,
  type ShipmentStatus,
  type StatusTone,
} from "@/data/types";

/**
 * Shipment status — the single source of truth.
 *
 * Nothing in the UI writes a status string of its own: components read labels,
 * descriptions, tones and icons from here so a new status only has to be added
 * once. Colour is never the only signal — every badge renders its label too.
 */

export type StatusMeta = {
  /** Sentence-case label used in timelines and full-size badges. */
  label: string;
  /** Trimmed label for dense contexts — table badges on narrow viewports. */
  short: string;
  /** Upper-case form for the headline treatment on tracking pages. */
  headline: string;
  /** One line explaining what the status means to a recipient. */
  description: string;
  tone: StatusTone;
  icon: LucideIcon;
};

export const statusMeta: Record<ShipmentStatus, StatusMeta> = {
  created: {
    label: "Order created",
    short: "Created",
    headline: "ORDER CREATED",
    description: "We have the shipment details. The parcel has not been collected yet.",
    tone: "neutral",
    icon: ClipboardList,
  },
  picked_up: {
    label: "Picked up",
    short: "Picked up",
    headline: "PICKED UP",
    description: "The parcel has been collected from the shipper and is entering the network.",
    tone: "progress",
    icon: PackageSearch,
  },
  origin_facility: {
    label: "At origin facility",
    short: "At origin",
    headline: "AT ORIGIN FACILITY",
    description: "The parcel has been scanned at the first facility on its route.",
    tone: "progress",
    icon: Warehouse,
  },
  in_transit: {
    label: "In transit",
    short: "In transit",
    headline: "IN TRANSIT",
    description: "The parcel is moving between facilities on its way to the destination.",
    tone: "active",
    icon: Truck,
  },
  destination_facility: {
    label: "At destination facility",
    short: "At destination",
    headline: "AT DESTINATION FACILITY",
    description: "The parcel has reached the final facility and is being sorted for delivery.",
    tone: "progress",
    icon: Warehouse,
  },
  out_for_delivery: {
    label: "Out for delivery",
    short: "Out for delivery",
    headline: "OUT FOR DELIVERY",
    description: "The parcel is loaded on a delivery round and is due today.",
    tone: "active",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    short: "Delivered",
    headline: "DELIVERED",
    description: "The parcel has been delivered and proof of delivery is available.",
    tone: "success",
    icon: PackageCheck,
  },
  delayed: {
    label: "Delayed",
    short: "Delayed",
    headline: "DELAYED",
    description: "The parcel is still moving but is running behind its estimated delivery.",
    tone: "warning",
    icon: Clock,
  },
  exception: {
    label: "Exception",
    short: "Exception",
    headline: "EXCEPTION",
    description: "Something needs attention before the parcel can continue to the recipient.",
    tone: "danger",
    icon: AlertTriangle,
  },
};

/** Badge styling per tone. Paired with a label and a shape — never colour alone. */
export const toneClasses: Record<StatusTone, string> = {
  neutral: "bg-surface-3 text-ink-muted border-line",
  progress: "bg-info-soft text-info border-info/30",
  active: "bg-accent-soft text-accent-soft-ink border-accent-line",
  success: "bg-success-soft text-success border-success/30",
  warning: "bg-warning-soft text-warning border-warning/30",
  danger: "bg-danger-soft text-danger border-danger/30",
};

/** Dot/marker fill per tone, for timelines and route markers. */
export const toneDotClasses: Record<StatusTone, string> = {
  neutral: "bg-line-strong",
  progress: "bg-info",
  active: "bg-accent",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

const OVERLAY_STATUSES = new Set<ShipmentStatus>(["delayed", "exception"]);

/** `delayed` and `exception` describe a problem, not a position on the route. */
export function isOverlayStatus(status: ShipmentStatus): boolean {
  return OVERLAY_STATUSES.has(status);
}

export function isLifecycleStage(status: ShipmentStatus): status is LifecycleStage {
  return !OVERLAY_STATUSES.has(status);
}

/** How far along the seven-step lifecycle a shipment has actually got. */
export function stageOf(shipment: Shipment): LifecycleStage {
  const last = shipment.events[shipment.events.length - 1];
  return last ? last.stage : "created";
}

export function stageIndex(stage: LifecycleStage): number {
  return LIFECYCLE_STAGES.indexOf(stage);
}

/** 0–1 progress along the lifecycle, used by progress rails and route artwork. */
export function progressOf(shipment: Shipment): number {
  return stageIndex(stageOf(shipment)) / (LIFECYCLE_STAGES.length - 1);
}

export const stageLabels: Record<LifecycleStage, string> = {
  created: "Order created",
  picked_up: "Picked up",
  origin_facility: "At origin facility",
  in_transit: "In transit",
  destination_facility: "At destination facility",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
};

/* ------------------------------------------------------------------ *
 * Filters
 * ------------------------------------------------------------------ */

export const STATUS_FILTERS = [
  "all",
  "in_transit",
  "out_for_delivery",
  "delivered",
  "delayed",
  "exception",
] as const;

export type StatusFilter = (typeof STATUS_FILTERS)[number];

/**
 * Operational groupings. "In transit" covers everything that is moving but not
 * yet on a delivery round, which is how dispatchers actually read a board.
 */
export const statusFilterGroups: Record<StatusFilter, ShipmentStatus[]> = {
  all: [],
  in_transit: ["created", "picked_up", "origin_facility", "in_transit", "destination_facility"],
  out_for_delivery: ["out_for_delivery"],
  delivered: ["delivered"],
  delayed: ["delayed"],
  exception: ["exception"],
};

export const statusFilterLabels: Record<StatusFilter, string> = {
  all: "All",
  in_transit: "In transit",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  delayed: "Delayed",
  exception: "Exception",
};

export function matchesStatusFilter(status: ShipmentStatus, filter: StatusFilter): boolean {
  if (filter === "all") return true;
  return statusFilterGroups[filter].includes(status);
}

export function isStatusFilter(value: string | undefined): value is StatusFilter {
  return value !== undefined && (STATUS_FILTERS as readonly string[]).includes(value);
}

/* ------------------------------------------------------------------ *
 * Transitions
 * ------------------------------------------------------------------ */

/**
 * Which actions the operations workspace offers for a shipment.
 *
 * A shipment only ever moves forward through the lifecycle; `delayed` and
 * `exception` can be raised at any point before delivery, and delivery is
 * terminal.
 */
export function availableActions(shipment: Shipment): {
  advance: LifecycleStage | null;
  canDeliver: boolean;
  canFlagException: boolean;
  canFlagDelay: boolean;
} {
  const stage = stageOf(shipment);
  const index = stageIndex(stage);
  const delivered = stage === "delivered";
  const next = delivered ? null : LIFECYCLE_STAGES[index + 1];

  return {
    advance: next && next !== "delivered" ? next : null,
    canDeliver: !delivered,
    canFlagException: !delivered && shipment.status !== "exception",
    canFlagDelay: !delivered && shipment.status !== "delayed",
  };
}
