import { requireFacility } from "./facilities";
import {
  LIFECYCLE_STAGES,
  type LifecycleStage,
  type PackageKind,
  type ProofOfDelivery,
  type ServiceLevel,
  type Shipment,
  type ShipmentStatus,
  type TrackingEvent,
} from "./types";

/**
 * The shipment dataset — the single source of truth.
 *
 * Public tracking (`/tracking/[trackingNumber]`) and the operations workspace
 * (`/shipments/[id]`) both read these records; neither keeps its own copy.
 *
 * Records are *built* rather than hand-written so that a shipment's status,
 * current location and event history can never disagree: `status` is the last
 * event's status and `currentLocation` is the last event's location, by
 * construction. Each spec below only states where a shipment has got to.
 */

type ShipmentSpec = {
  id: string;
  trackingNumber: string;
  customerId: string;
  recipient: { name: string; company: string | null };
  /** Origin first, destination last; anything between is an intermediate hop. */
  route: string[];
  service: ServiceLevel;
  package: { kind: PackageKind; pieces: number; weightKg: number; dimensions: string };
  /** ISO-8601 UTC. Every later timestamp is derived from this. */
  createdAt: string;
  eta: string;
  /** How far along the lifecycle this shipment has actually got. */
  reached: LifecycleStage;
  /** Overlay state raised at `reached`, if any. */
  overlay?: { status: Extract<ShipmentStatus, "delayed" | "exception">; description: string };
  proofOfDelivery?: ProofOfDelivery;
  notes?: { id: string; at: string; author: string; body: string }[];
};

/**
 * Hours between consecutive scans, cycled per service level. Authored rather
 * than uniform so timelines read like real operational data.
 */
const SERVICE_GAPS: Record<ServiceLevel, number[]> = {
  same_day: [1, 1, 2, 2, 1, 1],
  express: [3, 2, 4, 5, 5, 4],
  standard: [6, 5, 11, 11, 8, 6],
  freight: [8, 6, 16, 16, 12, 8],
  returns: [7, 6, 13, 12, 8, 6],
};

export const serviceLabels: Record<ServiceLevel, string> = {
  same_day: "Same-Day",
  express: "Express",
  standard: "Standard",
  freight: "Freight",
  returns: "Returns",
};

export const packageKindLabels: Record<PackageKind, string> = {
  envelope: "Envelope",
  parcel: "Parcel",
  box: "Box",
  pallet: "Pallet",
  crate: "Crate",
};

function addHours(iso: string, hours: number): string {
  const base = new Date(iso).getTime();
  return new Date(base + hours * 3_600_000).toISOString();
}

/** A stable vehicle/route label for delivery scans. Cosmetic, deterministic. */
function vehicleLabel(trackingNumber: string, facilityCode: string): string {
  const digits = trackingNumber.replace(/\D/g, "");
  const run = (Number(digits.slice(-3)) % 60) + 10;
  return `${facilityCode}-${String(run).padStart(2, "0")}`;
}

/**
 * Expands a spec into the full event history.
 *
 * The shape is always: created → picked up → origin facility → one transit scan
 * per intermediate hop (at least one) → destination facility → out for delivery
 * → delivered, truncated at the stage the shipment has actually reached.
 */
