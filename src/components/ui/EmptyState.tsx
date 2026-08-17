import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/**
 * The shared empty / not-found state. Every list, table and lookup in the
 * template routes through this rather than rendering a blank area.
 */
export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
  tone = "neutral",
  className = "",
}: {
  icon: LucideIcon;
  title: string;
  body: ReactNode;
  action?: ReactNode;
  tone?: "neutral" | "warning";
  className?: string;
}) {
  const iconTone =
    tone === "warning"
      ? "border-warning/30 bg-warning-soft text-warning"
      : "border-line bg-surface-3 text-ink-faint";

  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 px-6 py-14 text-center ${className}`.trim()}
    >
      <span
        aria-hidden="true"
        className={`inline-flex size-11 items-center justify-center rounded-sm border ${iconTone}`}
      >
        <Icon className="size-5" strokeWidth={1.5} />
      </span>
      <div className="max-w-md space-y-1.5">
        <p className="text-[0.9375rem] font-semibold text-ink">{title}</p>
        <p className="text-[0.8125rem] leading-relaxed text-ink-muted">{body}</p>
      </div>
      {action ? <div className="flex flex-wrap justify-center gap-2">{action}</div> : null}
    </div>
  );
}
