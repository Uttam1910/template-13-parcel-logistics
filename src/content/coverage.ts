import type { RegionId, ServiceLevel } from "@/data/types";

export type CoverageStatus = "full" | "scheduled" | "partner";

export type CoverageRegion = {
  id: RegionId;
  name: string;
  status: CoverageStatus;
  /** Which service levels operate in this region. */
  services: ServiceLevel[];
  /** Illustrative transit range, expressed as a window rather than a promise. */
  transit: string;
  summary: string;
  hubs: string[];
};

export const coverageStatusLabels: Record<CoverageStatus, string> = {
  full: "Full network",
  scheduled: "Scheduled service",
  partner: "Partner delivered",
};

export const coverageStatusDescriptions: Record<CoverageStatus, string> = {
  full: "Own facilities, daily collections and every service level.",
  scheduled: "Own facilities on a fixed departure schedule rather than daily.",
  partner: "Final delivery handled by a nominated partner in the region.",
};

/**
 * Illustrative coverage for the fictional Parcel network. Transit ranges are
 * demo figures, not commitments, and the regions are invented.
 */
export const coverageRegions: CoverageRegion[] = [
  {
    id: "north",
    name: "North",
    status: "full",
    services: ["express", "standard", "freight", "returns"],
    transit: "1–3 working days",
    summary:
      "Anchored on the Norwick gateway with a crossdock at Sable Ridge feeding the northern lanes.",
    hubs: ["Norwick Gateway", "Sable Ridge Crossdock"],
  },
  {
    id: "central",
    name: "Central",
    status: "full",
    services: ["express", "standard", "same_day", "freight", "returns"],
    transit: "1–2 working days",
    summary:
      "The densest part of the network. Aldermere sorts the majority of national volume and Linthorpe balances the eastern lanes.",
    hubs: ["Aldermere Sort Center", "Linthorpe Regional Hub", "Eastmoor Delivery Station"],
  },
  {
    id: "metro",
    name: "Metro",
    status: "full",
    services: ["express", "standard", "same_day", "returns"],
    transit: "Same day – 2 working days",
    summary:
      "Same-day work runs point to point from the Vantry depot without touching the trunk network.",
    hubs: ["Vantry Metro Depot", "Kingsmere Delivery Station"],
  },
  {
    id: "coastal",
    name: "Coastal",
    status: "scheduled",
    services: ["standard", "freight", "returns"],
    transit: "2–4 working days",
    summary:
      "Served on fixed departures from Port Kestrel. Freight and palletised consignments dominate the lane.",
    hubs: ["Port Kestrel Freight Terminal", "Calder Bay Delivery Station"],
  },
  {
    id: "international",
    name: "International",
    status: "partner",
    services: ["standard", "freight"],
    transit: "3–6 working days",
    summary:
      "Cleared at the Draymouth gateway, then handed to a nominated partner for final delivery.",
    hubs: ["Draymouth International Gateway"],
  },
];
