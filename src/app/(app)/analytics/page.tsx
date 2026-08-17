import type { Metadata } from "next";
import { workspacePages } from "@/content/pages";
import { createMetadata } from "@/lib/metadata";
import { AnalyticsView } from "@/components/analytics/AnalyticsView";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = createMetadata({
  title: "Analytics",
  description: "Volume, delivery success, on-time rate, transit time, exceptions and returns.",
  path: "/analytics",
  noIndex: true,
});

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6">
      <PageHeader
        eyebrow={workspacePages.analytics.eyebrow}
        title={workspacePages.analytics.title}
        description={workspacePages.analytics.description}
      />
      <AnalyticsView />
    </div>
  );
}
