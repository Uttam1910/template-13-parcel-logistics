import type { Route } from "next";

/**
 * Typed routes are enabled, so every static `href` in this template is checked
 * at build time. Query strings are the one place a href is assembled at
 * runtime; this is the single documented place where that value is asserted
 * back into `Route`, so no other module needs a cast.
 */
export function withQuery(
  path: Route,
  params: URLSearchParams | Record<string, string | number | undefined | null>,
): Route {
  const search =
    params instanceof URLSearchParams
      ? params
      : new URLSearchParams(
          Object.entries(params)
            .filter(([, value]) => value !== undefined && value !== null && value !== "")
            .map(([key, value]) => [key, String(value)]),
        );
  const query = search.toString();
  return (query ? `${path}?${query}` : path) as Route;
}

/** Public tracking page for a tracking number. */
export function trackingHref(trackingNumber: string): Route {
  return `/tracking/${encodeURIComponent(trackingNumber)}` as Route;
}

/** Internal operations view for a shipment id. */
export function shipmentHref(id: string): Route {
  return `/shipments/${id}` as Route;
}
