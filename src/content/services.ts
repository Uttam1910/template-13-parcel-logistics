import type { ServiceLevel } from "@/data/types";

export type ServiceContent = {
  id: ServiceLevel;
  name: string;
  summary: string;
  description: string;
  /** Operating characteristics — deliberately ranges, not guarantees. */
  characteristics: { label: string; value: string }[];
  idealFor: string[];
  cta: string;
};

/**
 * Service levels. Transit windows are stated as typical ranges rather than
 * promises: a template should not ship copy that reads as a contractual
 * guarantee.
 */
export const services: ServiceContent[] = [
  {
    id: "express",
    name: "Express Delivery",
    summary: "Priority handling on the fastest routing available.",
    description:
      "Express parcels are sorted ahead of standard volume at every facility and move on the first available trunk leg. Scans are more frequent, so the tracking timeline updates several times a day rather than once.",
    characteristics: [
      { label: "Typical transit", value: "1–2 working days" },
      { label: "Scan frequency", value: "Every facility touch" },
      { label: "Weight ceiling", value: "Up to 32 kg per piece" },
      { label: "Proof of delivery", value: "Signature captured" },
    ],
    idealFor: [
      "Time-sensitive replacement parts",
      "Clinical and laboratory samples",
      "High-value retail orders",
    ],
    cta: "Track an express shipment",
  },
  {
    id: "standard",
    name: "Standard Delivery",
    summary: "The default network service for everyday volume.",
    description:
      "Standard shipments consolidate through the regional hubs, which keeps cost down and capacity predictable. Most volume in the demo dataset moves on this service.",
    characteristics: [
      { label: "Typical transit", value: "2–4 working days" },
      { label: "Scan frequency", value: "Facility arrival and departure" },
      { label: "Weight ceiling", value: "Up to 32 kg per piece" },
      { label: "Proof of delivery", value: "Signature or agreed safe place" },
    ],
    idealFor: [
      "Ecommerce fulfilment",
      "Replenishment to retail locations",
      "General business-to-business parcels",
    ],
    cta: "Track a standard shipment",
  },
  {
    id: "same_day",
    name: "Same-Day",
    summary: "Point-to-point within a single metro area.",
    description:
      "Same-day work stays inside one region and skips the trunk network entirely: collected, sorted at the local depot, and out on a delivery round the same afternoon.",
    characteristics: [
      { label: "Typical transit", value: "Same working day" },
      { label: "Coverage", value: "Metro region only" },
      { label: "Weight ceiling", value: "Up to 15 kg per piece" },
      { label: "Proof of delivery", value: "Signature captured" },
    ],
    idealFor: [
      "Urgent documents between offices",
      "Pharmacy and dispensary transfers",
      "Studio and production deliveries",
    ],
    cta: "Track a same-day shipment",
  },
  {
    id: "freight",
    name: "Freight",
    summary: "Palletised and oversized consignments.",
    description:
      "Freight moves on scheduled trunk departures with tail-lift delivery and booked-in slots. Customs documentation is handled at the Draymouth gateway for international lanes.",
    characteristics: [
      { label: "Typical transit", value: "3–6 working days" },
      { label: "Unit", value: "Pallets, crates and oversized items" },
      { label: "Weight ceiling", value: "Up to 1,200 kg per consignment" },
      { label: "Proof of delivery", value: "Signature and condition report" },
    ],
    idealFor: [
      "Plant and machinery parts",
      "Bulk stock movements",
      "Cross-border consignments",
    ],
    cta: "Track a freight consignment",
  },
  {
    id: "returns",
    name: "Returns",
    summary: "Reverse logistics back to the shipper.",
    description:
      "Returns are collected from the recipient and routed to a nominated returns hub rather than a delivery address. Condition is recorded on arrival so the shipper can triage before the parcel is opened.",
    characteristics: [
      { label: "Typical transit", value: "2–4 working days" },
      { label: "Collection", value: "From the recipient's address" },
      { label: "Destination", value: "Nominated returns hub" },
      { label: "Proof of delivery", value: "Condition recorded on receipt" },
    ],
    idealFor: [
      "Ecommerce returns programmes",
      "Warranty and repair intake",
      "Reusable packaging recovery",
    ],
    cta: "Track a return",
  },
];
