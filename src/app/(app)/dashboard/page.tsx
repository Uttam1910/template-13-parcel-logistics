import type { Metadata } from "next";
import { shipments } from "@/data/shipments";
import { workspacePages } from "@/content/pages";
import { createMetadata } from "@/lib/metadata";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { ButtonLink } from "@/components/ui/Button";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = createMetadata({
  title: "Dashboard",
  description:
    "Network status at a glance — active volume, exceptions and delivery performance.",
  path: "/dashboard",
  noIndex: true,
});

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6">
      <PageHeader
        eyebrow={workspacePages.dashboard.eyebrow}
        title={workspacePages.dashboard.title}
        description={workspacePages.dashboard.description}
        action={
          <ButtonLink href="/shipments" variant="secondary" size="sm">
            Open shipment board
          </ButtonLink>
        }
      />
      <DashboardView shipments={shipments} />
    </div>
  );
}
