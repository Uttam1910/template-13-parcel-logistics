import type { ShipmentStatus } from "@/data/types";
import { statusMeta, toneClasses, toneDotClasses } from "@/lib/status";

/**
 * The status badge.
 *
 * Colour is never the only signal: the badge always renders a marker *and* the
 * status label, so it stays readable in monochrome, for colour-blind users and
 * for screen readers.
 */
export function StatusBadge({
  status,
  size = "md",
  className = "",
}: {
  status: ShipmentStatus;
  size?: "sm" | "md";
  className?: string;
}) {
  const meta = statusMeta[status];
  const sizing =
    size === "sm" ? "h-5 gap-1.5 px-1.5 text-[0.6875rem]" : "h-6 gap-2 px-2 text-xs";

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-sm border font-medium whitespace-nowrap ${sizing} ${toneClasses[meta.tone]} ${className}`.trim()}
    >
      <span
        aria-hidden="true"
        className={`size-1.5 rounded-full ${toneDotClasses[meta.tone]}`}
      />
      {size === "sm" ? meta.short : meta.label}
    </span>
  );
}

/**
 * The large status treatment used at the top of a tracking page. Renders the
 * status icon alongside the headline label and its explanation.
 */
export function StatusHeadline({ status }: { status: ShipmentStatus }) {
  const meta = statusMeta[status];
  const Icon = meta.icon;

  return (
    <div className="flex items-start gap-3">
      <span
        aria-hidden="true"
        className={`mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-sm border ${toneClasses[meta.tone]}`}
      >
        <Icon className="size-[1.125rem]" strokeWidth={1.75} />
      </span>
      <div className="min-w-0">
        <p className="parcel-numeral text-lg leading-tight font-semibold tracking-tight sm:text-xl">
          {meta.headline}
        </p>
        <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink-muted">
          {meta.description}
        </p>
      </div>
    </div>
  );
}
