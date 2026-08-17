import type { Metadata } from "next";
import { shipments } from "@/data/shipments";
import { isSortOption, type ShipmentQuery } from "@/lib/filters";
import { workspacePages } from "@/content/pages";
import { createMetadata } from "@/lib/metadata";
import { isStatusFilter } from "@/lib/status";
import { ShipmentsExplorer } from "@/components/shipments/ShipmentsExplorer";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = createMetadata({
  title: "Shipments",
  description: "Search, filter and act on every shipment in the network.",
  path: "/shipments",
  noIndex: true,
});

/** Reads a single value out of a possibly-repeated query parameter. */
function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function ShipmentsPage(props: PageProps<"/shipments">) {
  const params = await props.searchParams;

  const status = first(params.status);
  const sort = first(params.sort);

  const query: ShipmentQuery = {
    search: first(params.q),
    status: isStatusFilter(status) ? status : "all",
    sort: isSortOption(sort) ? sort : "latest",
  };

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6">
      <PageHeader
        eyebrow={workspacePages.shipments.eyebrow}
        title={workspacePages.shipments.title}
        description={workspacePages.shipments.description}
      />
      <ShipmentsExplorer shipments={shipments} query={query} />
    </div>
  );
}
