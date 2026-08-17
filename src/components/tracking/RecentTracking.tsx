"use client";

import { useEffect } from "react";
import Link from "next/link";
import { History } from "lucide-react";
import { useDemo } from "@/lib/demo/store";
import { trackingHref } from "@/lib/routes";

/**
 * Records a successful lookup in the demo store. Rendered by the tracking
 * detail page; writes once per shipment view and nothing else.
 */
export function RecordTracking({ trackingNumber }: { trackingNumber: string }) {
  const { dispatch, hydrated } = useDemo();

  useEffect(() => {
    if (!hydrated) return;
    dispatch({ type: "record-tracking", trackingNumber });
  }, [dispatch, hydrated, trackingNumber]);

  return null;
}

/**
 * "Recently tracked" — the small piece of continuity a tracking page owes
 * someone chasing more than one parcel. Renders nothing until there is history,
 * so it never occupies space it hasn't earned.
 */
export function RecentTracking() {
  const { state, hydrated } = useDemo();

  if (!hydrated || state.recentTracking.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="parcel-eyebrow inline-flex items-center gap-1.5">
        <History aria-hidden="true" className="size-3" />
        Recently tracked
      </span>
      {state.recentTracking.map((trackingNumber) => (
        <Link
          key={trackingNumber}
          href={trackingHref(trackingNumber)}
          className="parcel-numeral rounded-sm border border-line bg-surface px-2 py-1 text-[0.6875rem] text-ink-muted transition-colors hover:border-accent-line hover:text-accent-soft-ink"
        >
          {trackingNumber}
        </Link>
      ))}
    </div>
  );
}
