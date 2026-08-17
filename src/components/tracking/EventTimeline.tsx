import { getFacility, facilityKindLabels } from "@/data/facilities";
import type { Shipment } from "@/data/types";
import { formatDate, formatTime } from "@/lib/format";
import { eventsNewestFirst } from "@/lib/shipments";
import { statusMeta, toneClasses } from "@/lib/status";

/**
 * The scan history.
 *
 * Newest first, with the most recent event emphasised: it carries the status
 * icon, a heavier rule and the facility context. Older scans stay fully legible
 * rather than being faded into decoration.
 */
export function EventTimeline({
  shipment,
  className = "",
}: {
  shipment: Shipment;
  className?: string;
}) {
  const events = eventsNewestFirst(shipment);

  return (
    <ol className={`flex flex-col ${className}`.trim()}>
      {events.map((event, index) => {
        const meta = statusMeta[event.status];
        const Icon = meta.icon;
        const current = index === 0;
        const facility = event.facilityId ? getFacility(event.facilityId) : undefined;
        const isLast = index === events.length - 1;

        return (
          <li key={event.id} className="relative flex gap-3 sm:gap-4">
            <div className="flex shrink-0 flex-col items-center">
              <span
                aria-hidden="true"
                className={`flex size-7 items-center justify-center rounded-sm border ${
                  current ? toneClasses[meta.tone] : "border-line bg-surface-2 text-ink-faint"
                }`}
              >
                <Icon className="size-3.5" strokeWidth={1.75} />
              </span>
              {isLast ? null : <span aria-hidden="true" className="w-px flex-1 bg-line" />}
            </div>

            <div className={`min-w-0 flex-1 ${isLast ? "pb-0" : "pb-6"}`}>
              <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                <p
                  className={`text-[0.875rem] font-semibold ${
                    current ? "text-ink" : "text-ink-muted"
                  }`}
                >
                  {meta.label}
                </p>
                {current ? (
                  <span className="parcel-eyebrow rounded-sm border border-accent-line bg-accent-soft px-1.5 py-0.5 text-[0.5625rem] text-accent-soft-ink">
                    Latest
                  </span>
                ) : null}
              </div>

              <p className="parcel-numeral mt-1 text-[0.6875rem] text-ink-faint">
                {formatDate(event.at)} · {formatTime(event.at)} UTC
              </p>

              <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-muted">
                {event.description}
              </p>

              <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.75rem] text-ink-faint">
                <span className="font-medium text-ink-muted">{event.location}</span>
                {facility ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>
                      {facilityKindLabels[facility.kind]} ({facility.code})
                    </span>
                  </>
                ) : null}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
