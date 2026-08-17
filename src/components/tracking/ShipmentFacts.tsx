import type { Shipment } from "@/data/types";
import { packageKindLabels, serviceLabels } from "@/data/shipments";
import { formatDate, formatDateTime, formatWeight } from "@/lib/format";
import { destinationFacility, lastEvent, originFacility } from "@/lib/shipments";
import { InfoGrid } from "@/components/ui/display";

/**
 * The shipment details grid — the same facts on the public tracking page and in
 * the operations workspace, because they read the same record.
 */
export function ShipmentFacts({ shipment }: { shipment: Shipment }) {
  const origin = originFacility(shipment);
  const destination = destinationFacility(shipment);
  const latest = lastEvent(shipment);

  return (
    <InfoGrid
      columns={3}
      items={[
        {
          label: "Tracking number",
          value: (
            <span className="parcel-numeral font-semibold">{shipment.trackingNumber}</span>
          ),
        },
        { label: "Service", value: serviceLabels[shipment.service] },
        {
          label: "Package",
          value: `${packageKindLabels[shipment.package.kind]} · ${shipment.package.pieces} ${
            shipment.package.pieces === 1 ? "piece" : "pieces"
          }`,
        },
        {
          label: "Weight",
          value: (
            <span className="parcel-numeral">{formatWeight(shipment.package.weightKg)}</span>
          ),
        },
        { label: "Dimensions", value: shipment.package.dimensions },
        { label: "Recipient", value: shipment.recipient.name },
        {
          label: "Origin",
          value: (
            <>
              {origin.city}
              <span className="block text-[0.75rem] text-ink-faint">
                {origin.name} ({origin.code})
              </span>
            </>
          ),
        },
        {
          label: "Destination",
          value: (
            <>
              {destination.city}
              <span className="block text-[0.75rem] text-ink-faint">
                {destination.name} ({destination.code})
              </span>
            </>
          ),
        },
        { label: "Current location", value: shipment.currentLocation },
        { label: "Created", value: formatDate(shipment.createdAt) },
        { label: "Estimated delivery", value: formatDateTime(shipment.eta) },
        { label: "Last update", value: formatDateTime(latest.at) },
      ]}
    />
  );
}
