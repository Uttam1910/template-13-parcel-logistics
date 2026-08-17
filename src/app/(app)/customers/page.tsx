import type { Metadata } from "next";
import { shipments } from "@/data/shipments";
import { workspacePages } from "@/content/pages";
import { createMetadata } from "@/lib/metadata";
import { CustomersView } from "@/components/customers/CustomersView";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = createMetadata({
  title: "Customers",
  description: "Shipper accounts, shipment history and delivery performance.",
  path: "/customers",
  noIndex: true,
});

export default function CustomersPage() {
  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6">
      <PageHeader
        eyebrow={workspacePages.customers.eyebrow}
        title={workspacePages.customers.title}
        description={workspacePages.customers.description}
      />
      <CustomersView shipments={shipments} />
    </div>
  );
}
