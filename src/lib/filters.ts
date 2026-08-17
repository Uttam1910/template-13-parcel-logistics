import type { Shipment } from "@/data/types";
import { requireCustomer } from "@/data/customers";
import { requireFacility } from "@/data/facilities";
import { matchesStatusFilter, stageIndex, stageOf, type StatusFilter } from "./status";

/**
 * Shipment search, filtering and sorting.
 *
 * Pure functions over an array so the same logic runs on the server for the
 * initial render and in the browser once local demo edits are merged in — the
 * two can never disagree about what "delivered" means.
 */

export const SORT_OPTIONS = ["latest", "eta", "status"] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

export const sortLabels: Record<SortOption, string> = {
  latest: "Latest",
  eta: "ETA",
  status: "Status",
};

export function isSortOption(value: string | undefined): value is SortOption {
  return value !== undefined && (SORT_OPTIONS as readonly string[]).includes(value);
}

export type ShipmentQuery = {
  search: string;
  status: StatusFilter;
  sort: SortOption;
};

export const defaultQuery: ShipmentQuery = { search: "", status: "all", sort: "latest" };

/** Searches tracking number, customer name, recipient and destination. */
function matchesSearch(shipment: Shipment, search: string): boolean {
  const needle = search.trim().toLowerCase();
  if (!needle) return true;

  const customer = requireCustomer(shipment.customerId);
  const destination = requireFacility(shipment.destinationId);
  const origin = requireFacility(shipment.originId);

  const haystack = [
    shipment.trackingNumber,
    customer.name,
    shipment.recipient.name,
    shipment.recipient.company ?? "",
    destination.city,
    destination.name,
    origin.city,
    shipment.currentLocation,
  ]
    .join(" ")
    .toLowerCase();

  // Ignore dashes so "PKL10482" finds "PKL-10482".
  return (
    haystack.includes(needle) || haystack.replace(/-/g, "").includes(needle.replace(/-/g, ""))
  );
}

function compare(a: Shipment, b: Shipment, sort: SortOption): number {
  if (sort === "eta") return a.eta.localeCompare(b.eta);
  if (sort === "status") {
    const byStage = stageIndex(stageOf(a)) - stageIndex(stageOf(b));
    return byStage !== 0 ? byStage : a.trackingNumber.localeCompare(b.trackingNumber);
  }
  // Latest: most recent scan first.
  const aLast = a.events[a.events.length - 1]?.at ?? a.createdAt;
  const bLast = b.events[b.events.length - 1]?.at ?? b.createdAt;
  return bLast.localeCompare(aLast);
}

export function filterShipments(shipments: Shipment[], query: ShipmentQuery): Shipment[] {
  return shipments
    .filter(
      (shipment) =>
        matchesStatusFilter(shipment.status, query.status) &&
        matchesSearch(shipment, query.search),
    )
    .sort((a, b) => compare(a, b, query.sort));
}

/** True when anything is narrowing the list — drives the "clear filters" affordance. */
export function hasActiveFilters(query: ShipmentQuery): boolean {
  return query.search.trim() !== "" || query.status !== "all" || query.sort !== "latest";
}
