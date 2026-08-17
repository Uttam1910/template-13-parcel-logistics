import { Boxes, Radar, ScanLine, ShieldCheck, Signpost, Workflow } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const hero = {
  eyebrow: "Shipment tracking & delivery operations",
  headline: "Every shipment. One clear view.",
  body: "Track shipments, understand delivery progress, and keep operations moving from pickup to proof of delivery — on one record that the recipient and the depot both read.",
  primaryCta: { label: "Track a shipment", href: "/tracking" as const },
  secondaryCta: { label: "Explore the platform", href: "/dashboard" as const },
} as const;

export const howItWorks: { step: string; title: string; body: string; icon: LucideIcon }[] = [
  {
    step: "01",
    title: "Every touch is a scan",
    body: "Collection, facility arrivals, trunk departures and the delivery round each write an event with a location and a description.",
    icon: ScanLine,
  },
  {
    step: "02",
    title: "Scans become a route",
    body: "Events resolve to named facilities, so the shipment's path renders as a route through the network rather than a list of codes.",
    icon: Signpost,
  },
  {
    step: "03",
    title: "Status explains itself",
    body: "Delays and exceptions sit on the timeline with the reason attached, at the stage where they happened.",
    icon: Radar,
  },
  {
    step: "04",
    title: "Delivery closes the record",
    body: "Proof of delivery captures who received the parcel, where, how, and the condition it arrived in.",
    icon: ShieldCheck,
  },
];

export const visibility: { title: string; body: string; icon: LucideIcon }[] = [
  {
    title: "One shipment model",
    body: "Public tracking and the operations workspace read the same record. There is no second copy to drift out of date.",
    icon: Boxes,
  },
  {
    title: "Actions that actually change things",
    body: "Advance a stage, flag a delay, raise an exception or complete delivery — the timeline, proof of delivery and dashboard counts all follow.",
    icon: Workflow,
  },
  {
    title: "Built to be replaced",
    body: "The dataset sits behind one lookup module. Swap it for a carrier API and nothing above it has to change shape.",
    icon: Radar,
  },
];

export const useCases = [
  {
    title: "Courier and last-mile",
    body: "Work the exception queue, not the happy path. Failed attempts and safe-place decisions are recorded against the shipment.",
  },
  {
    title: "Ecommerce fulfilment",
    body: "Give buyers a tracking page that reads in plain English and works on a phone.",
  },
  {
    title: "Freight and consolidation",
    body: "Palletised consignments carry piece counts, weights and gateway clearance on the same timeline.",
  },
  {
    title: "Network operations",
    body: "One dashboard for active volume, out-for-delivery queues, exceptions and on-time rate.",
  },
];

export const closing = {
  headline: "See it with real demo data.",
  body: "Six worked tracking numbers, eighteen shipments across ten facilities, and an operations workspace where every control does something.",
  primaryCta: { label: "Track a shipment", href: "/tracking" as const },
  secondaryCta: { label: "Open the dashboard", href: "/dashboard" as const },
} as const;

/**
 * Section headings for the homepage. The `title` values that carry an anchor id
 * are composed in the page; everything textual lives here.
 */
export const sections = {
  tracking: {
    eyebrow: "Tracking",
    title: "Track a shipment right now.",
    body: "Six worked tracking numbers ship with this template. Enter one — or anything else — and see exactly how a hit and a miss are handled.",
  },
  how: {
    eyebrow: "How it works",
    title: "From a scan to something a person can read.",
    body: "Four steps turn raw network events into a tracking page that explains itself.",
  },
  lifecycle: {
    eyebrow: "Shipment lifecycle",
    title: "Seven stages, always visible.",
    body: "A shipment only ever moves forward. Delays and exceptions are raised at the stage where they happened, so the rail shows both where a parcel is and where it stalled.",
  },
  route: {
    eyebrow: "Route",
    title: "The path, not a pin on a map.",
    body: "Facilities are real nodes in the network with a name, a code and a role. The route diagram draws the legs a parcel actually travels — completed, active and still to come.",
  },
  visibility: {
    eyebrow: "Operational visibility",
    title: "One record. Two audiences.",
    body: "The recipient sees the timeline. The depot sees the timeline plus the notes, the actions and the exception queue.",
  },
  services: {
    eyebrow: "Services",
    title: "Five service levels.",
    body: "Each with its own routing behaviour, scan cadence and proof-of-delivery treatment.",
  },
  coverage: {
    eyebrow: "Coverage",
    title: "Five regions, ten facilities.",
    body: "Gateways, sort centers, regional hubs, crossdocks and delivery stations — drawn as one network diagram rather than five disconnected lists.",
  },
  performance: {
    eyebrow: "Performance",
    title: "Measured, not asserted.",
    body: "Illustrative figures for the demo network. The operations workspace computes the same shapes from the shipment records themselves.",
  },
  useCases: {
    eyebrow: "Who it's for",
    title: "Built for the people moving the boxes.",
  },
} as const;
