import { facilities } from "@/data/facilities";
import { coverageRegions, coverageStatusLabels, type CoverageStatus } from "@/content/coverage";
import { demoNotices } from "@/content/site";
import { polygonPoints, regionShapes } from "@/lib/geo";

/**
 * The coverage visualization.
 *
 * Abstract territories drawn from invented polygons — deliberately not a real
 * coastline — with the ten network facilities plotted on top. Same coordinate
 * space as the route diagram, so the two read as one system.
 */

const statusFill: Record<CoverageStatus, string> = {
  full: "var(--parcel-accent)",
  scheduled: "var(--art-land-2)",
  partner: "var(--art-land)",
};

const statusOpacity: Record<CoverageStatus, number> = {
  full: 0.16,
  scheduled: 1,
  partner: 1,
};

export function CoverageMap({ className = "" }: { className?: string }) {
  const statusById = new Map(
    coverageRegions.map((region) => [region.id, region.status] as const),
  );

  return (
    <figure className={`m-0 ${className}`.trim()}>
      <div className="relative aspect-square w-full overflow-hidden border border-line bg-[var(--art-field)] sm:aspect-[4/3]">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 h-full w-full"
          role="img"
          aria-label={`Coverage diagram of five demo regions and ten facilities. ${demoNotices.coverage}`}
        >
          <defs>
            <pattern id="coverage-grid" width={8} height={8} patternUnits="userSpaceOnUse">
              <path
                d="M 8 0 L 0 0 0 8"
                fill="none"
                stroke="var(--art-grid)"
                strokeWidth={0.5}
                vectorEffect="non-scaling-stroke"
              />
            </pattern>
          </defs>
          <rect x={0} y={0} width={100} height={100} fill="url(#coverage-grid)" />

          {regionShapes.map((shape) => {
            const status = statusById.get(shape.id) ?? "partner";
            return (
              <polygon
                key={shape.id}
                points={polygonPoints(shape)}
                fill={statusFill[status]}
                fillOpacity={statusOpacity[status]}
                stroke="var(--art-edge)"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
                strokeDasharray={status === "partner" ? "3 2" : undefined}
              />
            );
          })}

          {facilities.map((facility) => (
            <g key={facility.id}>
              <circle
                cx={facility.point.x}
                cy={facility.point.y}
                r={1.6}
                fill="var(--parcel-accent)"
                stroke="var(--parcel-surface)"
                strokeWidth={1.2}
                vectorEffect="non-scaling-stroke"
              />
            </g>
          ))}
        </svg>

        {regionShapes.map((shape) => (
          <span
            key={shape.id}
            aria-hidden="true"
            className="parcel-eyebrow absolute -translate-x-1/2 -translate-y-1/2 text-[0.5625rem] text-ink-muted"
            style={{ left: `${shape.label.x}%`, top: `${shape.label.y}%` }}
          >
            {shape.id}
          </span>
        ))}

        <span className="parcel-eyebrow absolute bottom-2 left-3 text-[0.5625rem]">
          {demoNotices.coverage}
        </span>
      </div>

      <figcaption className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
        {(Object.keys(coverageStatusLabels) as CoverageStatus[]).map((status) => (
          <span key={status} className="flex items-center gap-2 text-[0.75rem] text-ink-muted">
            <span
              aria-hidden="true"
              className={`size-2.5 border ${
                status === "full"
                  ? "border-accent bg-accent/20"
                  : status === "scheduled"
                    ? "border-line-strong bg-[var(--art-land-2)]"
                    : "border-line-strong border-dashed bg-[var(--art-land)]"
              }`}
            />
            {coverageStatusLabels[status]}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
