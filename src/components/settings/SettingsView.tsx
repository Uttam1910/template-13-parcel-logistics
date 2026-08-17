"use client";

import { useState } from "react";
import { Monitor, Moon, RotateCcw, Sun } from "lucide-react";
import { RANGES, rangeDescriptions, rangeLabels } from "@/data/analytics";
import { demoAccount } from "@/data/users";
import { demoNotices } from "@/content/site";
import { useDemo, useNotifications, usePreferences } from "@/lib/demo/store";
import { useTheme, type ThemePreference } from "@/lib/demo/theme";
import { Button } from "@/components/ui/Button";
import { DemoNotice } from "@/components/ui/DemoNotice";
import { Dialog } from "@/components/ui/Dialog";
import { Panel, PanelHeader } from "@/components/ui/display";
import { Field, Input, Select, Toggle } from "@/components/ui/form";
import { useToast } from "@/components/ui/Toast";

const themeOptions: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

const notificationCopy: {
  key: keyof ReturnType<typeof useNotifications>["notifications"];
  label: string;
  description: string;
}[] = [
  {
    key: "exceptions",
    label: "Exceptions",
    description: "A shipment needs manual intervention.",
  },
  { key: "delays", label: "Delays", description: "A shipment is running behind its estimate." },
  {
    key: "outForDelivery",
    label: "Out for delivery",
    description: "A shipment has been loaded on a delivery round.",
  },
  {
    key: "deliveryConfirmations",
    label: "Delivery confirmations",
    description: "Proof of delivery has been captured.",
  },
  {
    key: "weeklySummary",
    label: "Weekly summary",
    description: "On-time rate and exception totals for the week.",
  },
];

/**
 * Workspace settings.
 *
 * The appearance control drives the real theme system — the same one the header
 * toggle uses — and the preferences here genuinely change the workspace:
 * density affects table rows, the default range is what `/analytics` opens on.
 */
