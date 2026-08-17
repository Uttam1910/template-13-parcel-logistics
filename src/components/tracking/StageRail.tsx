import { Check } from "lucide-react";
import { LIFECYCLE_STAGES, type Shipment } from "@/data/types";
import { formatScan } from "@/lib/format";
import { isOverlayStatus, stageIndex, stageLabels, stageOf, statusMeta } from "@/lib/status";

/**
 * The seven-stage lifecycle rail.
 *
 * Distinct from the event timeline: this always shows all seven stages, so a
 * recipient can see what has not happened yet as well as what has. Future
 * stages stay visible but are clearly inactive — never hidden.
 */
export function StageRail({
  shipment,
  compact = false,
  className = "",
}: {
  shipment: Shipment;
  compact?: boolean;
  className?: string;
}) {
  const current = stageOf(shipment);
  const currentIndex = stageIndex(current);
  const flagged = isOverlayStatus(shipment.status);

  /** The most recent scan recorded at each stage, for the timestamp column. */
  const stampByStage = new Map<string, string>();
  for (const event of shipment.events) stampByStage.set(event.stage, event.at);

  return (
    <ol className={`flex flex-col ${className}`.trim()}>
      {LIFECYCLE_STAGES.map((stage, index) => {
        const done = index < currentIndex;
        const here = index === currentIndex;
        const stamp = stampByStage.get(stage);
        const isLast = index === LIFECYCLE_STAGES.length - 1;

        // A flagged shipment shows its problem tone at the stage it is stuck on.
        const markerTone = here && flagged ? statusMeta[shipment.status].tone : null;

        return (
          <li key={stage} className="relative flex gap-3">
            {/* Rail */}
            <div className="flex w-4 shrink-0 flex-col items-center">
              <span
                aria-hidden="true"
                className={`flex size-4 items-center justify-center rounded-full border ${
                  done
                    ? "border-accent bg-accent text-accent-fg"
                    : here
                      ? markerTone === "warning"
                        ? "border-warning bg-warning-soft"
                        : markerTone === "danger"
                          ? "border-danger bg-danger-soft"
                          : "border-accent bg-accent-soft"
                      : "border-line-strong bg-surface"
                }`}
              >
                {done ? (
                  <Check className="size-2.5" strokeWidth={3} />
                ) : here ? (
                  <span
                    className={`size-1.5 rounded-full ${
                      markerTone === "warning"
                        ? "bg-warning"
                        : markerTone === "danger"
                          ? "bg-danger"
                          : "bg-accent"
                    }`}
                  />
                ) : null}
              </span>
              {isLast ? null : (
                <span
                  aria-hidden="true"
                  className={`w-px flex-1 ${
                    done ? "bg-accent" : "border-l border-dashed border-line-strong"
                  }`}
                />
              )}
            </div>

            {/* Content */}
            <div
              className={`min-w-0 flex-1 ${compact ? "pb-3" : "pb-5"} ${isLast ? "pb-0" : ""}`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <p
                  className={`text-[0.8125rem] ${
                    done || here ? "font-medium text-ink" : "text-ink-faint"
                  }`}
                >
                  {stageLabels[stage]}
                </p>
                {stamp ? (
                  <p className="parcel-numeral text-[0.6875rem] text-ink-faint">
                    {formatScan(stamp)}
                  </p>
                ) : (
                  <p className="parcel-eyebrow text-[0.625rem]">Pending</p>
                )}
              </div>
              {here && flagged ? (
                <p
                  className={`mt-1 text-[0.75rem] leading-relaxed ${
                    markerTone === "danger" ? "text-danger" : "text-warning"
                  }`}
                >
                  {statusMeta[shipment.status].label} at this stage —{" "}
                  {statusMeta[shipment.status].description}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
