import { describe, expect, it } from "vitest";
import { getAnalytics, isRangeId, RANGES, rangeDays } from "@/data/analytics";
import { shipments } from "@/data/shipments";
import { networkMetrics, statusCounts, volumeByDay, deliveriesByDay } from "@/lib/metrics";

describe("analytics ranges", () => {
  it("accepts only known range ids", () => {
    for (const range of RANGES) expect(isRangeId(range)).toBe(true);
    expect(isRangeId("all-time")).toBe(false);
    expect(isRangeId(undefined)).toBe(false);
  });

  it("produces a different number of buckets per range", () => {
    const buckets = RANGES.map((range) => getAnalytics(range).volume.length);
    expect(new Set(buckets).size).toBe(RANGES.length);
  });

  it("covers a longer window as the range widens", () => {
    const days = RANGES.map(rangeDays);
    for (let index = 1; index < days.length; index += 1) {
      expect(days[index]).toBeGreaterThan(days[index - 1]);
    }
  });

  it("changes every series when the range changes", () => {
    const seven = getAnalytics("7d");
    const thirty = getAnalytics("30d");

    expect(seven.volume).not.toEqual(thirty.volume);
    expect(seven.onTime).not.toEqual(thirty.onTime);
    expect(seven.exceptions).not.toEqual(thirty.exceptions);
    expect(seven.returns).not.toEqual(thirty.returns);
    expect(seven.transit).not.toEqual(thirty.transit);
    expect(seven.kpis.map((k) => k.value)).not.toEqual(thirty.kpis.map((k) => k.value));
  });

  it("is deterministic — the same range always returns the same numbers", () => {
    for (const range of RANGES) {
      expect(getAnalytics(range)).toEqual(getAnalytics(range));
    }
  });

  it("reports more total volume over a longer range", () => {
    const total = (range: (typeof RANGES)[number]) =>
      getAnalytics(range).volume.reduce((sum, point) => sum + point.value, 0);
    expect(total("30d")).toBeGreaterThan(total("7d"));
    expect(total("90d")).toBeGreaterThan(total("30d"));
    expect(total("ytd")).toBeGreaterThan(total("90d"));
  });

  it("keeps every series aligned to the same buckets", () => {
    for (const range of RANGES) {
      const result = getAnalytics(range);
      const labels = result.volume.map((point) => point.label);
      expect(result.onTime.map((p) => p.label)).toEqual(labels);
      expect(result.exceptions.map((p) => p.label)).toEqual(labels);
      expect(result.returns.map((p) => p.label)).toEqual(labels);
      expect(result.transit.map((p) => p.label)).toEqual(labels);
    }
  });

  it("produces plausible, bounded figures", () => {
    for (const range of RANGES) {
      const result = getAnalytics(range);
      for (const point of result.onTime) {
        expect(point.value).toBeGreaterThan(80);
        expect(point.value).toBeLessThanOrEqual(100);
      }
      for (const point of result.volume) expect(point.value).toBeGreaterThan(0);
      for (const point of result.transit) expect(point.value).toBeGreaterThan(0);
      for (const point of result.exceptions) expect(point.value).toBeGreaterThanOrEqual(0);
    }
  });

  it("gives every KPI a value and a finite delta", () => {
    for (const range of RANGES) {
      const { kpis } = getAnalytics(range);
      expect(kpis).toHaveLength(6);
      for (const kpi of kpis) {
        expect(kpi.value.length).toBeGreaterThan(0);
        expect(Number.isFinite(kpi.delta)).toBe(true);
        expect(kpi.hint.length).toBeGreaterThan(0);
      }
    }
  });

  it("derives the headline volume from the series it charts", () => {
    for (const range of RANGES) {
      const result = getAnalytics(range);
      const charted = result.volume.reduce((sum, point) => sum + point.value, 0);
      const headline = Number(
        result.kpis.find((k) => k.id === "volume")!.value.replace(/,/g, ""),
      );
      expect(headline).toBe(charted);
    }
  });
});

describe("network metrics", () => {
  it("counts every shipment as either active or delivered", () => {
    const metrics = networkMetrics(shipments);
    const delivered = shipments.filter((s) => s.status === "delivered").length;
    expect(metrics.active + delivered).toBe(shipments.length);
  });

  it("reports a bounded on-time rate", () => {
    const metrics = networkMetrics(shipments);
    expect(metrics.onTimeRate).not.toBeNull();
    expect(metrics.onTimeRate!).toBeGreaterThanOrEqual(0);
    expect(metrics.onTimeRate!).toBeLessThanOrEqual(100);
  });

  it("counts deliveries recorded on the demo date", () => {
    expect(networkMetrics(shipments).deliveredToday).toBeGreaterThan(0);
  });

  it("returns null rather than NaN when there is nothing to average", () => {
    const metrics = networkMetrics([]);
    expect(metrics.onTimeRate).toBeNull();
    expect(metrics.averageTransitHours).toBeNull();
    expect(metrics.active).toBe(0);
  });

  it("distributes every shipment across exactly one status bucket", () => {
    const total = statusCounts(shipments).reduce((sum, entry) => sum + entry.count, 0);
    expect(total).toBe(shipments.length);
  });

  it("charts seven days of volume and deliveries", () => {
    expect(volumeByDay(shipments)).toHaveLength(7);
    expect(deliveriesByDay(shipments)).toHaveLength(7);
    expect(deliveriesByDay(shipments).reduce((sum, p) => sum + p.value, 0)).toBeGreaterThan(0);
  });
});
