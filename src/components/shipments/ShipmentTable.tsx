import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { requireCustomer } from "@/data/customers";
import { requireFacility } from "@/data/facilities";
import type { Shipment } from "@/data/types";
import { serviceLabels } from "@/data/shipments";
import { formatDateShort, formatTime } from "@/lib/format";
import { shipmentHref } from "@/lib/routes";
import { StatusBadge } from "@/components/ui/StatusBadge";

/**
 * The shipment board.
 *
 * One `<table>` at every breakpoint — secondary columns are hidden below `md`
 * rather than switching to a second card markup, so there is one thing to
 * maintain and the header/row relationship stays intact for screen readers.
 */
export function ShipmentTable({
  shipments,
  density = "comfortable",
  caption,
}: {
  shipments: Shipment[];
  density?: "comfortable" | "compact";
  caption: string;
}) {
  const rowPadding = density === "compact" ? "py-2" : "py-3";

  return (
    <div className="parcel-scroll w-full overflow-x-auto">
      <table className="w-full min-w-full border-collapse text-left">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-line">
            {["Tracking", "Customer", "Origin", "Destination", "Status", "ETA"].map(
              (heading) => (
                <th
                  key={heading}
                  scope="col"
                  className={`parcel-eyebrow px-3 py-2.5 font-medium whitespace-nowrap ${
                    heading === "Customer" || heading === "Origin"
                      ? "hidden md:table-cell"
                      : heading === "ETA"
                        ? "hidden sm:table-cell"
                        : ""
                  }`}
                >
                  {heading}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {shipments.map((shipment) => {
            const customer = requireCustomer(shipment.customerId);
            const origin = requireFacility(shipment.originId);
            const destination = requireFacility(shipment.destinationId);

            return (
              <tr
                key={shipment.id}
                className="group border-b border-line last:border-b-0 hover:bg-surface-2"
              >
                <td className={`px-3 ${rowPadding} align-top`}>
                  <Link
                    href={shipmentHref(shipment.id)}
                    className="parcel-numeral inline-flex items-center gap-1 whitespace-nowrap text-[0.8125rem] font-semibold text-ink hover:text-accent"
                  >
                    {shipment.trackingNumber}
                    <ArrowUpRight
                      aria-hidden="true"
                      className="size-3 text-ink-faint opacity-0 transition-opacity group-hover:opacity-100"
                    />
                  </Link>
                  <span className="mt-0.5 block text-[0.6875rem] text-ink-faint md:hidden">
                    {customer.name}
                  </span>
                  <span className="mt-0.5 hidden text-[0.6875rem] text-ink-faint md:block">
                    {serviceLabels[shipment.service]}
                  </span>
                </td>

                <td
                  className={`hidden px-3 md:table-cell ${rowPadding} align-top text-[0.8125rem] text-ink-muted`}
                >
                  {customer.name}
                </td>

                <td
                  className={`hidden px-3 md:table-cell ${rowPadding} align-top text-[0.8125rem] text-ink-muted`}
                >
                  {origin.city}
                  <span className="parcel-numeral mt-0.5 block text-[0.6875rem] text-ink-faint">
                    {origin.code}
                  </span>
                </td>

                <td className={`px-3 ${rowPadding} align-top text-[0.8125rem] text-ink-muted`}>
                  {destination.city}
                  <span className="parcel-numeral mt-0.5 block text-[0.6875rem] text-ink-faint">
                    {destination.code}
                    <span className="whitespace-nowrap sm:hidden">
                      {" "}
                      · ETA {formatDateShort(shipment.eta)}
                    </span>
                  </span>
                </td>

                <td className={`px-3 ${rowPadding} align-top`}>
                  <StatusBadge status={shipment.status} size="sm" />
                </td>

                <td
                  className={`hidden px-3 sm:table-cell ${rowPadding} align-top whitespace-nowrap`}
                >
                  <span className="parcel-numeral text-[0.8125rem] text-ink-muted">
                    {formatDateShort(shipment.eta)}
                  </span>
                  <span className="parcel-numeral mt-0.5 block text-[0.6875rem] text-ink-faint">
                    {formatTime(shipment.eta)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
