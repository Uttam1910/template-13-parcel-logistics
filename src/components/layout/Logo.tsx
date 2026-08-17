import { siteConfig } from "@/content/site";

/**
 * The Parcel mark: a stylised box seam over the wordmark. Inline SVG so it
 * themes with the interface and costs no request.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`.trim()}>
      <svg
        viewBox="0 0 24 24"
        className="size-6 shrink-0"
        aria-hidden="true"
        fill="none"
        strokeLinejoin="round"
      >
        <path
          d="M12 2.4 L21.4 7 L12 11.6 L2.6 7 Z"
          fill="var(--parcel-accent)"
          stroke="var(--parcel-accent)"
          strokeWidth={1.4}
        />
        <path
          d="M2.6 7 V17 L12 21.6 V11.6 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.4}
        />
        <path
          d="M21.4 7 V17 L12 21.6 V11.6 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.4}
        />
        <path d="M12 11.6 V21.6" stroke="currentColor" strokeWidth={1.4} />
      </svg>
      <span className="text-[1.0625rem] font-semibold tracking-tight">{siteConfig.name}</span>
    </span>
  );
}
