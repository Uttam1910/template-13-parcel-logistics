import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { demoNotices } from "@/content/site";
import { serviceLabels } from "@/data/shipments";
import { shipments } from "@/data/shipments";
import { formatDateTime } from "@/lib/format";
import { createMetadata } from "@/lib/metadata";
import {
  destinationFacility,
  getShipmentByTracking,
  lastEvent,
  originFacility,
} from "@/lib/shipments";
import { statusMeta } from "@/lib/status";
import { RouteMap } from "@/components/art/RouteMap";
import { EventTimeline } from "@/components/tracking/EventTimeline";
import { ProofOfDeliveryPanel } from "@/components/tracking/ProofOfDeliveryPanel";
import { RecordTracking } from "@/components/tracking/RecentTracking";
import { ShipmentFacts } from "@/components/tracking/ShipmentFacts";
import { StageRail } from "@/components/tracking/StageRail";
import { TrackingSearch } from "@/components/tracking/TrackingSearch";
import { Container, Panel, PanelHeader, Section } from "@/components/ui/display";
import { StatusBadge, StatusHeadline } from "@/components/ui/StatusBadge";

/** Every demo shipment is prerendered — the dataset is fixed and small. */
export function generateStaticParams() {
  return shipments.map((shipment) => ({ trackingNumber: shipment.trackingNumber }));
}

export async function generateMetadata(
  props: PageProps<"/tracking/[trackingNumber]">,
): Promise<Metadata> {
  const { trackingNumber } = await props.params;
  const shipment = getShipmentByTracking(decodeURIComponent(trackingNumber));

  if (!shipment) {
    return {
      title: "Shipment not found — Parcel",
      robots: { index: false, follow: false },
    };
  }

  const origin = originFacility(shipment);
  const destination = destinationFacility(shipment);

  return createMetadata({
    title: `Tracking ${shipment.trackingNumber}`,
    description: `${statusMeta[shipment.status].label} — ${origin.city} to ${destination.city}. ${demoNotices.tracking}`,
    path: `/tracking/${shipment.trackingNumber}`,
  });
}

export default async function TrackingDetailPage(
  props: PageProps<"/tracking/[trackingNumber]">,
) {
  const { trackingNumber } = await props.params;
  const shipment = getShipmentByTracking(decodeURIComponent(trackingNumber));
  if (!shipment) notFound();

  const origin = originFacility(shipment);
  const destination = destinationFacility(shipment);
  const latest = lastEvent(shipment);

  return (
    <>
      <RecordTracking trackingNumber={shipment.trackingNumber} />

      {/* Header */}
      <div className="border-b border-line bg-surface">
        <Container size="default">
          <div className="py-8 sm:py-10">
            <Link
              href="/tracking"
              className="inline-flex items-center gap-1.5 text-[0.75rem] font-medium text-ink-muted transition-colors hover:text-accent"
            >
              <ArrowLeft aria-hidden="true" className="size-3.5" />
              Track another shipment
            </Link>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <p className="parcel-eyebrow">Tracking number</p>
              <StatusBadge status={shipment.status} />
            </div>

            <h1 className="parcel-numeral mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              {shipment.trackingNumber}
            </h1>

            <p className="mt-4 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.9375rem] text-ink-muted">
              <span className="font-medium text-ink">{origin.city}</span>
              <ArrowRight aria-hidden="true" className="size-4 text-ink-faint" />
              <span className="font-medium text-ink">{destination.city}</span>
              <span aria-hidden="true" className="text-ink-faint">
                ·
              </span>
              <span>{serviceLabels[shipment.service]}</span>
            </p>

            <div className="mt-6 grid gap-4 border-t border-line pt-6 sm:grid-cols-3">
              <div>
                <p className="parcel-eyebrow">Estimated delivery</p>
                <p className="parcel-numeral mt-1.5 text-[0.875rem] text-ink">
                  {formatDateTime(shipment.eta)}
                </p>
              </div>
              <div>
                <p className="parcel-eyebrow">Current location</p>
                <p className="mt-1.5 text-[0.875rem] text-ink">{shipment.currentLocation}</p>
              </div>
              <div>
                <p className="parcel-eyebrow">Last update</p>
                <p className="parcel-numeral mt-1.5 text-[0.875rem] text-ink">
                  {formatDateTime(latest.at)}
                </p>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <Section className="py-8 sm:py-12">
        <Container size="default">
          <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr] lg:items-start">
            {/* Left column */}
            <div className="flex min-w-0 flex-col gap-4">
              <Panel className="p-4 sm:p-5">
                <StatusHeadline status={shipment.status} />
              </Panel>

              <Panel>
                <PanelHeader title="Progress" description="Seven stages, origin to delivery" />
                <div className="p-4 sm:p-5">
                  <StageRail shipment={shipment} />
                </div>
              </Panel>

              <Panel>
                <PanelHeader title="Route" description="Facilities on this shipment's path" />
                <div className="p-4 sm:p-5">
                  <RouteMap shipment={shipment} />
                </div>
              </Panel>

              <Panel>
                <PanelHeader title="Shipment details" />
                <ShipmentFacts shipment={shipment} />
              </Panel>
            </div>

            {/* Right column */}
            <div className="flex min-w-0 flex-col gap-4">
              <Panel>
                <PanelHeader
                  title="Tracking history"
                  description={`${shipment.events.length} scans, newest first`}
                />
                <div className="p-4 sm:p-5">
                  <EventTimeline shipment={shipment} />
                </div>
              </Panel>

              <ProofOfDeliveryPanel shipment={shipment} />

              <Panel className="p-4 sm:p-5">
                <h2 className="text-[0.9375rem] font-semibold">Track another shipment</h2>
                <div className="mt-3">
                  <TrackingSearch showExamples={false} />
                </div>
              </Panel>

              <p className="parcel-eyebrow">{demoNotices.tracking}</p>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
