import type { SeriesPoint } from "@/data/analytics";

/**
 * Area + line chart for rate series (on-time %, transit hours).
 *
 * The viewBox is stretched with `preserveAspectRatio="none"` so the series
 * always fills its container; `vectorEffect="non-scaling-stroke"` keeps the
 * stroke a true hairline despite that. Values are also listed for screen
 * readers.
 */
export function LineChart({
  data,
  label,
  formatValue,
  height = "h-44",
  /** Pads the value axis so a flat series doesn't render as a straight edge. */
  padding = 0.15,
}: {
  data: SeriesPoint[];
  label: string;
  formatValue: (value: number) => string;
  height?: string;
  padding?: number;
}) {
  const values = data.map((point) => point.value);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const span = Math.max(rawMax - rawMin, 0.001);
  const min = rawMin - span * padding;
  const max = rawMax + span * padding;

  const toX = (index: number) => (index / Math.max(1, data.length - 1)) * 100;
  const toY = (value: number) => 100 - ((value - min) / (max - min)) * 100;

  const line = data.map((point, index) => `${toX(index)},${toY(point.value)}`).join(" ");
  const area = `0,100 ${line} 100,100`;

  return (
    <figure className="m-0">
      <div className={`relative ${height}`}>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1={0}
              x2={100}
              y1={y}
              y2={y}
              stroke="var(--parcel-line)"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <polygon points={area} fill="var(--parcel-accent)" fillOpacity={0.1} />
          <polyline
            points={line}
            fill="none"
            stroke="var(--parcel-accent)"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Axis bounds as HTML so the text never stretches with the viewBox. */}
        <span className="parcel-numeral absolute top-0 right-0 bg-surface/80 px-1 text-[0.625rem] text-ink-faint">
          {formatValue(rawMax)}
        </span>
        <span className="parcel-numeral absolute right-0 bottom-0 bg-surface/80 px-1 text-[0.625rem] text-ink-faint">
          {formatValue(rawMin)}
        </span>
      </div>

      <div className="mt-2 flex gap-1 border-t border-line pt-2" aria-hidden="true">
        {data.map((point, index) => (
          <span
            key={`${point.label}-${index}`}
            className="parcel-numeral flex-1 truncate text-center text-[0.5625rem] text-ink-faint"
          >
            {point.label}
          </span>
        ))}
      </div>

      <figcaption className="sr-only">
        <p>{label}</p>
        <ul>
          {data.map((point, index) => (
            <li key={`${point.label}-sr-${index}`}>
              {point.label}: {formatValue(point.value)}
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}
