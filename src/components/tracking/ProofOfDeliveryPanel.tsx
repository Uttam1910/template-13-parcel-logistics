import { PackageCheck, ShieldQuestion } from "lucide-react";
import type { ProofOfDelivery, Shipment } from "@/data/types";
import { demoNotices } from "@/content/site";
import { formatDateTime } from "@/lib/format";
import { SignatureMark } from "@/components/art/PackageMark";
import { EmptyState } from "@/components/ui/EmptyState";
import { InfoGrid, Panel, PanelHeader } from "@/components/ui/display";

const methodLabels: Record<ProofOfDelivery["method"], string> = {
  signature: "Signature captured",
  left_with_neighbour: "Left with a neighbour",
  safe_place: "Left in an agreed safe place",
  front_desk: "Left at the front desk",
};

const conditionLabels: Record<ProofOfDelivery["packageCondition"], string> = {
  good: "Good — no damage reported",
  minor_damage: "Minor damage to outer packaging",
  damaged: "Damaged — claim raised",
};

const conditionTone: Record<ProofOfDelivery["packageCondition"], string> = {
  good: "text-success",
  minor_damage: "text-warning",
  damaged: "text-danger",
};

/**
 * Proof of delivery.
 *
 * Only rendered as a completed record when the shipment has actually been
 * delivered — otherwise it states plainly that it will appear later, rather
 * than showing an empty or speculative panel.
 */
export function ProofOfDeliveryPanel({
  shipment,
  headingLevel = "h2",
}: {
  shipment: Shipment;
  headingLevel?: "h2" | "h3";
}) {
  const pod = shipment.proofOfDelivery;

  if (!pod) {
    return (
      <Panel>
        <PanelHeader title="Proof of delivery" as={headingLevel} />
        <EmptyState
          icon={ShieldQuestion}
          title="Not delivered yet"
          body="Proof of delivery will appear here after delivery — including who received the parcel, where, and the condition it arrived in."
        />
      </Panel>
    );
  }

  return (
    <Panel>
      <PanelHeader
        title="Proof of delivery"
        as={headingLevel}
        action={
          <span className="inline-flex items-center gap-1.5 rounded-sm border border-success/30 bg-success-soft px-2 py-1 text-[0.6875rem] font-medium text-success">
            <PackageCheck aria-hidden="true" className="size-3.5" />
            Complete
          </span>
        }
      />

      <InfoGrid
        columns={2}
        items={[
          { label: "Delivered", value: formatDateTime(pod.deliveredAt) },
          { label: "Received by", value: pod.receivedBy },
          { label: "Location", value: pod.location },
          { label: "Method", value: methodLabels[pod.method] },
          {
            label: "Package condition",
            value: (
              <span className={conditionTone[pod.packageCondition]}>
                {conditionLabels[pod.packageCondition]}
              </span>
            ),
          },
          { label: "Note", value: pod.note, wide: true },
        ]}
      />

      <div className="flex flex-col gap-3 border-t border-line px-4 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-5">
        <div>
          <p className="parcel-eyebrow">Signature</p>
          <SignatureMark
            initials={pod.signatureInitials}
            className="mt-1 h-12 w-44 text-ink-muted"
          />
          <p className="parcel-numeral text-[0.6875rem] text-ink-faint">
            {pod.signatureInitials} · {shipment.trackingNumber}
          </p>
        </div>
        <p className="parcel-eyebrow text-[0.5625rem] sm:text-right">{demoNotices.pod}</p>
      </div>
    </Panel>
  );
}
