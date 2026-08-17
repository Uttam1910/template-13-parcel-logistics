import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PackageX } from "lucide-react";
import { demoNotices } from "@/content/site";
import { trackingPage } from "@/content/pages";
import { featuredTrackingNumbers } from "@/data/shipments";
import { createMetadata } from "@/lib/metadata";
import { getShipmentByTracking, normalizeTrackingNumber } from "@/lib/shipments";
import { trackingHref } from "@/lib/routes";
import { RecentTracking } from "@/components/tracking/RecentTracking";
import { TrackingSearch } from "@/components/tracking/TrackingSearch";
import { EmptyState } from "@/components/ui/EmptyState";
import { Container, Panel, Section } from "@/components/ui/display";

export const metadata: Metadata = createMetadata({
  title: "Track a shipment",
  description:
    "Enter a Parcel tracking number to see status, route, scan history and proof of delivery. Demo tracking — no live carrier data.",
  path: "/tracking",
});

/**
 * The tracking lookup.
 *
 * Resolution happens on the server: a hit redirects to the shipment page, a
 * miss renders the not-found state on this page with the query preserved. That
 * keeps the whole flow working with JavaScript disabled and gives every
 * shipment a real, shareable URL.
 */
export default async function TrackingPage(props: PageProps<"/tracking">) {
  const params = await props.searchParams;
  const raw =
    typeof params.q === "string" ? params.q : Array.isArray(params.q) ? params.q[0] : "";
  const query = raw.trim();

  if (query) {
    const shipment = getShipmentByTracking(query);
    if (shipment) redirect(trackingHref(shipment.trackingNumber));
  }

  const notFound = query.length > 0;
  const normalized = notFound ? normalizeTrackingNumber(query) : "";

  return (
    <Section className="py-12 sm:py-16">
      <Container size="default">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="h-px w-6 bg-accent" />
            <p className="parcel-eyebrow">{trackingPage.intro.eyebrow}</p>
          </div>
          <h1 className="mt-4 text-3xl tracking-tight text-balance sm:text-4xl">
            {trackingPage.intro.headline}
          </h1>
          <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-muted">
            {trackingPage.intro.body}
          </p>
        </div>

        <div className="mt-8 border border-line bg-surface p-5 sm:p-6">
          <TrackingSearch
            size="lg"
            autoFocus
            defaultValue={query}
            error={
              notFound ? trackingPage.notFound.error.replace("{number}", normalized) : undefined
            }
          />
        </div>

        {notFound ? (
          <Panel className="mt-6">
            <EmptyState
              icon={PackageX}
              tone="warning"
              title={trackingPage.notFound.title}
              body={trackingPage.notFound.body.replace("{number}", normalized)}
            />
          </Panel>
        ) : null}

        <div className="mt-8">
          <RecentTracking />
        </div>

        {/* What you get — worth stating before someone has a number to try. */}
        <div className="mt-12 grid gap-px border border-line bg-line sm:grid-cols-3">
          {trackingPage.explains.map((item) => (
            <div key={item.title} className="bg-surface p-5">
              <h2 className="text-[0.9375rem] font-semibold">{item.title}</h2>
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-muted">
                {item.body}
              </p>
            </div>
          ))}
        </div>

        <p className="parcel-eyebrow mt-8">
          {demoNotices.tracking} {featuredTrackingNumbers.length} demo shipments are trackable.
        </p>
      </Container>
    </Section>
  );
}
