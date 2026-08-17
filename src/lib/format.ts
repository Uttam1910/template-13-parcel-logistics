import { DEMO_TODAY } from "@/data/types";

/**
 * Formatting helpers.
 *
 * Everything is rendered in UTC with an explicit locale. That is not a
 * stylistic choice: server and client must produce byte-identical strings or
 * React reports a hydration mismatch, and a logistics interface should be
 * unambiguous about which clock a scan time belongs to anyway.
 */

const DATE = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const DATE_SHORT = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  timeZone: "UTC",
});

const TIME = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

const WEEKDAY = new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "UTC" });

export function formatDate(iso: string): string {
  return DATE.format(new Date(iso));
}

export function formatDateShort(iso: string): string {
  return DATE_SHORT.format(new Date(iso));
}

export function formatTime(iso: string): string {
  return TIME.format(new Date(iso));
}

export function formatWeekday(iso: string): string {
  return WEEKDAY.format(new Date(iso));
}

/** e.g. "16 Aug 2026 · 06:40 UTC" */
export function formatDateTime(iso: string): string {
  return `${DATE.format(new Date(iso))} · ${TIME.format(new Date(iso))} UTC`;
}

/** e.g. "Sun 16 Aug · 06:40" — the compact form used in timelines and tables. */
export function formatScan(iso: string): string {
  const date = new Date(iso);
  return `${WEEKDAY.format(date)} ${DATE_SHORT.format(date)} · ${TIME.format(date)}`;
}

/**
 * Whole days between a timestamp and the demo's "today".
 *
 * Anchored to `DEMO_TODAY` rather than the wall clock so the dataset reads the
 * same on every machine and never drifts out of hydration agreement.
 */
export function daysFromDemoToday(iso: string): number {
  const anchor = new Date(`${DEMO_TODAY}T00:00:00.000Z`).getTime();
  const value = new Date(iso).getTime();
  return Math.round((value - anchor) / 86_400_000);
}

/** "Today", "Yesterday", "In 2 days", "3 days ago" — relative to the demo date. */
export function formatSince(iso: string): string {
  const days = daysFromDemoToday(iso);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  if (days > 1) return `In ${days} days`;
  return `${Math.abs(days)} days ago`;
}

export function formatWeight(kg: number): string {
  if (kg >= 1000)
    return `${(kg / 1000).toLocaleString("en-US", { maximumFractionDigits: 2 })} t`;
  return `${kg.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString("en-US");
}

/** Compact form for chart axes and metric tiles: 12.4k, 1.2M. */
export function formatCompact(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return String(value);
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

export function formatDelta(value: number): string {
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}

/** Hours as "1 d 6 h" / "18 h" — how transit time is quoted operationally. */
export function formatDuration(hours: number): string {
  if (hours < 24) return `${Math.round(hours)} h`;
  const days = Math.floor(hours / 24);
  const rest = Math.round(hours % 24);
  return rest === 0 ? `${days} d` : `${days} d ${rest} h`;
}
