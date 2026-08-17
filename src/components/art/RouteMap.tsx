import type { Facility, Shipment } from "@/data/types";
import { facilityKindLabels } from "@/data/facilities";
import { routeFacilities } from "@/lib/shipments";
import { stageOf } from "@/lib/status";
import { routePath } from "@/lib/geo";
import { demoNotices } from "@/content/site";

/**
 * The route visualization.
 *
 * This is a diagram, not a map: facility coordinates are abstract points in a
 * 0–100 space (see `src/lib/geo.ts`), there is no tile provider, no GPS and no
 * geographic claim. It is deterministic — the same shipment always draws the
 * same picture.
 *
 * Only the legs are drawn in SVG. Markers and labels are positioned HTML, so
 * they stay a fixed, legible size at 390px and at 1440px instead of scaling
 * with the viewBox — an SVG circle sized in user units becomes enormous once a
 * short route zooms the frame in.
 */

/** Position along the route as a floating index into `routeFacilityIds`. */
export function routeProgress(shipment: Shipment): number {
  const ids = shipment.routeFacilityIds;
  const last = ids.length - 1;
  const stage = stageOf(shipment);

  if (stage === "created" || stage === "picked_up" || stage === "origin_facility") return 0;
  if (
    stage === "destination_facility" ||
    stage === "out_for_delivery" ||
    stage === "delivered"
  ) {
    return last;
  }

  // In transit: anchor on the furthest facility actually scanned, then sit
  // halfway to the next one.
  let anchor = 0;
  for (const event of shipment.events) {
    if (!event.facilityId) continue;
    const index = ids.indexOf(event.facilityId);
    if (index > anchor) anchor = index;
  }
  return Math.min(last, anchor + 0.5);
}

type Box = { x: number; y: number; width: number; height: number };

/** Frames the route with padding, then matches the container's 16:10 aspect. */
function viewBoxFor(points: { x: number; y: number }[]): Box {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const pad = 12;

  let minX = Math.min(...xs) - pad;
  let maxX = Math.max(...xs) + pad;
  let minY = Math.min(...ys) - pad;
  let maxY = Math.max(...ys) + pad;

  let width = maxX - minX;
  let height = maxY - minY;
  const target = 16 / 10;

  if (width / height < target) {
    const next = height * target;
    minX -= (next - width) / 2;
    width = next;
  } else {
    const next = width / target;
    minY -= (next - height) / 2;
    height = next;
  }

  maxX = minX + width;
  maxY = minY + height;
  return { x: minX, y: minY, width, height };
}

function percent(value: number, start: number, size: number): number {
  return ((value - start) / size) * 100;
}

/** Linear interpolation between the two waypoints a fractional index falls between. */
function positionAt(points: { x: number; y: number }[], index: number) {
  const lower = Math.floor(index);
  const upper = Math.min(points.length - 1, lower + 1);
  const t = index - lower;
  return {
    x: points[lower].x + (points[upper].x - points[lower].x) * t,
    y: points[lower].y + (points[upper].y - points[lower].y) * t,
  };
}

/** Fixed-size HTML marker. Shape encodes the role; fill encodes progress. */
function Marker({ kind, passed }: { kind: "origin" | "hop" | "destination"; passed: boolean }) {
  const tone = passed ? "border-accent bg-accent" : "border-line-strong bg-surface";

  if (kind === "hop") {
    return <span aria-hidden="true" className={`block size-2 rounded-full border ${tone}`} />;
  }

  return (
    <span
      aria-hidden="true"
      className={`block size-2.5 border ${tone} ${kind === "destination" ? "rotate-45" : ""}`}
    />
  );
}