export function SettingsView() {
  const { preference, setPreference } = useTheme();
  const { notifications, setNotifications } = useNotifications();
  const { preferences, setPreferences } = usePreferences();
  const { state, dispatch, resetDemo } = useDemo();
  const { notify } = useToast();

  const [confirmReset, setConfirmReset] = useState(false);
  const [saved, setSaved] = useState(false);

  const profileName = state.profile.name || demoAccount.user.name;
  const profileEmail = state.profile.email || demoAccount.user.email;
  const profileRole = state.profile.role || demoAccount.user.role;

  return (
    <div className="flex flex-col gap-4">
      {/* Profile */}
      <Panel>
        <PanelHeader title="Profile" description="Stored in this browser only" />
        <form
          className="flex flex-col gap-4 p-4 sm:p-5"
          onSubmit={(event) => {
            event.preventDefault();
            setSaved(true);
            notify("Profile saved to this browser.", "info");
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="profile-name" label="Name" required>
              <Input
                id="profile-name"
                value={profileName}
                onChange={(event) => {
                  dispatch({ type: "set-profile", patch: { name: event.target.value } });
                  setSaved(false);
                }}
                autoComplete="name"
              />
            </Field>
            <Field id="profile-email" label="Email" required>
              <Input
                id="profile-email"
                type="email"
                value={profileEmail}
                onChange={(event) => {
                  dispatch({ type: "set-profile", patch: { email: event.target.value } });
                  setSaved(false);
                }}
                autoComplete="email"
              />
            </Field>
            <Field id="profile-role" label="Role" className="sm:col-span-2">
              <Input
                id="profile-role"
                value={profileRole}
                onChange={(event) => {
                  dispatch({ type: "set-profile", patch: { role: event.target.value } });
                  setSaved(false);
                }}
              />
            </Field>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" size="sm">
              Save profile
            </Button>
            {saved ? (
              <p role="status" className="text-[0.8125rem] text-success">
                Saved. {demoNotices.account}
              </p>
            ) : null}
          </div>
        </form>
      </Panel>

      {/* Notifications */}
      <Panel>
        <PanelHeader
          title="Notifications"
          description="Which events would raise an alert in a connected system"
        />
        <div className="divide-y divide-line px-4 sm:px-5">
          {notificationCopy.map((item) => (
            <Toggle
              key={item.key}
              id={`notify-${item.key}`}
              label={item.label}
              description={item.description}
              checked={notifications[item.key]}
              onChange={(next) => setNotifications({ [item.key]: next })}
            />
          ))}
        </div>
        <div className="border-t border-line p-4 sm:px-5">
          <DemoNotice variant="block">
            No email, SMS or webhook is sent. These switches record a preference in this browser
            so you can see the wiring.
          </DemoNotice>
        </div>
      </Panel>

      {/* Appearance */}
      <Panel>
        <PanelHeader title="Appearance" description="Applies immediately and persists" />
        <div className="p-4 sm:p-5">
          <fieldset>
            <legend className="parcel-eyebrow mb-3">Theme</legend>
            <div className="flex flex-wrap gap-2">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                const active = preference === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPreference(option.value)}
                    aria-pressed={active}
                    className={`inline-flex h-10 items-center gap-2 rounded-sm border px-4 text-[0.8125rem] font-medium transition-colors ${
                      active
                        ? "border-accent bg-accent-soft text-accent-soft-ink"
                        : "border-line-strong bg-surface text-ink-muted hover:bg-surface-2 hover:text-ink"
                    }`}
                  >
                    <Icon aria-hidden="true" className="size-4" />
                    {option.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-[0.75rem] text-ink-faint">
              “System” follows your operating system setting and updates live when it changes.
            </p>
          </fieldset>
        </div>
      </Panel>

      {/* Preferences */}
      <Panel>
        <PanelHeader title="Preferences" description="Workspace behaviour" />
        <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
          <Field
            id="pref-density"
            label="Table density"
            hint="Row height on the shipment and dashboard tables."
          >
            <Select
              id="pref-density"
              value={preferences.density}
              onChange={(event) =>
                setPreferences({ density: event.target.value as "comfortable" | "compact" })
              }
              aria-describedby="pref-density-hint"
            >
              <option value="comfortable">Comfortable</option>
              <option value="compact">Compact</option>
            </Select>
          </Field>

          <Field
            id="pref-range"
            label="Default analytics range"
            hint="The range the analytics screen opens on."
          >
            <Select
              id="pref-range"
              value={preferences.defaultRange}
              onChange={(event) =>
                setPreferences({ defaultRange: event.target.value as (typeof RANGES)[number] })
              }
              aria-describedby="pref-range-hint"
            >
              {RANGES.map((option) => (
                <option key={option} value={option}>
                  {rangeLabels[option]} — {rangeDescriptions[option]}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="border-t border-line px-4 sm:px-5">
          <Toggle
            id="pref-notices"
            label="Show demo notices"
            description="The small labels marking where the demo boundary is. Turn off for screenshots."
            checked={preferences.showDemoNotices}
            onChange={(next) => setPreferences({ showDemoNotices: next })}
          />
        </div>
      </Panel>

      {/* Danger zone */}
      <Panel className="border-danger/30">
        <PanelHeader
          title="Reset demo data"
          description="Clears every local change made in this browser"
        />
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <p className="max-w-xl text-[0.8125rem] leading-relaxed text-ink-muted">
            Status changes, exceptions, delivery confirmations, internal notes, tracking
            history, preferences and the demo session all return to their starting state. The
            authored dataset in <span className="parcel-numeral">src/data</span> is never
            modified.
          </p>
          <Button variant="danger" onClick={() => setConfirmReset(true)} className="shrink-0">
            <RotateCcw aria-hidden="true" className="size-3.5" />
            Reset demo data
          </Button>
        </div>
      </Panel>

      <Dialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Reset demo data?"
        description="This cannot be undone — but nothing real is affected."
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmReset(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                resetDemo();
                setConfirmReset(false);
                setSaved(false);
                notify("Demo data reset. All local changes have been cleared.");
              }}
            >
              Reset demo data
            </Button>
          </>
        }
      >
        <p className="text-[0.875rem] leading-relaxed text-ink-muted">
          Every local edit will be discarded and the workspace will return to the authored demo
          dataset. Your theme choice is stored separately and will be kept.
        </p>
      </Dialog>
    </div>
  );
}
