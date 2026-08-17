/**
 * Parcel — domain types.
 *
 * These types describe the entire demo dataset. There is no database and no
 * carrier API: `src/data/*.ts` holds deterministic, typed records that both the
 * public tracking experience and the internal operations workspace read from.
 *
 * When you connect a real carrier or WMS later, keep these shapes and replace
 * the module bodies in `src/data` with fetches — see `src/lib/shipments.ts`,
 * which is the only place lookups happen.
 */

/** The date the demo dataset is anchored to. Nothing calls `Date.now()`. */
export const DEMO_TODAY = "2026-08-17";

/* ------------------------------------------------------------------ *
 * Status
 * ------------------------------------------------------------------ */

/**
 * The seven steps every shipment moves through, in order. A shipment's position
 * in this list is its *stage*; it only ever moves forwards.
 */
export const LIFECYCLE_STAGES = [
  "created",
  "picked_up",
  "origin_facility",
  "in_transit",
  "destination_facility",
  "out_for_delivery",
  "delivered",
] as const;

export type LifecycleStage = (typeof LIFECYCLE_STAGES)[number];

/**
 * Every status a shipment can report. The first seven mirror the lifecycle;
 * `delayed` and `exception` are overlay states that can occur at any stage
 * without moving the shipment backwards.
 */
export const SHIPMENT_STATUSES = [...LIFECYCLE_STAGES, "delayed", "exception"] as const;

export type ShipmentStatus = (typeof SHIPMENT_STATUSES)[number];

/** Visual/semantic weight of a status. Never the only signal — labels always accompany it. */
export type StatusTone = "neutral" | "progress" | "active" | "success" | "warning" | "danger";

/* ------------------------------------------------------------------ *
 * Network
 * ------------------------------------------------------------------ */

export const REGIONS = ["north", "central", "coastal", "metro", "international"] as const;
export type RegionId = (typeof REGIONS)[number];

export type FacilityKind =
  | "gateway"
  | "sort_center"
  | "regional_hub"
  | "delivery_station"
  | "crossdock"
  | "freight_terminal";

/**
 * A node in the Parcel network.
 *
 * `point` is an abstract coordinate in a 0–100 square — it is *not* latitude and
 * longitude, and the route/coverage artwork is explicitly labelled as a demo
 * visualisation rather than a map.
 */
export type Facility = {
  id: string;
  code: string;
  name: string;
  city: string;
  region: RegionId;
  kind: FacilityKind;
  point: { x: number; y: number };
  /** Illustrative daily throughput, used on the coverage and about pages. */
  dailyVolume: number;
};

/* ------------------------------------------------------------------ *
 * Shipments
 * ------------------------------------------------------------------ */

export const SERVICE_LEVELS = [
  "express",
  "standard",
  "same_day",
  "freight",
  "returns",
] as const;
export type ServiceLevel = (typeof SERVICE_LEVELS)[number];

export type PackageKind = "envelope" | "parcel" | "box" | "pallet" | "crate";

export type TrackingEvent = {
  id: string;
  /** ISO-8601, UTC. Deterministic — authored, never generated at runtime. */
  at: string;
  stage: LifecycleStage;
  /** Usually mirrors `stage`; `delayed` / `exception` mark a problem at that stage. */
  status: ShipmentStatus;
  facilityId: string | null;
  location: string;
  description: string;
};

export type ProofOfDelivery = {
  deliveredAt: string;
  /** Who physically took the parcel. Fictional. */
  receivedBy: string;
  /** Initials rendered as the signature-style demo mark. */
  signatureInitials: string;
  location: string;
  method: "signature" | "left_with_neighbour" | "safe_place" | "front_desk";
  packageCondition: "good" | "minor_damage" | "damaged";
  note: string;
};

export type Shipment = {
  id: string;
  trackingNumber: string;
  customerId: string;
  /** The person receiving the parcel. Fictional. */
  recipient: { name: string; company: string | null };
  originId: string;
  destinationId: string;
  service: ServiceLevel;
  package: { kind: PackageKind; pieces: number; weightKg: number; dimensions: string };
  /** ISO date the shipment record was created. */
  createdAt: string;
  /** ISO date-time of the estimated delivery. */
  eta: string;
  status: ShipmentStatus;
  /** Free-text current position, e.g. "Vantry Metro Depot". */
  currentLocation: string;
  /** Facilities the parcel routes through, origin and destination included. */
  routeFacilityIds: string[];
  events: TrackingEvent[];
  proofOfDelivery: ProofOfDelivery | null;
  /** Operational notes authored by the demo ops team. */
  notes: { id: string; at: string; author: string; body: string }[];
};

/* ------------------------------------------------------------------ *
 * Customers
 * ------------------------------------------------------------------ */

export type CustomerTier = "enterprise" | "business" | "starter";
export type CustomerStatus = "active" | "onboarding" | "paused";

export type Customer = {
  id: string;
  name: string;
  slug: string;
  industry: string;
  tier: CustomerTier;
  status: CustomerStatus;
  since: string;
  contact: { name: string; email: string; phone: string };
  address: { line: string; city: string; region: RegionId };
  /** Illustrative contract figures. */
  monthlyVolume: number;
  accountManager: string;
};

/* ------------------------------------------------------------------ *
 * Users
 * ------------------------------------------------------------------ */

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  initials: string;
  facilityId: string;
};
