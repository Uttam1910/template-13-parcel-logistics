import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { shipments } from "@/data/shipments";
import { createMetadata } from "@/lib/metadata";
import { getShipmentById } from "@/lib/shipments";
import { ShipmentWorkspace } from "@/components/shipments/ShipmentWorkspace";

export function generateStaticParams() {
  return shipments.map((shipment) => ({ id: shipment.id }));
}

export async function generateMetadata(props: PageProps<"/shipments/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const shipment = getShipmentById(id);

  if (!shipment) {
    return { title: "Shipment not found — Parcel", robots: { index: false, follow: false } };
  }

  return createMetadata({
    title: `${shipment.trackingNumber} — Shipment`,
    description: `Operations view for shipment ${shipment.trackingNumber}.`,
    path: `/shipments/${shipment.id}`,
    noIndex: true,
  });
}

export default async function ShipmentDetailPage(props: PageProps<"/shipments/[id]">) {
  const { id } = await props.params;
  const shipment = getShipmentById(id);
  if (!shipment) notFound();

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6">
      <Link
        href="/shipments"
        className="inline-flex w-fit items-center gap-1.5 text-[0.75rem] font-medium text-ink-muted transition-colors hover:text-accent"
      >
        <ArrowLeft aria-hidden="true" className="size-3.5" />
        All shipments
      </Link>
      <ShipmentWorkspace shipment={shipment} />
    </div>
  );
}
