import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/metadata";

export default function robots(): MetadataRoute.Robots {
  const base = getBaseUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Private demo surfaces. They hold no real data, but they are not
        // public content and should not appear in search results.
        disallow: [
          "/dashboard",
          "/shipments",
          "/customers",
          "/analytics",
          "/settings",
          "/login",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
