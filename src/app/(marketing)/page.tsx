import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { closing, hero, howItWorks, sections, useCases, visibility } from "@/content/home";
import { coverageRegions } from "@/content/coverage";
import { services } from "@/content/services";
import { demoNotices, siteConfig } from "@/content/site";
import { facilities } from "@/data/facilities";
import { formatDateTime, formatNumber } from "@/lib/format";
import { createMetadata } from "@/lib/metadata";
import { getShipmentByTracking, destinationFacility, originFacility } from "@/lib/shipments";
import { trackingHref } from "@/lib/routes";
import { CoverageMap } from "@/components/art/CoverageMap";
import { RouteMap } from "@/components/art/RouteMap";
import { StageRail } from "@/components/tracking/StageRail";
import { TrackingSearch } from "@/components/tracking/TrackingSearch";
import { ButtonLink } from "@/components/ui/Button";
import { Container, Panel, Section, SectionHeading } from "@/components/ui/display";
import { StatusBadge } from "@/components/ui/StatusBadge";

export const metadata: Metadata = createMetadata({
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
  path: "/",
});

export default function HomePage() {
  // The hero card is a real record from the dataset, not a mock-up.
  const featured = getShipmentByTracking("PKL-10482");
  if (!featured) throw new Error("Featured demo shipment is missing from the dataset");

  const origin = originFacility(featured);
  const destination = destinationFacility(featured);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line">
        <div aria-hidden="true" className="parcel-graticule absolute inset-0" />
        <Container size="wide" className="relative">
          <div className="grid items-center gap-12 py-16 lg:grid-cols-[1.05fr_1fr] lg:py-24">
            <div>
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="h-px w-6 bg-accent" />
                <p className="parcel-eyebrow">{hero.eyebrow}</p>
              </div>

              <h1 className="mt-5 text-4xl leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">
                {hero.headline}
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
                {hero.body}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href={hero.primaryCta.href} size="lg">
                  {hero.primaryCta.label}
                  <ArrowRight aria-hidden="true" className="size-4" />
                </ButtonLink>
                <ButtonLink href={hero.secondaryCta.href} variant="secondary" size="lg">
                  {hero.secondaryCta.label}
                </ButtonLink>
              </div>

              <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-8 sm:grid-cols-4">
                {siteConfig.stats.map((stat) => (
                  <div key={stat.label}>
                    <dt className="parcel-eyebrow">{stat.label}</dt>
                    <dd className="parcel-numeral mt-1.5 text-2xl font-semibold tracking-tight">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Live shipment card — the product, not an illustration of it. */}
            <Panel className="shadow-parcel-lg">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
                <div className="min-w-0">
                  <p className="parcel-eyebrow">Live example</p>
                  <p className="parcel-numeral mt-1 text-base font-semibold">
                    {featured.trackingNumber}
                  </p>
                </div>
                <StatusBadge status={featured.status} />
              </div>

              <div className="border-b border-line px-4 py-3 sm:px-5">
                <p className="flex flex-wrap items-center gap-2 text-[0.8125rem] text-ink-muted">
                  <span className="font-medium text-ink">{origin.city}</span>
                  <ArrowRight aria-hidden="true" className="size-3.5 text-ink-faint" />
                  <span className="font-medium text-ink">{destination.city}</span>
                  <span aria-hidden="true" className="text-ink-faint">
                    ·
                  </span>
                  <span className="parcel-numeral text-[0.75rem] text-ink-faint">
                    ETA {formatDateTime(featured.eta)}
                  </span>
                </p>
              </div>

              <div className="px-4 py-4 sm:px-5">
                <StageRail shipment={featured} compact />
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3 sm:px-5">
                <p className="parcel-eyebrow text-[0.5625rem]">{demoNotices.tracking}</p>
                <Link
                  href={trackingHref(featured.trackingNumber)}
                  className="inline-flex items-center gap-1 text-[0.75rem] font-medium text-accent hover:underline"
                >
                  Open tracking page
                  <ArrowUpRight aria-hidden="true" className="size-3.5" />
                </Link>
              </div>
            </Panel>
          </div>
        </Container>
      </section>

      {/* Tracking demo */}
      <Section labelledBy="track-heading" className="border-b border-line bg-surface">
        <Container size="wide">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-center">
            <SectionHeading
              as="h2"
              eyebrow={sections.tracking.eyebrow}
              title={<span id="track-heading">{sections.tracking.title}</span>}
              body={sections.tracking.body}
            />
            <div className="border border-line bg-bg p-5 sm:p-6">
              <TrackingSearch size="lg" />
            </div>
          </div>
        </Container>
      </Section>

      {/* How it works */}
      <Section labelledBy="how-heading">
        <Container size="wide">
          <SectionHeading
            as="h2"
            eyebrow={sections.how.eyebrow}
            title={<span id="how-heading">{sections.how.title}</span>}
            body={sections.how.body}
          />

          <ol className="mt-10 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((step) => {
              const Icon = step.icon;
              return (
                <li key={step.step} className="flex flex-col gap-3 bg-surface p-5">
                  <div className="flex items-center justify-between">
                    <span className="parcel-numeral text-[0.6875rem] font-semibold text-accent">
                      {step.step}
                    </span>
                    <Icon
                      aria-hidden="true"
                      className="size-4 text-ink-faint"
                      strokeWidth={1.75}
                    />
                  </div>
                  <h3 className="text-[0.9375rem] font-semibold">{step.title}</h3>
                  <p className="text-[0.8125rem] leading-relaxed text-ink-muted">{step.body}</p>
                </li>
              );
            })}
          </ol>
        </Container>
      </Section>

      {/* Shipment lifecycle + route */}
      <Section labelledBy="lifecycle-heading" className="border-y border-line bg-surface">
        <Container size="wide">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
            <div>
              <SectionHeading
                as="h2"
                eyebrow={sections.lifecycle.eyebrow}
                title={<span id="lifecycle-heading">{sections.lifecycle.title}</span>}
                body={sections.lifecycle.body}
              />
              <div className="mt-8 border border-line bg-bg p-5">
                <StageRail shipment={featured} />
              </div>
            </div>

            <div>
              <SectionHeading
                as="h2"
                eyebrow={sections.route.eyebrow}
                title={sections.route.title}
                body={sections.route.body}
              />
              <div className="mt-8">
                <RouteMap shipment={featured} />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Operational visibility */}
      <Section labelledBy="visibility-heading">
        <Container size="wide">
          <SectionHeading
            as="h2"
            eyebrow={sections.visibility.eyebrow}
            title={<span id="visibility-heading">{sections.visibility.title}</span>}
            body={sections.visibility.body}
          />

          <div className="mt-10 grid gap-px border border-line bg-line md:grid-cols-3">
            {visibility.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex flex-col gap-3 bg-surface p-6">
                  <Icon aria-hidden="true" className="size-5 text-accent" strokeWidth={1.5} />
                  <h3 className="text-[0.9375rem] font-semibold">{item.title}</h3>
                  <p className="text-[0.8125rem] leading-relaxed text-ink-muted">{item.body}</p>
                </div>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* Services */}
      <Section labelledBy="services-heading" className="border-y border-line bg-surface">
        <Container size="wide">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              as="h2"
              eyebrow={sections.services.eyebrow}
              title={<span id="services-heading">{sections.services.title}</span>}
              body={sections.services.body}
            />
            <ButtonLink href="/services" variant="secondary" size="sm">
              All services
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </ButtonLink>
          </div>

          <ul className="mt-10 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <li key={service.id} className="flex flex-col gap-3 bg-bg p-5">
                <h3 className="text-[0.9375rem] font-semibold">{service.name}</h3>
                <p className="flex-1 text-[0.8125rem] leading-relaxed text-ink-muted">
                  {service.summary}
                </p>
                <p className="parcel-numeral border-t border-line pt-3 text-[0.75rem] text-ink-faint">
                  {service.characteristics[0].value}
                </p>
              </li>
            ))}
            {/* Fills the sixth cell of the grid so it never reads as a gap. */}
            <li className="bg-bg">
              <Link
                href="/services"
                className="flex h-full flex-col justify-between gap-3 p-5 transition-colors hover:bg-surface-2"
              >
                <h3 className="text-[0.9375rem] font-semibold">Compare every service</h3>
                <p className="flex-1 text-[0.8125rem] leading-relaxed text-ink-muted">
                  Transit windows, scan cadence, weight ceilings and proof of delivery, side by
                  side.
                </p>
                <span className="inline-flex items-center gap-1.5 border-t border-line pt-3 text-[0.75rem] font-medium text-accent">
                  All services
                  <ArrowRight aria-hidden="true" className="size-3.5" />
                </span>
              </Link>
            </li>
          </ul>
        </Container>
      </Section>

      {/* Coverage */}
      <Section labelledBy="coverage-heading">
        <Container size="wide">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div>
              <SectionHeading
                as="h2"
                eyebrow={sections.coverage.eyebrow}
                title={<span id="coverage-heading">{sections.coverage.title}</span>}
                body={sections.coverage.body}
              />

              <ul className="mt-8 flex flex-col border border-line bg-surface">
                {coverageRegions.map((region) => (
                  <li
                    key={region.id}
                    className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="text-[0.875rem] font-medium text-ink">{region.name}</p>
                      <p className="text-[0.75rem] text-ink-faint">
                        {region.hubs.length}{" "}
                        {region.hubs.length === 1 ? "facility" : "facilities"}
                      </p>
                    </div>
                    <p className="parcel-numeral shrink-0 text-[0.75rem] text-ink-muted">
                      {region.transit}
                    </p>
                  </li>
                ))}
              </ul>

              <ButtonLink href="/coverage" variant="secondary" size="sm" className="mt-6">
                Coverage & transit times
                <ArrowRight aria-hidden="true" className="size-3.5" />
              </ButtonLink>
            </div>

            <CoverageMap />
          </div>
        </Container>
      </Section>

      {/* Performance */}
      <Section labelledBy="performance-heading" className="border-y border-line bg-surface">
        <Container size="wide">
          <SectionHeading
            as="h2"
            eyebrow={sections.performance.eyebrow}
            title={<span id="performance-heading">{sections.performance.title}</span>}
            body={sections.performance.body}
          />

          <dl className="mt-10 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-bg p-5">
              <dt className="parcel-eyebrow">Facilities</dt>
              <dd className="parcel-numeral mt-2 text-3xl font-semibold tracking-tight">
                {facilities.length}
              </dd>
              <p className="mt-2 text-[0.75rem] text-ink-faint">Across five regions</p>
            </div>
            <div className="bg-bg p-5">
              <dt className="parcel-eyebrow">Daily throughput</dt>
              <dd className="parcel-numeral mt-2 text-3xl font-semibold tracking-tight">
                {formatNumber(
                  facilities.reduce((total, facility) => total + facility.dailyVolume, 0),
                )}
              </dd>
              <p className="mt-2 text-[0.75rem] text-ink-faint">Parcels handled per day</p>
            </div>
            <div className="bg-bg p-5">
              <dt className="parcel-eyebrow">On-time rate</dt>
              <dd className="parcel-numeral mt-2 text-3xl font-semibold tracking-tight">
                96.4%
              </dd>
              <p className="mt-2 text-[0.75rem] text-ink-faint">Rolling ninety-day average</p>
            </div>
            <div className="bg-bg p-5">
              <dt className="parcel-eyebrow">Lifecycle stages</dt>
              <dd className="parcel-numeral mt-2 text-3xl font-semibold tracking-tight">7</dd>
              <p className="mt-2 text-[0.75rem] text-ink-faint">Tracked on every shipment</p>
            </div>
          </dl>
        </Container>
      </Section>

      {/* Use cases */}
      <Section labelledBy="usecases-heading">
        <Container size="wide">
          <SectionHeading
            as="h2"
            eyebrow={sections.useCases.eyebrow}
            title={<span id="usecases-heading">{sections.useCases.title}</span>}
          />

          <div className="mt-10 grid gap-px border border-line bg-line sm:grid-cols-2">
            {useCases.map((useCase) => (
              <div key={useCase.title} className="bg-surface p-6">
                <h3 className="text-[0.9375rem] font-semibold">{useCase.title}</h3>
                <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-muted">
                  {useCase.body}
                </p>
              </div>
            ))}
          </div>

          <ButtonLink href="/solutions" variant="secondary" size="sm" className="mt-8">
            Explore solutions
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </ButtonLink>
        </Container>
      </Section>

      {/* Closing CTA */}
      <Section labelledBy="cta-heading" className="border-t border-line bg-navy text-navy-ink">
        <Container size="wide">
          <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-xl">
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="h-px w-6 bg-accent" />
                <p className="parcel-eyebrow text-navy-ink/70">Get started</p>
              </div>
              <h2 id="cta-heading" className="mt-4 text-3xl text-navy-ink sm:text-4xl">
                {closing.headline}
              </h2>
              <p className="mt-4 text-[0.9375rem] leading-relaxed text-navy-ink/75">
                {closing.body}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <ButtonLink href={closing.primaryCta.href} size="lg">
                {closing.primaryCta.label}
                <ArrowRight aria-hidden="true" className="size-4" />
              </ButtonLink>
              <Link
                href={closing.secondaryCta.href}
                className="inline-flex h-12 items-center rounded-sm border border-navy-ink/30 px-6 text-[0.9375rem] font-medium text-navy-ink transition-colors hover:bg-navy-ink/10"
              >
                {closing.secondaryCta.label}
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
