import type { Metadata } from "next";
import { workspacePages } from "@/content/pages";
import { createMetadata } from "@/lib/metadata";
import { SettingsView } from "@/components/settings/SettingsView";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = createMetadata({
  title: "Settings",
  description: "Profile, notifications, appearance and workspace preferences.",
  path: "/settings",
  noIndex: true,
});

export default function SettingsPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 p-4 sm:p-6">
      <PageHeader
        eyebrow={workspacePages.settings.eyebrow}
        title={workspacePages.settings.title}
        description={workspacePages.settings.description}
      />
      <SettingsView />
    </div>
  );
}
