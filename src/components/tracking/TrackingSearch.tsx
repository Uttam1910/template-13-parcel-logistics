import { Search } from "lucide-react";
import Link from "next/link";
import { featuredTrackingNumbers } from "@/data/shipments";
import { trackingHref } from "@/lib/routes";

/**
 * The tracking lookup.
 *
 * A plain GET form pointed at `/tracking`, which resolves the number on the
 * server and either redirects to the shipment or renders the not-found state.
 * That means tracking works with JavaScript disabled — the one interaction on
 * the public site that really must.
 */
export function TrackingSearch({
  defaultValue = "",
  error,
  size = "md",
  showExamples = true,
  autoFocus = false,
}: {
  defaultValue?: string;
  error?: string;
  size?: "md" | "lg";
  showExamples?: boolean;
  autoFocus?: boolean;
}) {
  const height = size === "lg" ? "h-14" : "h-12";
  const text = size === "lg" ? "text-base sm:text-lg" : "text-sm sm:text-base";

  return (
    <div className="w-full">
      <form action="/tracking" method="get" className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <label htmlFor="tracking-number" className="sr-only">
            Tracking number
          </label>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink-faint"
          />
          <input
            id="tracking-number"
            name="q"
            type="text"
            inputMode="text"
            autoComplete="off"
            spellCheck={false}
            // Only set on the dedicated tracking page, where the search *is* the
            // page's purpose — never on a page where it would steal focus.
            autoFocus={autoFocus}
            defaultValue={defaultValue}
            placeholder="Enter your tracking number"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "tracking-error" : "tracking-hint"}
            className={`parcel-numeral w-full rounded-sm border border-line-strong bg-surface pr-4 pl-11 tracking-wide text-ink placeholder:font-sans placeholder:tracking-normal placeholder:text-ink-faint hover:border-ink-faint focus:border-accent aria-[invalid=true]:border-danger ${height} ${text}`}
          />
        </div>
        <button
          type="submit"
          className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-sm border border-accent bg-accent px-6 font-medium text-accent-fg transition-colors hover:border-accent-hover hover:bg-accent-hover ${height} ${
            size === "lg" ? "text-base" : "text-sm"
          }`}
        >
          Track
        </button>
      </form>

      {error ? (
        <p id="tracking-error" className="mt-2 text-[0.8125rem] font-medium text-danger">
          {error}
        </p>
      ) : (
        <p id="tracking-hint" className="mt-2 text-[0.75rem] text-ink-faint">
          Tracking numbers look like <span className="parcel-numeral">PKL-10482</span>. Case and
          dashes are ignored.
        </p>
      )}

      {showExamples ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="parcel-eyebrow">Demo numbers</span>
          {featuredTrackingNumbers.map((trackingNumber) => (
            <Link
              key={trackingNumber}
              href={trackingHref(trackingNumber)}
              className="parcel-numeral rounded-sm border border-line bg-surface-2 px-2 py-1 text-[0.6875rem] text-ink-muted transition-colors hover:border-accent-line hover:bg-accent-soft hover:text-accent-soft-ink"
            >
              {trackingNumber}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
