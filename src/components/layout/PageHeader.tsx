import type { ReactNode } from "react";

/** The heading block every workspace route opens with. */
export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-5 bg-accent" />
          <p className="parcel-eyebrow">{eyebrow}</p>
        </div>
        <h1 className="mt-2.5 text-2xl tracking-tight">{title}</h1>
        <p className="mt-1.5 max-w-2xl text-[0.875rem] leading-relaxed text-ink-muted">
          {description}
        </p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
