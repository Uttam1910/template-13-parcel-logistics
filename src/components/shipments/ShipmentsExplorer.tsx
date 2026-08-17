"use client";

import Link from "next/link";
import { PackageSearch, Search, X } from "lucide-react";
import type { Shipment } from "@/data/types";
import { usePreferences, useShipments } from "@/lib/demo/store";
import {
  filterShipments,
  hasActiveFilters,
  sortLabels,
  SORT_OPTIONS,
  type ShipmentQuery,
} from "@/lib/filters";
import { withQuery } from "@/lib/routes";
import { STATUS_FILTERS, statusFilterLabels } from "@/lib/status";
import { EmptyState } from "@/components/ui/EmptyState";
import { Panel } from "@/components/ui/display";
import { ShipmentTable } from "./ShipmentTable";

/**
 * The operations shipment board.
 *
 * Filter state lives in the URL — every control is a real link or a GET form,
 * so the board is shareable, back-button friendly and works with JavaScript
 * disabled. The component itself is a Client Component only so it can merge
 * local demo edits on top of the authored records before filtering; the server
 * render and the hydrated render therefore agree, because both run
 * `filterShipments` over the same query.
 */
export function ShipmentsExplorer({
  shipments: base,
  query,
}: {
  shipments: Shipment[];
  query: ShipmentQuery;
}) {
  const { shipments } = useShipments(base);
  const { preferences } = usePreferences();
  const results = filterShipments(shipments, query);
  const filtered = hasActiveFilters(query);

  const hrefWith = (patch: Partial<ShipmentQuery>) =>
    withQuery("/shipments", {
      q: patch.search ?? query.search,
      status: (patch.status ?? query.status) === "all" ? "" : (patch.status ?? query.status),
      sort: (patch.sort ?? query.sort) === "latest" ? "" : (patch.sort ?? query.sort),
    });

  return (
    <div className="flex flex-col gap-4">
      <Panel className="p-4">
        {/* Search — a plain GET form, so it submits without JavaScript. */}
        <form action="/shipments" method="get" className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <label htmlFor="shipment-search" className="sr-only">
              Search shipments by tracking number, customer or destination
            </label>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-faint"
            />
            <input
              id="shipment-search"
              name="q"
              type="search"
              defaultValue={query.search}
              placeholder="Tracking number, customer or destination"
              className="h-10 w-full rounded-sm border border-line-strong bg-surface pr-3 pl-9 text-sm text-ink placeholder:text-ink-faint hover:border-ink-faint focus:border-accent"
            />
          </div>
          {/* Preserve the other filters when the search is submitted. */}
          {query.status !== "all" ? (
            <input type="hidden" name="status" value={query.status} />
          ) : null}
          {query.sort !== "latest" ? (
            <input type="hidden" name="sort" value={query.sort} />
          ) : null}
          <button
            type="submit"
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-sm border border-line-strong bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
          >
            Search
          </button>
        </form>

        <div className="mt-4 flex flex-col gap-3 border-t border-line pt-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="parcel-eyebrow mr-1">Status</span>
            {STATUS_FILTERS.map((filter) => {
              const active = query.status === filter;
              return (
                <Link
                  key={filter}
                  href={hrefWith({ status: filter })}
                  aria-current={active ? "true" : undefined}
                  className={`rounded-sm border px-2.5 py-1 text-[0.75rem] font-medium transition-colors ${
                    active
                      ? "border-accent bg-accent text-accent-fg"
                      : "border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink"
                  }`}
                >
                  {statusFilterLabels[filter]}
                </Link>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="parcel-eyebrow mr-1">Sort</span>
            {SORT_OPTIONS.map((option) => {
              const active = query.sort === option;
              return (
                <Link
                  key={option}
                  href={hrefWith({ sort: option })}
                  aria-current={active ? "true" : undefined}
                  className={`rounded-sm border px-2.5 py-1 text-[0.75rem] font-medium transition-colors ${
                    active
                      ? "border-line-strong bg-surface-3 text-ink"
                      : "border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink"
                  }`}
                >
                  {sortLabels[option]}
                </Link>
              );
            })}
          </div>
        </div>
      </Panel>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[0.8125rem] text-ink-muted" role="status">
          <span className="parcel-numeral font-semibold text-ink">{results.length}</span>{" "}
          {results.length === 1 ? "shipment" : "shipments"}
          {query.status !== "all" ? (
            <> · {statusFilterLabels[query.status].toLowerCase()}</>
          ) : null}
          {query.search ? <> · matching “{query.search}”</> : null}
        </p>

        {filtered ? (
          <Link
            href="/shipments"
            className="inline-flex items-center gap-1.5 rounded-sm border border-line px-2.5 py-1 text-[0.75rem] font-medium text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
          >
            <X aria-hidden="true" className="size-3" />
            Clear filters
          </Link>
        ) : null}
      </div>

      <Panel>
        {results.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="No shipments match these filters"
            body={
              filtered
                ? "Try a different status, or clear the filters to see the whole board."
                : "There are no shipments in the demo dataset."
            }
            action={
              filtered ? (
                <Link
                  href="/shipments"
                  className="inline-flex h-9 items-center rounded-sm border border-accent bg-accent px-4 text-[0.8125rem] font-medium text-accent-fg hover:bg-accent-hover"
                >
                  Clear filters
                </Link>
              ) : null
            }
          />
        ) : (
          <ShipmentTable
            shipments={results}
            density={preferences.density}
            caption="Shipments matching the current filters"
          />
        )}
      </Panel>
    </div>
  );
}