function buildEvents(spec: ShipmentSpec): TrackingEvent[] {
  const origin = requireFacility(spec.route[0]);
  const destination = requireFacility(spec.route[spec.route.length - 1]);
  const intermediates = spec.route.slice(1, -1).map(requireFacility);

  type Draft = Omit<TrackingEvent, "id" | "at">;
  const drafts: Draft[] = [
    {
      stage: "created",
      status: "created",
      facilityId: null,
      location: origin.city,
      description: "Shipment details received. Label created and manifest lodged.",
    },
    {
      stage: "picked_up",
      status: "picked_up",
      facilityId: null,
      location: origin.city,
      description: `Collected from shipper in ${origin.city} by Parcel courier.`,
    },
    {
      stage: "origin_facility",
      status: "origin_facility",
      facilityId: origin.id,
      location: origin.name,
      description: `Arrived and scanned at origin facility ${origin.name} (${origin.code}).`,
    },
  ];

  if (intermediates.length === 0) {
    drafts.push({
      stage: "in_transit",
      status: "in_transit",
      facilityId: null,
      location: `${origin.city} → ${destination.city}`,
      description: `Departed ${origin.code}. In transit to ${destination.name}.`,
    });
  } else {
    for (const hop of intermediates) {
      drafts.push({
        stage: "in_transit",
        status: "in_transit",
        facilityId: hop.id,
        location: hop.name,
        description: `Processed through ${hop.name} (${hop.code}) and departed on the trunk leg.`,
      });
    }
  }

  drafts.push(
    {
      stage: "destination_facility",
      status: "destination_facility",
      facilityId: destination.id,
      location: destination.name,
      description: `Arrived at destination facility ${destination.name} (${destination.code}). Sorted for final delivery.`,
    },
    {
      stage: "out_for_delivery",
      status: "out_for_delivery",
      facilityId: destination.id,
      location: destination.city,
      description: `Loaded and out for delivery on route ${vehicleLabel(
        spec.trackingNumber,
        destination.code,
      )}.`,
    },
    {
      stage: "delivered",
      status: "delivered",
      facilityId: null,
      location: `${destination.city} — ${spec.recipient.company ?? "residential"}`,
      description: spec.proofOfDelivery
        ? `Delivered and signed for by ${spec.proofOfDelivery.receivedBy}.`
        : "Delivered.",
    },
  );

  // Truncate at the stage this shipment has actually reached.
  const cutoff = LIFECYCLE_STAGES.indexOf(spec.reached);
  const kept = drafts.filter((draft) => LIFECYCLE_STAGES.indexOf(draft.stage) <= cutoff);

  const gaps = SERVICE_GAPS[spec.service];
  const events: TrackingEvent[] = kept.map((draft, index) => {
    let hours = 0;
    for (let step = 0; step < index; step += 1) hours += gaps[step % gaps.length];
    return {
      ...draft,
      id: `${spec.id}-ev-${String(index + 1).padStart(2, "0")}`,
      at: addHours(spec.createdAt, hours),
    };
  });

  if (spec.overlay) {
    const previous = events[events.length - 1];
    let hours = 0;
    for (let step = 0; step < events.length; step += 1) hours += gaps[step % gaps.length];
    events.push({
      id: `${spec.id}-ev-${String(events.length + 1).padStart(2, "0")}`,
      at: addHours(spec.createdAt, hours),
      stage: previous.stage,
      status: spec.overlay.status,
      facilityId: previous.facilityId,
      location: previous.location,
      description: spec.overlay.description,
    });
  }

  return events;
}

function build(spec: ShipmentSpec): Shipment {
  const events = buildEvents(spec);
  const last = events[events.length - 1];
  return {
    id: spec.id,
    trackingNumber: spec.trackingNumber,
    customerId: spec.customerId,
    recipient: spec.recipient,
    originId: spec.route[0],
    destinationId: spec.route[spec.route.length - 1],
    service: spec.service,
    package: spec.package,
    createdAt: spec.createdAt,
    eta: spec.eta,
    // Derived, never authored twice: the record cannot contradict its history.
    status: last.status,
    currentLocation: last.location,
    routeFacilityIds: spec.route,
    events,
    proofOfDelivery: spec.reached === "delivered" ? (spec.proofOfDelivery ?? null) : null,
    notes: spec.notes ?? [],
  };
}

