import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { formatDelta } from "@/lib/format";

/**
 * A single operating metric.
 *
 * The delta arrow points up or down by direction of change; whether that is
 * *good* is decided by `higherIsBetter` and shown through the arrow's colour
 * and its screen-reader text — never colour alone.
 */
export function MetricTile({
  label,
  value,
  hint,
  delta,
  higherIsBetter = true,
  icon: Icon,
  children,
}: {
  label: string;
  value: string;
  hint?: string;
  delta?: number;
  higherIsBetter?: boolean;
  icon?: LucideIcon;
  children?: ReactNode;
}) {
  const hasDelta = delta !== undefined && Number.isFinite(delta);
  const flat = hasDelta && Math.abs(delta) < 0.05;
  const improved = hasDelta && !flat && delta > 0 === higherIsBetter;
  const DeltaIcon = flat ? Minus : hasDelta && delta > 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="flex flex-col justify-between border border-line bg-surface p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="parcel-eyebrow">{label}</p>
        {Icon ? (
          <Icon
            aria-hidden="true"
            className="size-4 shrink-0 text-ink-faint"
            strokeWidth={1.75}
          />
        ) : null}
      </div>

      <p className="parcel-numeral mt-3 text-2xl leading-none font-semibold tracking-tight text-ink">
        {value}
      </p>

      {hasDelta ? (
        <p className="mt-2.5 flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-0.5 text-[0.75rem] font-medium ${
              flat ? "text-ink-faint" : improved ? "text-success" : "text-danger"
            }`}
          >
            <DeltaIcon aria-hidden="true" className="size-3.5" />
            <span className="parcel-numeral">{formatDelta(delta)}</span>
          </span>
          <span className="text-[0.75rem] text-ink-faint">
            vs previous period
            <span className="sr-only">
              , which is {flat ? "unchanged" : improved ? "an improvement" : "worse"}
            </span>
          </span>
        </p>
      ) : hint ? (
        <p className="mt-2.5 text-[0.75rem] leading-relaxed text-ink-faint">{hint}</p>
      ) : null}

      {children}
    </div>
  );
}