export function RouteMap({
  shipment,
  className = "",
  showLegend = true,
}: {
  shipment: Shipment;
  className?: string;
  showLegend?: boolean;
}) {
  const stops: Facility[] = routeFacilities(shipment);
  const points = stops.map((facility) => facility.point);
  const box = viewBoxFor(points);
  const progress = routeProgress(shipment);
  const marker = positionAt(points, progress);
  const delivered = stageOf(shipment) === "delivered";

  const legs = points.slice(0, -1).map((from, index) => {
    const to = points[index + 1];
    const done = progress >= index + 1;
    const active = !done && progress > index;
    return { path: routePath([from, to]), done, active, key: `${index}` };
  });

  return (
    <figure className={`m-0 ${className}`.trim()}>
      <div className="relative aspect-[16/10] w-full overflow-hidden border border-line bg-[var(--art-field)]">
        <svg
          viewBox={`${box.x} ${box.y} ${box.width} ${box.height}`}
          className="absolute inset-0 h-full w-full"
          role="img"
          aria-label={`Route diagram: ${stops.map((stop) => stop.name).join(" to ")}. ${demoNotices.route}`}
        >
          <defs>
            <pattern
              id={`grid-${shipment.id}`}
              width={10}
              height={10}
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 10 0 L 0 0 0 10"
                fill="none"
                stroke="var(--art-grid)"
                strokeWidth={0.6}
                vectorEffect="non-scaling-stroke"
              />
            </pattern>
          </defs>
          <rect
            x={box.x}
            y={box.y}
            width={box.width}
            height={box.height}
            fill={`url(#grid-${shipment.id})`}
          />

          {legs.map((leg) => (
            <path
              key={leg.key}
              d={leg.path}
              fill="none"
              strokeWidth={leg.done || leg.active ? 2 : 1.5}
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              stroke={leg.done || leg.active ? "var(--parcel-accent)" : "var(--art-edge)"}
              strokeDasharray={leg.done ? undefined : "3 3"}
              className={leg.active ? "animate-parcel-dash" : undefined}
              opacity={leg.done || leg.active ? 1 : 0.75}
            />
          ))}
        </svg>

        {/* Current position, drawn beneath the node markers. */}
        {delivered ? null : (
          <span
            aria-hidden="true"
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${percent(marker.x, box.x, box.width)}%`,
              top: `${percent(marker.y, box.y, box.height)}%`,
            }}
          >
            <span className="animate-parcel-ping absolute inset-0 m-auto block size-2.5 rounded-full bg-accent/40" />
            <span className="block size-2.5 rounded-full border-2 border-surface bg-accent" />
          </span>
        )}

        {/* Node markers and labels, as HTML so they never scale with the viewBox. */}
        {stops.map((facility, index) => (
          <span
            key={facility.id}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
            style={{
              left: `${percent(facility.point.x, box.x, box.width)}%`,
              top: `${percent(facility.point.y, box.y, box.height)}%`,
            }}
          >
            <Marker
              kind={index === 0 ? "origin" : index === stops.length - 1 ? "destination" : "hop"}
              passed={progress >= index}
            />
            <span
              aria-hidden="true"
              className="parcel-numeral absolute top-full mt-1.5 text-[0.625rem] leading-none font-semibold tracking-wide whitespace-nowrap text-ink-muted"
            >
              {facility.code}
            </span>
          </span>
        ))}

        <span className="parcel-eyebrow absolute bottom-2 left-3 text-[0.5625rem]">
          {demoNotices.route}
        </span>
      </div>

      {showLegend ? (
        <figcaption className="mt-3">
          <ol className="flex flex-col gap-0 border border-line bg-surface">
            {stops.map((facility, index) => {
              const passed = progress >= index;
              const here = Math.floor(progress) === index && progress % 1 === 0;
              const isOrigin = index === 0;
              const isDestination = index === stops.length - 1;

              return (
                <li
                  key={facility.id}
                  className="flex items-center gap-3 border-b border-line px-3 py-2 last:border-b-0"
                >
                  <span className="flex size-3 shrink-0 items-center justify-center">
                    <Marker
                      kind={isOrigin ? "origin" : isDestination ? "destination" : "hop"}
                      passed={passed}
                    />
                  </span>
                  <span className="parcel-numeral shrink-0 text-[0.6875rem] font-semibold text-ink-muted">
                    {facility.code}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[0.8125rem] text-ink">
                    {facility.name}
                  </span>
                  <span className="hidden shrink-0 text-[0.75rem] text-ink-faint sm:inline">
                    {here
                      ? "Current"
                      : isOrigin
                        ? "Origin"
                        : isDestination
                          ? "Destination"
                          : facilityKindLabels[facility.kind]}
                  </span>
                </li>
              );
            })}
          </ol>
        </figcaption>
      ) : null}
    </figure>
  );
}
