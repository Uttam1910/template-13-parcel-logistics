import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { servicesPage } from "@/content/pages";
import { services } from "@/content/services";
import { featuredTrackingNumbers } from "@/data/shipments";
import { createMetadata } from "@/lib/metadata";
import { trackingHref } from "@/lib/routes";
import { PackageMark } from "@/components/art/PackageMark";
import { ButtonLink } from "@/components/ui/Button";
import { Container, Section, SectionHeading } from "@/components/ui/display";
import type { PackageKind } from "@/data/types";

export const metadata: Metadata = createMetadata({
  title: "Services",
  description:
    "Express, Standard, Same-Day, Freight and Returns — five Parcel service levels with typical transit windows, scan cadence and proof-of-delivery treatment.",
  path: "/services",
});

/** The package illustration that best represents each service. */
const serviceArt: Record<string, PackageKind> = {
  express: "parcel",
  standard: "box",
  same_day: "envelope",
  freight: "pallet",
  returns: "crate",
};

export default function ServicesPage() {
  return (
    <>
      <div className="border-b border-line bg-surface">
        <Container size="wide">
          <div className="max-w-2xl py-14 sm:py-20">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="h-px w-6 bg-accent" />
              <p className="parcel-eyebrow">{servicesPage.intro.eyebrow}</p>
            </div>
            <h1 className="mt-4 text-3xl tracking-tight text-balance sm:text-4xl lg:text-5xl">
              {servicesPage.intro.headline}
            </h1>
            <p className="mt-5 text-[0.9375rem] leading-relaxed text-ink-muted sm:text-base">
              {servicesPage.intro.body}
            </p>
          </div>
        </Container>
      </div>

      <Section>
        <Container size="wide">
          <ul className="flex flex-col gap-px border border-line bg-line">
            {services.map((service, index) => (
              <li key={service.id} className="bg-surface">
                <article className="grid gap-6 p-6 lg:grid-cols-[auto_1.4fr_1fr] lg:gap-8 lg:p-8">
                  <div className="flex items-start gap-4 lg:flex-col">
                    <PackageMark
                      kind={serviceArt[service.id]}
                      className="size-14 shrink-0 lg:size-16"
                    />
                    <span className="parcel-numeral text-[0.6875rem] font-semibold text-accent">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-xl font-semibold tracking-tight">{service.name}</h2>
                    <p className="mt-2 text-[0.9375rem] text-ink-muted">{service.summary}</p>
                    <p className="mt-4 text-[0.875rem] leading-relaxed text-ink-muted">
                      {service.description}
                    </p>

                    <div className="mt-5">
                      <p className="parcel-eyebrow mb-2">Ideal for</p>
                      <ul className="flex flex-wrap gap-2">
                        {service.idealFor.map((item) => (
                          <li
                            key={item}
                            className="rounded-sm border border-line bg-surface-2 px-2.5 py-1 text-[0.75rem] text-ink-muted"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <dl className="border border-line bg-surface-2">
                      {service.characteristics.map((characteristic) => (
                        <div
                          key={characteristic.label}
                          className="flex items-baseline justify-between gap-3 border-b border-line px-3 py-2.5 last:border-b-0"
                        >
                          <dt className="parcel-eyebrow">{characteristic.label}</dt>
                          <dd className="parcel-numeral text-right text-[0.75rem] font-medium text-ink">
                            {characteristic.value}
                          </dd>
                        </div>
                      ))}
                    </dl>

                    <ButtonLink
                      href={trackingHref(
                        featuredTrackingNumbers[index % featuredTrackingNumbers.length],
                      )}
                      variant="secondary"
                      size="sm"
                      className="mt-4 w-full"
                    >
                      {service.cta}
                      <ArrowRight aria-hidden="true" className="size-3.5" />
                    </ButtonLink>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section className="border-t border-line bg-surface">
        <Container size="wide">
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <SectionHeading
              as="h2"
              eyebrow={servicesPage.closing.eyebrow}
              title={servicesPage.closing.headline}
              body={servicesPage.closing.body}
            />
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/contact">Contact sales</ButtonLink>
              <ButtonLink href="/coverage" variant="secondary">
                Check coverage
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
