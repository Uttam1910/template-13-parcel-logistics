import type { MetadataRoute } from "next";
import { shipments } from "@/data/shipments";
import { getBaseUrl } from "@/lib/metadata";

/**
 * Public routes only.
 *
 * The operations workspace (`/dashboard`, `/shipments`, `/customers`,
 * `/analytics`, `/settings`) and the sign-in screen are deliberately excluded:
 * they are private demo surfaces and are also marked `noindex`.
 *
 * Public tracking pages *are* included, because in this template they are the
 * shareable public artefact. Behind a real carrier you would almost certainly
 * drop them — a tracking URL identifies a delivery address.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getBaseUrl();
  const now = new Date("2026-08-17T00:00:00.000Z");

  const staticRoutes = [
    { path: "", priority: 1 },
    { path: "/tracking", priority: 0.9 },
    { path: "/services", priority: 0.8 },
    { path: "/solutions", priority: 0.7 },
    { path: "/coverage", priority: 0.7 },
    { path: "/about", priority: 0.5 },
    { path: "/contact", priority: 0.5 },
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${base}${route.path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: route.priority,
    })),
    ...shipments.map((shipment) => ({
      url: `${base}/tracking/${shipment.trackingNumber}`,
      lastModified: new Date(shipment.events[shipment.events.length - 1].at),
      changeFrequency: "hourly" as const,
      priority: 0.6,
    })),
  ];
}
