import { Info } from "lucide-react";
import type { ReactNode } from "react";

/**
 * The demo boundary marker.
 *
 * Used wherever the interface could otherwise imply that something real
 * happened — a carrier was contacted, a parcel moved, an account was created.
 */
export function DemoNotice({
  children,
  className = "",
  variant = "inline",
}: {
  children: ReactNode;
  className?: string;
  variant?: "inline" | "block";
}) {
  if (variant === "inline") {
    return (
      <p className={`parcel-eyebrow inline-flex items-center gap-1.5 ${className}`.trim()}>
        <Info aria-hidden="true" className="size-3" />
        {children}
      </p>
    );
  }

  return (
    <p
      className={`flex items-start gap-2 border border-line bg-surface-2 px-3 py-2 text-[0.75rem] leading-relaxed text-ink-muted ${className}`.trim()}
    >
      <Info aria-hidden="true" className="mt-px size-3.5 shrink-0 text-ink-faint" />
      {children}
    </p>
  );
}
