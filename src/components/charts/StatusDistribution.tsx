import type { ShipmentStatus } from "@/data/types";
import { formatNumber } from "@/lib/format";
import { statusMeta, toneDotClasses } from "@/lib/status";

/**
 * Status distribution.
 *
 * A segmented bar with a legend rather than a pie: nine statuses in a donut
 * becomes unreadable colour noise, and the legend carries the counts anyway.
 */
export function StatusDistribution({
  data,
  className = "",
}: {
  data: { status: ShipmentStatus; count: number }[];
  className?: string;
}) {
  const present = data.filter((entry) => entry.count > 0);
  const total = present.reduce((sum, entry) => sum + entry.count, 0);

  if (total === 0) {
    return (
      <p className={`text-[0.8125rem] text-ink-faint ${className}`.trim()}>
        No shipments in this view.
      </p>
    );
  }

  return (
    <div className={className}>
      <div
        className="flex h-2.5 w-full overflow-hidden rounded-xs bg-surface-3"
        aria-hidden="true"
      >
        {present.map((entry) => (
          <span
            key={entry.status}
            title={`${statusMeta[entry.status].label}: ${entry.count}`}
            className={toneDotClasses[statusMeta[entry.status].tone]}
            style={{ width: `${(entry.count / total) * 100}%` }}
          />
        ))}
      </div>

      <ul className="mt-4 flex flex-col">
        {present.map((entry) => {
          const meta = statusMeta[entry.status];
          const share = (entry.count / total) * 100;
          return (
            <li
              key={entry.status}
              className="flex items-center gap-3 border-b border-line py-2 last:border-b-0"
            >
              <span
                aria-hidden="true"
                className={`size-2 shrink-0 rounded-full ${toneDotClasses[meta.tone]}`}
              />
              <span className="min-w-0 flex-1 truncate text-[0.8125rem] text-ink-muted">
                {meta.label}
              </span>
              <span className="parcel-numeral shrink-0 text-[0.8125rem] font-semibold text-ink">
                {formatNumber(entry.count)}
              </span>
              <span className="parcel-numeral w-12 shrink-0 text-right text-[0.75rem] text-ink-faint">
                {share.toFixed(0)}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
