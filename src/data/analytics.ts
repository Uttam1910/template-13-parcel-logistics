import { DEMO_TODAY } from "./types";

/**
 * Analytics series.
 *
 * These are *illustrative* operating figures for a network far larger than the
 * eighteen demo shipments, so they are generated rather than tallied — but they
 * are generated deterministically: the same range always produces the same
 * numbers, on the server and in the browser, with no `Math.random()` anywhere.
 *
 * Changing the range genuinely re-buckets and re-generates every series; no
 * control in this template is decorative.
 */

export const RANGES = ["7d", "30d", "90d", "ytd"] as const;
export type RangeId = (typeof RANGES)[number];

export const rangeLabels: Record<RangeId, string> = {
  "7d": "7D",
  "30d": "30D",
  "90d": "90D",
  ytd: "YTD",
};

export const rangeDescriptions: Record<RangeId, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  ytd: "Year to date",
};

export function isRangeId(value: string | undefined): value is RangeId {
  return value !== undefined && (RANGES as readonly string[]).includes(value);
}

/* ------------------------------------------------------------------ *
 * Deterministic noise
 * ------------------------------------------------------------------ */

function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** mulberry32 — small, fast, and stable across platforms. */
function makeRandom(seed: string): () => number {
  let state = hashSeed(seed);
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ *
 * Buckets
 * ------------------------------------------------------------------ */

export type SeriesPoint = { label: string; value: number };

type Bucket = { label: string; days: number };

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const today = new Date(`${DEMO_TODAY}T00:00:00.000Z`);

function shiftDays(days: number): Date {
  return new Date(today.getTime() + days * 86_400_000);
}

/** How each range is divided up for charting. */
function bucketsFor(range: RangeId): Bucket[] {
  if (range === "7d") {
    return Array.from({ length: 7 }, (_, index) => {
      const date = shiftDays(index - 6);
      return { label: WEEKDAYS[date.getUTCDay()], days: 1 };
    });
  }

  if (range === "30d") {
    return Array.from({ length: 10 }, (_, index) => {
      const date = shiftDays((index - 9) * 3);
      return { label: `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]}`, days: 3 };
    });
  }

  if (range === "90d") {
    return Array.from({ length: 12 }, (_, index) => {
      const date = shiftDays((index - 11) * 7 - 6);
      return { label: `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]}`, days: 7.5 };
    });
  }

  // Year to date: whole months up to and including the current one.
  const monthCount = today.getUTCMonth() + 1;
  return Array.from({ length: monthCount }, (_, index) => {
    const isCurrent = index === monthCount - 1;
    const daysInMonth = new Date(Date.UTC(today.getUTCFullYear(), index + 1, 0)).getUTCDate();
    return {
      label: MONTHS[index],
      days: isCurrent ? today.getUTCDate() : daysInMonth,
    };
  });
}

export function rangeDays(range: RangeId): number {
  return bucketsFor(range).reduce((total, bucket) => total + bucket.days, 0);
}

/* ------------------------------------------------------------------ *
 * Series
 * ------------------------------------------------------------------ */

/** Baseline network throughput per day, before seasonal and random variation. */
const DAILY_VOLUME = 1840;

type Generated = {
  volume: SeriesPoint[];
  onTime: SeriesPoint[];
  exceptions: SeriesPoint[];
  returns: SeriesPoint[];
  transit: SeriesPoint[];
};

function generate(range: RangeId, epoch: "current" | "previous"): Generated {
  const buckets = bucketsFor(range);
  const random = makeRandom(`parcel:${range}:${epoch}`);
  // The previous period sits slightly lower, so growth deltas read positive.
  const drift = epoch === "previous" ? 0.94 : 1;

  const volume: SeriesPoint[] = [];
  const onTime: SeriesPoint[] = [];
  const exceptions: SeriesPoint[] = [];
  const returns: SeriesPoint[] = [];
  const transit: SeriesPoint[] = [];

  buckets.forEach((bucket, index) => {
    // Gentle upward trend across the window plus bounded deterministic noise.
    const trend = 1 + (index / Math.max(1, buckets.length - 1)) * 0.12;
    const noise = 0.9 + random() * 0.2;
    const bucketVolume = Math.round(DAILY_VOLUME * bucket.days * trend * noise * drift);

    volume.push({ label: bucket.label, value: bucketVolume });
    onTime.push({
      label: bucket.label,
      value: Number((93.2 + random() * 5.2 - (epoch === "previous" ? 1.6 : 0)).toFixed(1)),
    });
    exceptions.push({
      label: bucket.label,
      value: Math.round(bucketVolume * (0.006 + random() * 0.007)),
    });
    returns.push({
      label: bucket.label,
      value: Math.round(bucketVolume * (0.021 + random() * 0.012)),
    });
    transit.push({
      label: bucket.label,
      value: Number((28.4 + random() * 6.4 + (epoch === "previous" ? 1.9 : 0)).toFixed(1)),
    });
  });

  return { volume, onTime, exceptions, returns, transit };
}

const sum = (points: SeriesPoint[]) => points.reduce((total, point) => total + point.value, 0);
const mean = (points: SeriesPoint[]) => (points.length ? sum(points) / points.length : 0);

export type Kpi = {
  id: string;
  label: string;
  value: string;
  /** Percentage change against the preceding period of the same length. */
  delta: number;
  /** Whether an increase is a good thing — drives the arrow, not just colour. */
  higherIsBetter: boolean;
  hint: string;
};

export type AnalyticsResult = {
  range: RangeId;
  label: string;
  description: string;
  days: number;
  volume: SeriesPoint[];
  onTime: SeriesPoint[];
  exceptions: SeriesPoint[];
  returns: SeriesPoint[];
  transit: SeriesPoint[];
  kpis: Kpi[];
};

function percentChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

function formatCount(value: number): string {
  return value.toLocaleString("en-US");
}

export function getAnalytics(range: RangeId): AnalyticsResult {
  const current = generate(range, "current");
  const previous = generate(range, "previous");

  const shipped = sum(current.volume);
  const exceptions = sum(current.exceptions);
  const returned = sum(current.returns);
  const onTimeRate = mean(current.onTime);
  const transitAvg = mean(current.transit);
  const successRate = 100 - (exceptions / Math.max(1, shipped)) * 100;

  const prevShipped = sum(previous.volume);
  const prevExceptions = sum(previous.exceptions);
  const prevReturned = sum(previous.returns);
  const prevSuccess = 100 - (prevExceptions / Math.max(1, prevShipped)) * 100;

  const kpis: Kpi[] = [
    {
      id: "volume",
      label: "Shipment volume",
      value: formatCount(shipped),
      delta: percentChange(shipped, prevShipped),
      higherIsBetter: true,
      hint: "Parcels entering the network in this period.",
    },
    {
      id: "success",
      label: "Delivery success",
      value: `${successRate.toFixed(1)}%`,
      delta: percentChange(successRate, prevSuccess),
      higherIsBetter: true,
      hint: "Shipments completed without an unresolved exception.",
    },
    {
      id: "on-time",
      label: "On-time rate",
      value: `${onTimeRate.toFixed(1)}%`,
      delta: percentChange(onTimeRate, mean(previous.onTime)),
      higherIsBetter: true,
      hint: "Delivered on or before the estimated delivery date.",
    },
    {
      id: "transit",
      label: "Average transit time",
      value: `${transitAvg.toFixed(1)} h`,
      delta: percentChange(transitAvg, mean(previous.transit)),
      higherIsBetter: false,
      hint: "Collection to delivery, averaged across all services.",
    },
    {
      id: "exceptions",
      label: "Exceptions",
      value: formatCount(exceptions),
      delta: percentChange(exceptions, prevExceptions),
      higherIsBetter: false,
      hint: "Shipments that needed manual intervention.",
    },
    {
      id: "returns",
      label: "Returns",
      value: formatCount(returned),
      delta: percentChange(returned, prevReturned),
      higherIsBetter: false,
      hint: "Parcels routed back to the shipper.",
    },
  ];

  return {
    range,
    label: rangeLabels[range],
    description: rangeDescriptions[range],
    days: rangeDays(range),
    ...current,
    kpis,
  };
}