const specs: ShipmentSpec[] = [
  {
    id: "shp-10482",
    trackingNumber: "PKL-10482",
    customerId: "cus-lumen",
    recipient: { name: "Harriet Poole", company: "Poole & Daughters" },
    route: ["fac-ald", "fac-vnt", "fac-kgm"],
    service: "express",
    package: { kind: "box", pieces: 2, weightKg: 8.4, dimensions: "48 × 36 × 30 cm" },
    createdAt: "2026-08-16T08:20:00.000Z",
    eta: "2026-08-18T17:00:00.000Z",
    reached: "in_transit",
    notes: [
      {
        id: "shp-10482-n1",
        at: "2026-08-16T12:02:00.000Z",
        author: "Priya Raman",
        body: "Customer asked for delivery after 13:00. Flagged to Kingsmere dispatch.",
      },
    ],
  },
  {
    id: "shp-20841",
    trackingNumber: "PKL-20841",
    customerId: "cus-northfield",
    recipient: { name: "Emil Vasquez", company: "Eastmoor Works" },
    route: ["fac-nwk", "fac-ald", "fac-emr"],
    service: "standard",
    package: { kind: "crate", pieces: 1, weightKg: 34.0, dimensions: "90 × 60 × 55 cm" },
    createdAt: "2026-08-14T09:05:00.000Z",
    eta: "2026-08-17T18:00:00.000Z",
    reached: "out_for_delivery",
  },
  {
    id: "shp-31765",
    trackingNumber: "PKL-31765",
    customerId: "cus-halcyon",
    recipient: { name: "Dr. Anaya Sharma", company: "Aldermere Research Park" },
    route: ["fac-emr", "fac-lnt", "fac-ald"],
    service: "express",
    package: { kind: "parcel", pieces: 1, weightKg: 3.2, dimensions: "34 × 28 × 18 cm" },
    createdAt: "2026-08-15T07:40:00.000Z",
    eta: "2026-08-16T18:00:00.000Z",
    reached: "delivered",
    proofOfDelivery: {
      deliveredAt: "2026-08-16T06:40:00.000Z",
      receivedBy: "A. Sharma",
      signatureInitials: "AS",
      location: "Aldermere Research Park — Goods In",
      method: "signature",
      packageCondition: "good",
      note: "Temperature strip checked on receipt and within range.",
    },
  },
  {
    id: "shp-44120",
    trackingNumber: "PKL-44120",
    customerId: "cus-tidewell",
    recipient: { name: "Grethe Lund", company: "Aldermere Chandlery" },
    route: ["fac-pkl", "fac-vnt", "fac-ald"],
    service: "standard",
    package: { kind: "box", pieces: 3, weightKg: 21.6, dimensions: "60 × 40 × 40 cm" },
    createdAt: "2026-08-13T10:15:00.000Z",
    eta: "2026-08-18T18:00:00.000Z",
    reached: "in_transit",
    overlay: {
      status: "delayed",
      description:
        "Trunk leg held at Vantry: road closure on the northbound approach. Rebooked to the next departure; estimated delivery moved out by one day.",
    },
    notes: [
      {
        id: "shp-44120-n1",
        at: "2026-08-15T09:20:00.000Z",
        author: "Devon Marsh",
        body: "Customer notified of the revised ETA by phone. No further action requested.",
      },
    ],
  },
  {
    id: "shp-58291",
    trackingNumber: "PKL-58291",
    customerId: "cus-fernpost",
    recipient: { name: "Milo Chen", company: null },
    route: ["fac-vnt", "fac-kgm"],
    service: "same_day",
    package: { kind: "envelope", pieces: 1, weightKg: 0.4, dimensions: "35 × 25 × 2 cm" },
    createdAt: "2026-08-17T06:30:00.000Z",
    eta: "2026-08-17T20:00:00.000Z",
    reached: "out_for_delivery",
    overlay: {
      status: "exception",
      description:
        "Delivery attempted — no safe place available and no answer at the address. Parcel returned to Kingsmere for a second attempt.",
    },
    notes: [
      {
        id: "shp-58291-n1",
        at: "2026-08-17T13:10:00.000Z",
        author: "Priya Raman",
        body: "Recipient asked to reattempt tomorrow morning. Second attempt scheduled.",
      },
    ],
  },
  {
    id: "shp-69314",
    trackingNumber: "PKL-69314",
    customerId: "cus-orrery",
    recipient: { name: "Teodor Ilic", company: "Norwick Observatory" },
    route: ["fac-lnt", "fac-ald", "fac-nwk"],
    service: "standard",
    package: { kind: "crate", pieces: 1, weightKg: 47.5, dimensions: "120 × 70 × 65 cm" },
    createdAt: "2026-08-12T11:00:00.000Z",
    eta: "2026-08-15T18:00:00.000Z",
    reached: "delivered",
    proofOfDelivery: {
      deliveredAt: "2026-08-14T10:00:00.000Z",
      receivedBy: "T. Ilic",
      signatureInitials: "TI",
      location: "Norwick Observatory — Loading Bay 2",
      method: "signature",
      packageCondition: "good",
      note: "Two-person handling used as instructed. Crate seals intact.",
    },
  },
  {
    id: "shp-71203",
    trackingNumber: "PKL-71203",
    customerId: "cus-lumen",
    recipient: { name: "Farida Osei", company: "Eastmoor Interiors" },
    route: ["fac-ald", "fac-lnt", "fac-emr"],
    service: "standard",
    package: { kind: "box", pieces: 4, weightKg: 16.2, dimensions: "55 × 45 × 35 cm" },
    createdAt: "2026-08-15T13:25:00.000Z",
    eta: "2026-08-19T18:00:00.000Z",
    reached: "in_transit",
  },
  {
    id: "shp-82640",
    trackingNumber: "PKL-82640",
    customerId: "cus-northfield",
    recipient: { name: "Bram Kessler", company: "Aldermere Plant Hire" },
    route: ["fac-nwk", "fac-sbr", "fac-ald"],
    service: "freight",
    package: { kind: "pallet", pieces: 2, weightKg: 412.0, dimensions: "120 × 100 × 150 cm" },
    createdAt: "2026-08-11T06:00:00.000Z",
    // Missed its window — the on-time metric would otherwise read a flat 100%.
    eta: "2026-08-13T17:00:00.000Z",
    reached: "delivered",
    proofOfDelivery: {
      deliveredAt: "2026-08-14T00:00:00.000Z",
      receivedBy: "B. Kessler",
      signatureInitials: "BK",
      location: "Aldermere Plant Hire — Yard",
      method: "signature",
      packageCondition: "good",
      note: "Tail-lift delivery. Both pallets shrink-wrapped and banded on arrival.",
    },
  },
  {
    id: "shp-93518",
    trackingNumber: "PKL-93518",
    customerId: "cus-mirette",
    recipient: { name: "Odile Ferrand", company: null },
    route: ["fac-kgm", "fac-vnt"],
    service: "same_day",
    package: { kind: "parcel", pieces: 1, weightKg: 1.1, dimensions: "30 × 24 × 12 cm" },
    createdAt: "2026-08-17T07:10:00.000Z",
    eta: "2026-08-17T19:00:00.000Z",
    reached: "picked_up",
  },
  {
    id: "shp-14027",
    trackingNumber: "PKL-14027",
    customerId: "cus-halcyon",
    recipient: { name: "Ines Duarte", company: "Vantry Teaching Hospital" },
    route: ["fac-emr", "fac-lnt", "fac-vnt"],
    service: "express",
    package: { kind: "parcel", pieces: 1, weightKg: 2.7, dimensions: "32 × 26 × 20 cm" },
    createdAt: "2026-08-16T05:45:00.000Z",
    eta: "2026-08-17T18:00:00.000Z",
    reached: "destination_facility",
  },
  {
    id: "shp-25839",
    trackingNumber: "PKL-25839",
    customerId: "cus-lumen",
    recipient: { name: "Callum Reyes", company: null },
    route: ["fac-ald", "fac-vnt"],
    service: "express",
    package: { kind: "box", pieces: 1, weightKg: 6.9, dimensions: "44 × 34 × 28 cm" },
    createdAt: "2026-08-16T09:30:00.000Z",
    eta: "2026-08-17T17:00:00.000Z",
    reached: "out_for_delivery",
  },
  {
    id: "shp-36470",
    trackingNumber: "PKL-36470",
    customerId: "cus-fernpost",
    recipient: { name: "Saoirse Whelan", company: "Kingsmere Library" },
    route: ["fac-vnt", "fac-kgm"],
    service: "standard",
    package: { kind: "box", pieces: 2, weightKg: 11.8, dimensions: "50 × 38 × 30 cm" },
    createdAt: "2026-08-15T08:00:00.000Z",
    eta: "2026-08-17T18:00:00.000Z",
    reached: "delivered",
    proofOfDelivery: {
      deliveredAt: "2026-08-17T07:00:00.000Z",
      receivedBy: "S. Whelan",
      signatureInitials: "SW",
      location: "Kingsmere Library — Front Desk",
      method: "front_desk",
      packageCondition: "good",
      note: "Left with the front desk as agreed on the account delivery profile.",
    },
  },
  {
    id: "shp-47182",
    trackingNumber: "PKL-47182",
    customerId: "cus-quarrow",
    recipient: { name: "Hana Petrova", company: "Aldermere Bonded Store" },
    route: ["fac-dry", "fac-lnt", "fac-ald"],
    service: "freight",
    package: { kind: "pallet", pieces: 6, weightKg: 980.0, dimensions: "120 × 100 × 180 cm" },
    createdAt: "2026-08-14T04:20:00.000Z",
    eta: "2026-08-20T17:00:00.000Z",
    reached: "in_transit",
    notes: [
      {
        id: "shp-47182-n1",
        at: "2026-08-15T08:45:00.000Z",
        author: "Devon Marsh",
        body: "Customs paperwork cleared at Draymouth. Trunk leg running to plan.",
      },
    ],
  },
  {
    id: "shp-51963",
    trackingNumber: "PKL-51963",
    customerId: "cus-mirette",
    recipient: { name: "Junie Abara", company: "Calder Bay Boutique" },
    route: ["fac-kgm", "fac-cby"],
    service: "standard",
    package: { kind: "box", pieces: 1, weightKg: 4.3, dimensions: "40 × 30 × 25 cm" },
    createdAt: "2026-08-17T09:50:00.000Z",
    eta: "2026-08-20T18:00:00.000Z",
    reached: "created",
  },
  {
    id: "shp-62074",
    trackingNumber: "PKL-62074",
    customerId: "cus-tidewell",
    recipient: { name: "Ravi Anand", company: "Calder Bay Marina" },
    route: ["fac-pkl", "fac-cby"],
    service: "standard",
    package: { kind: "crate", pieces: 1, weightKg: 62.5, dimensions: "140 × 60 × 60 cm" },
    createdAt: "2026-08-16T14:05:00.000Z",
    eta: "2026-08-19T18:00:00.000Z",
    reached: "origin_facility",
  },
  {
    id: "shp-73415",
    trackingNumber: "PKL-73415",
    customerId: "cus-orrery",
    recipient: { name: "Mireille Sackville", company: "Eastmoor Optics" },
    route: ["fac-lnt", "fac-emr"],
    service: "express",
    package: { kind: "parcel", pieces: 1, weightKg: 1.9, dimensions: "28 × 22 × 16 cm" },
    createdAt: "2026-08-16T06:15:00.000Z",
    eta: "2026-08-17T16:00:00.000Z",
    reached: "delivered",
    proofOfDelivery: {
      deliveredAt: "2026-08-17T05:15:00.000Z",
      receivedBy: "M. Sackville",
      signatureInitials: "MS",
      location: "Eastmoor Optics — Reception",
      method: "signature",
      packageCondition: "good",
      note: "Fragile handling label intact. Recipient checked contents before signing.",
    },
  },
  {
    id: "shp-84526",
    trackingNumber: "PKL-84526",
    customerId: "cus-quarrow",
    recipient: { name: "Oskar Lindqvist", company: "Port Kestrel Bonded Yard" },
    route: ["fac-dry", "fac-pkl"],
    service: "freight",
    package: { kind: "pallet", pieces: 3, weightKg: 640.0, dimensions: "120 × 100 × 160 cm" },
    createdAt: "2026-08-13T05:30:00.000Z",
    eta: "2026-08-19T17:00:00.000Z",
    reached: "in_transit",
    overlay: {
      status: "exception",
      description:
        "Consignment held at the gateway: commercial invoice does not match the manifest weight. Awaiting corrected paperwork from the shipper.",
    },
    notes: [
      {
        id: "shp-84526-n1",
        at: "2026-08-14T11:30:00.000Z",
        author: "Devon Marsh",
        body: "Chased Quarrow ops for a corrected invoice. Second reminder sent.",
      },
      {
        id: "shp-84526-n2",
        at: "2026-08-16T09:05:00.000Z",
        author: "Imani Okafor",
        body: "Escalated to the account manager. Storage charges paused meanwhile.",
      },
    ],
  },
  {
    id: "shp-95638",
    trackingNumber: "PKL-95638",
    customerId: "cus-halcyon",
    recipient: { name: "Halcyon Returns Desk", company: "Halcyon Labs" },
    route: ["fac-emr", "fac-ald", "fac-vnt"],
    service: "returns",
    package: { kind: "parcel", pieces: 1, weightKg: 2.2, dimensions: "30 × 24 × 18 cm" },
    createdAt: "2026-08-15T10:40:00.000Z",
    eta: "2026-08-17T18:00:00.000Z",
    reached: "delivered",
    proofOfDelivery: {
      deliveredAt: "2026-08-17T14:40:00.000Z",
      receivedBy: "Returns Desk",
      signatureInitials: "HL",
      location: "Vantry Returns Hub — Bay 4",
      method: "front_desk",
      packageCondition: "minor_damage",
      note: "Outer carton scuffed in transit. Contents logged as intact by the returns team.",
    },
  },
];

export const shipments: Shipment[] = specs.map(build);

/** Tracking numbers surfaced on the public site as worked examples. */
export const featuredTrackingNumbers = [
  "PKL-10482",
  "PKL-20841",
  "PKL-31765",
  "PKL-44120",
  "PKL-58291",
  "PKL-69314",
] as const;
