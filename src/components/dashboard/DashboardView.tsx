"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  Gauge,
  PackageSearch,
  Search,
  Truck,
} from "lucide-react";
import type { Shipment } from "@/data/types";
import { usePreferences, useShipments } from "@/lib/demo/store";
import { formatPercent } from "@/lib/format";
import {
  defaultQuery,
  filterShipments,
  hasActiveFilters,
  sortLabels,
  SORT_OPTIONS,
  type ShipmentQuery,
} from "@/lib/filters";
import { deliveriesByDay, networkMetrics, statusCounts, volumeByDay } from "@/lib/metrics";
import { STATUS_FILTERS, statusFilterLabels } from "@/lib/status";
import { BarChart } from "@/components/charts/BarChart";
import { MetricTile } from "@/components/charts/MetricTile";
import { StatusDistribution } from "@/components/charts/StatusDistribution";
import { EmptyState } from "@/components/ui/EmptyState";
import { Panel, PanelHeader } from "@/components/ui/display";
import { ShipmentTable } from "@/components/shipments/ShipmentTable";

/**
 * The operations dashboard.
 *
 * Every figure here is computed from the shipment records after local demo
 * edits are merged — mark something delivered on a shipment page and these
 * counts change on the next render.
 */
export function DashboardView({ shipments: base }: { shipments: Shipment[] }) {
  const { shipments } = useShipments(base);
  const { preferences } = usePreferences();
  const [query, setQuery] = useState<ShipmentQuery>(defaultQuery);

  const metrics = useMemo(() => networkMetrics(shipments), [shipments]);
  const distribution = useMemo(() => statusCounts(shipments), [shipments]);
  const volume = useMemo(() => volumeByDay(shipments), [shipments]);
  const deliveries = useMemo(() => deliveriesByDay(shipments), [shipments]);
  const recent = useMemo(
    () => filterShipments(shipments, query).slice(0, 8),
    [shipments, query],
  );

  const filtered = hasActiveFilters(query);

  return (
    <div className="flex flex-col gap-4">
      {/* Metrics */}
      <section aria-labelledby="metrics-heading">
        <h2 id="metrics-heading" className="sr-only">
          Network metrics
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
          <MetricTile
            label="Active shipments"
            value={String(metrics.active)}
            hint="Not yet delivered"
            icon={Boxes}
          />
          <MetricTile
            label="In transit"
            value={String(metrics.inTransit)}
            hint="Moving between facilities"
            icon={Truck}
          />
          <MetricTile
            label="Out for delivery"
            value={String(metrics.outForDelivery)}
            hint="On a delivery round today"
            icon={Truck}
          />
          <MetricTile
            label="Delivered today"
            value={String(metrics.deliveredToday)}
            hint="Completed on the demo date"
            icon={CheckCircle2}
          />
          <MetricTile
            label="Exceptions"
            value={String(metrics.exceptions + metrics.delayed)}
            hint={`${metrics.exceptions} ${
              metrics.exceptions === 1 ? "exception" : "exceptions"
            }, ${metrics.delayed} delayed`}
            icon={AlertTriangle}
          />
          <MetricTile
            label="On-time rate"
            value={metrics.onTimeRate === null ? "—" : formatPercent(metrics.onTimeRate, 0)}
            hint="Of shipments delivered so far"
            icon={Gauge}
          />
        </div>
      </section>

      {/* Charts */}
      <div className="grid gap-4 xl:grid-cols-3">
        <Panel className="flex flex-col xl:col-span-1">
          <PanelHeader title="Shipment volume" description="Created per day, last 7 days" />
          <div className="flex flex-1 flex-col p-4 sm:p-5">
            <BarChart
              data={volume}
              label="Shipments created per day over the last seven days"
              height="min-h-40 flex-1"
            />
          </div>
        </Panel>

        <Panel className="flex flex-col xl:col-span-1">
          <PanelHeader
            title="Delivery performance"
            description="Delivered per day, last 7 days"
          />
          <div className="flex flex-1 flex-col p-4 sm:p-5">
            <BarChart
              data={deliveries}
              label="Shipments delivered per day over the last seven days"
              height="min-h-40 flex-1"
            />
          </div>
        </Panel>

        <Panel className="xl:col-span-1">
          <PanelHeader title="Status distribution" description="Across all demo shipments" />
          <div className="p-4 sm:p-5">
            <StatusDistribution data={distribution} />
          </div>
        </Panel>
      </div>

      {/* Recent shipments */}
      <Panel>
        <PanelHeader
          title="Recent shipments"
          description="Search, filter and sort — then open one to act on it"
          action={
            <Link
              href="/shipments"
              className="inline-flex h-8 items-center rounded-sm border border-line-strong px-3 text-[0.75rem] font-medium text-ink transition-colors hover:bg-surface-2"
            >
              All shipments
            </Link>
          }
        />

        <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-xs">
            <label htmlFor="dashboard-search" className="sr-only">
              Search recent shipments
            </label>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-faint"
            />
            <input
              id="dashboard-search"
              type="search"
              value={query.search}
              onChange={(event) => setQuery({ ...query, search: event.target.value })}
              placeholder="Tracking, customer, destination"
              className="h-9 w-full rounded-sm border border-line-strong bg-surface pr-3 pl-9 text-[0.8125rem] text-ink placeholder:text-ink-faint hover:border-ink-faint focus:border-accent"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap items-center gap-1">
              <label htmlFor="dashboard-status" className="parcel-eyebrow mr-1">
                Status
              </label>
              <select
                id="dashboard-status"
                value={query.status}
                onChange={(event) =>
                  setQuery({ ...query, status: event.target.value as ShipmentQuery["status"] })
                }
                className="h-9 cursor-pointer rounded-sm border border-line-strong bg-surface px-2 text-[0.8125rem] text-ink hover:border-ink-faint focus:border-accent"
              >
                {STATUS_FILTERS.map((filter) => (
                  <option key={filter} value={filter}>
                    {statusFilterLabels[filter]}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-1">
              <span className="parcel-eyebrow mr-1">Sort</span>
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setQuery({ ...query, sort: option })}
                  aria-pressed={query.sort === option}
                  className={`rounded-sm border px-2.5 py-1 text-[0.75rem] font-medium transition-colors ${
                    query.sort === option
                      ? "border-line-strong bg-surface-3 text-ink"
                      : "border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink"
                  }`}
                >
                  {sortLabels[option]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {recent.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="No shipments match"
            body="Nothing in the demo dataset matches this search and status combination."
            action={
              filtered ? (
                <button
                  type="button"
                  onClick={() => setQuery(defaultQuery)}
                  className="inline-flex h-9 items-center rounded-sm border border-line-strong px-4 text-[0.8125rem] font-medium text-ink hover:bg-surface-2"
                >
                  Clear filters
                </button>
              ) : null
            }
          />
        ) : (
          <ShipmentTable
            shipments={recent}
            density={preferences.density}
            caption="Recent shipments matching the current dashboard filters"
          />
        )}
      </Panel>
    </div>
  );
}
