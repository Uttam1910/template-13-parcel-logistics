import type { Metadata } from "next";
import { siteConfig } from "@/content/site";

/** Base URL used for canonical/OG metadata, sitemap and robots. */
export function getBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL;
  if (fromEnv && /^https?:\/\//.test(fromEnv)) return fromEnv.replace(/\/$/, "");
  return "http://localhost:3000";
}

export function absoluteUrl(path: string): string {
  return `${getBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

type MetadataInput = {
  title: string;
  description: string;
  path: string;
  /** Set on private demo application routes so they stay out of search results. */
  noIndex?: boolean;
};

/**
 * Single source of truth for page metadata: title, description, canonical,
 * Open Graph and Twitter cards.
 *
 * `noIndex` pages deliberately emit no canonical — pointing a private or
 * not-found route at the homepage is worse than emitting nothing.
 */
export function createMetadata({
  title,
  description,
  path,
  noIndex = false,
}: MetadataInput): Metadata {
  const url = absoluteUrl(path);
  const fullTitle = path === "/" ? title : `${title} — ${siteConfig.name}`;

  return {
    title: fullTitle,
    description,
    alternates: noIndex ? undefined : { canonical: url },
    robots: noIndex
      ? { index: false, follow: false, nocache: true }
      : { index: true, follow: true },
    openGraph: {
      type: "website",
      url: noIndex ? undefined : url,
      title: fullTitle,
      description,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };
}
