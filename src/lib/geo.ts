import type { RegionId } from "@/data/types";

/**
 * The abstract coordinate space used by the route and coverage artwork.
 *
 * This is *not* geography. Facility `point` values live in a 0–100 square and
 * are drawn with plain SVG; there is no map provider, no tile server and no GPS
 * anywhere in this template. Every surface that renders it says so.
 */

export const VIEWPORT = { width: 100, height: 100 } as const;

export type RegionShape = {
  id: RegionId;
  /** Polygon points in the 0–100 space. */
  polygon: [number, number][];
  /** Where the region label sits. */
  label: { x: number; y: number };
};

/**
 * Five abstract territories. The silhouettes are invented so the coverage view
 * reads as a network diagram rather than a real coastline.
 */
export const regionShapes: RegionShape[] = [
  {
    id: "north",
    polygon: [
      [18, 4],
      [70, 2],
      [76, 16],
      [64, 30],
      [34, 28],
      [16, 18],
    ],
    label: { x: 44, y: 16 },
  },
  {
    id: "central",
    polygon: [
      [26, 30],
      [64, 30],
      [92, 32],
      [94, 50],
      [70, 56],
      [34, 52],
      [24, 42],
    ],
    label: { x: 60, y: 43 },
  },
  {
    id: "metro",
    polygon: [
      [28, 54],
      [66, 58],
      [64, 80],
      [42, 84],
      [28, 72],
    ],
    label: { x: 46, y: 69 },
  },
  {
    id: "coastal",
    polygon: [
      [6, 60],
      [26, 56],
      [28, 74],
      [34, 96],
      [12, 96],
      [4, 78],
    ],
    label: { x: 18, y: 78 },
  },
  {
    id: "international",
    polygon: [
      [72, 62],
      [96, 60],
      [98, 88],
      [78, 92],
      [68, 78],
    ],
    // Kept clear of the Draymouth node at (88, 76).
    label: { x: 81, y: 85 },
  },
];

/** `points` attribute for an SVG <polygon>. */
export function polygonPoints(shape: RegionShape): string {
  return shape.polygon.map(([x, y]) => `${x},${y}`).join(" ");
}

/**
 * A gently curved path through a series of points.
 *
 * Straight polylines between facilities look like a wiring diagram; a quadratic
 * bend at each waypoint reads as a route. Deterministic: the control point is
 * derived from the segment itself, never randomised.
 */
export function routePath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let index = 1; index < points.length; index += 1) {
    const from = points[index - 1];
    const to = points[index];
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    // Bow the segment perpendicular to its own direction, by a twelfth of its length.
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const controlX = midX - dy / 12;
    const controlY = midY + dx / 12;
    path += ` Q ${controlX.toFixed(2)} ${controlY.toFixed(2)} ${to.x} ${to.y}`;
  }
  return path;
}

/**
 * Position along a multi-point route, 0–1, as an approximate point.
 *
 * Used to place the "current location" marker. Interpolates linearly between
 * waypoints, which is close enough for an illustrative diagram.
 */
export function pointAlong(
  points: { x: number; y: number }[],
  progress: number,
): { x: number; y: number } {
  if (points.length === 0) return { x: 0, y: 0 };
  if (points.length === 1) return points[0];

  const clamped = Math.min(1, Math.max(0, progress));
  const scaled = clamped * (points.length - 1);
  const index = Math.min(points.length - 2, Math.floor(scaled));
  const t = scaled - index;
  const from = points[index];
  const to = points[index + 1];
  return {
    x: from.x + (to.x - from.x) * t,
    y: from.y + (to.y - from.y) * t,
  };
}
