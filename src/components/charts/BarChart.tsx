import type { SeriesPoint } from "@/data/analytics";
import { formatCompact, formatNumber } from "@/lib/format";

/**
 * Column chart.
 *
 * Built from HTML rather than SVG: percentage heights stay crisp at any width
 * and the bars never distort the way a stretched viewBox does. The underlying
 * values are also exposed as a screen-reader list, so the chart is not the only
 * way to read the data.
 */
export function BarChart({
  data,
  label,
  height = "h-44",
  highlightLast = true,
}: {
  data: SeriesPoint[];
  label: string;
  /** Pass `flex-1` to let the plot area absorb the height of its container. */
  height?: string;
  highlightLast?: boolean;
}) {
  const max = Math.max(...data.map((point) => point.value), 1);

  return (
    <figure className="m-0 flex h-full flex-col">
      <div className={`flex min-h-0 items-end gap-1 ${height} sm:gap-1.5`} aria-hidden="true">
        {data.map((point, index) => {
          const last = highlightLast && index === data.length - 1;
          return (
            <div
              key={`${point.label}-${index}`}
              className="group flex h-full flex-1 flex-col justify-end"
            >
              <div
                title={`${point.label}: ${formatNumber(point.value)}`}
                className={`w-full rounded-t-xs transition-colors ${
                  last ? "bg-accent" : "bg-line-strong group-hover:bg-ink-faint"
                }`}
                style={{ height: `${Math.max(2, (point.value / max) * 100)}%` }}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex gap-1 border-t border-line pt-2 sm:gap-1.5" aria-hidden="true">
        {data.map((point, index) => (
          <span
            key={`${point.label}-label-${index}`}
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
              {point.label}: {formatNumber(point.value)}
            </li>
          ))}
        </ul>
      </figcaption>

      <p className="parcel-numeral mt-2 flex justify-between text-[0.625rem] text-ink-faint">
        <span>Peak {formatCompact(max)}</span>
        <span>{data.length} periods</span>
      </p>
    </figure>
  );
}
