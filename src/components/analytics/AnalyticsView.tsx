"use client";

import { useState } from "react";
import { BarChart3 } from "lucide-react";
import {
  getAnalytics,
  RANGES,
  rangeDescriptions,
  rangeLabels,
  type RangeId,
} from "@/data/analytics";
import { usePreferences } from "@/lib/demo/store";
import { formatCompact, formatNumber, formatPercent } from "@/lib/format";
import { BarChart } from "@/components/charts/BarChart";
import { LineChart } from "@/components/charts/LineChart";
import { MetricTile } from "@/components/charts/MetricTile";
import { EmptyState } from "@/components/ui/EmptyState";
import { Panel, PanelHeader } from "@/components/ui/display";
import { DemoNotice } from "@/components/ui/DemoNotice";

/**
 * Analytics.
 *
 * The range selector genuinely re-buckets and regenerates every series — 7D is
 * seven daily columns, YTD is one per month — and each KPI is recomputed from
 * the series being drawn, so the headline numbers always match the chart.
 */
export function AnalyticsView() {
  const { preferences } = usePreferences();
  const [chosen, setChosen] = useState<RangeId | null>(null);
  const range = chosen ?? preferences.defaultRange;
  const analytics = getAnalytics(range);

  return (
    <div className="flex flex-col gap-4">
      <Panel className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="parcel-eyebrow">Reporting period</p>
          <p className="mt-1 text-[0.875rem] text-ink">
            {analytics.description} ·{" "}
            <span className="parcel-numeral text-ink-muted">
              {Math.round(analytics.days)} days
            </span>
          </p>
        </div>

        <div
          role="group"
          aria-label="Reporting range"
          className="flex shrink-0 rounded-sm border border-line-strong bg-surface p-0.5"
        >
          {RANGES.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setChosen(option)}
              aria-pressed={range === option}
              title={rangeDescriptions[option]}
              className={`parcel-numeral rounded-xs px-3 py-1.5 text-[0.75rem] font-semibold transition-colors ${
                range === option
                  ? "bg-accent text-accent-fg"
                  : "text-ink-muted hover:bg-surface-3 hover:text-ink"
              }`}
            >
              {rangeLabels[option]}
            </button>
          ))}
        </div>
      </Panel>

      {analytics.volume.length === 0 ? (
        <Panel>
          <EmptyState
            icon={BarChart3}
            title="No data in this range"
            body="There are no periods to report on for the selected range."
          />
        </Panel>
      ) : (
        <>
          <section aria-labelledby="analytics-kpis">
            <h2 id="analytics-kpis" className="sr-only">
              Key figures for {analytics.description}
            </h2>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
              {analytics.kpis.map((kpi) => (
                <MetricTile
                  key={kpi.id}
                  label={kpi.label}
                  value={kpi.value}
                  delta={kpi.delta}
                  higherIsBetter={kpi.higherIsBetter}
                />
              ))}
            </div>
          </section>

          <div className="grid gap-4 xl:grid-cols-2">
            <Panel>
              <PanelHeader
                title="Shipment volume"
                description={`Parcels entering the network · ${analytics.description}`}
                action={
                  <span className="parcel-numeral text-[0.75rem] text-ink-faint">
                    {formatCompact(
                      analytics.volume.reduce((total, point) => total + point.value, 0),
                    )}{" "}
                    total
                  </span>
                }
              />
              <div className="p-4 sm:p-5">
                <BarChart
                  data={analytics.volume}
                  label={`Shipment volume for ${analytics.description}`}
                />
              </div>
            </Panel>

            <Panel>
              <PanelHeader
                title="On-time rate"
                description={`Delivered on or before the estimate · ${analytics.description}`}
              />
              <div className="p-4 sm:p-5">
                <LineChart
                  data={analytics.onTime}
                  label={`On-time delivery rate for ${analytics.description}`}
                  formatValue={(value) => formatPercent(value, 1)}
                />
              </div>
            </Panel>

            <Panel>
              <PanelHeader
                title="Average transit time"
                description={`Collection to delivery, in hours · ${analytics.description}`}
              />
              <div className="p-4 sm:p-5">
                <LineChart
                  data={analytics.transit}
                  label={`Average transit time in hours for ${analytics.description}`}
                  formatValue={(value) => `${value.toFixed(1)} h`}
                />
              </div>
            </Panel>

            <Panel>
              <PanelHeader
                title="Exceptions & returns"
                description={`Interventions and reverse flow · ${analytics.description}`}
              />
              <div className="grid gap-5 p-4 sm:p-5 sm:grid-cols-2">
                <div>
                  <p className="parcel-eyebrow mb-2">
                    Exceptions ·{" "}
                    {formatNumber(
                      analytics.exceptions.reduce((total, point) => total + point.value, 0),
                    )}
                  </p>
                  <BarChart
                    data={analytics.exceptions}
                    label={`Exceptions for ${analytics.description}`}
                    height="h-28"
                    highlightLast={false}
                  />
                </div>
                <div>
                  <p className="parcel-eyebrow mb-2">
                    Returns ·{" "}
                    {formatNumber(
                      analytics.returns.reduce((total, point) => total + point.value, 0),
                    )}
                  </p>
                  <BarChart
                    data={analytics.returns}
                    label={`Returns for ${analytics.description}`}
                    height="h-28"
                    highlightLast={false}
                  />
                </div>
              </div>
            </Panel>
          </div>
        </>
      )}

      <DemoNotice variant="block">
        Analytics figures are illustrative demo data for a network larger than the eighteen
        shipments in this template. They are generated deterministically from the selected range
        — the same range always produces the same numbers — and no analytics service is
        connected.
      </DemoNotice>
    </div>
  );
}
