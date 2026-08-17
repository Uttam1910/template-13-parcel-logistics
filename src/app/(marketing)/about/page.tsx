import type { Metadata } from "next";
import { about } from "@/content/about";
import { aboutPage } from "@/content/pages";
import { siteConfig } from "@/content/site";
import { customers } from "@/data/customers";
import { facilities } from "@/data/facilities";
import { shipments } from "@/data/shipments";
import { formatNumber } from "@/lib/format";
import { createMetadata } from "@/lib/metadata";
import { ButtonLink } from "@/components/ui/Button";
import { DemoNotice } from "@/components/ui/DemoNotice";
import { Container, Section, SectionHeading } from "@/components/ui/display";

export const metadata: Metadata = createMetadata({
  title: "About",
  description:
    "Parcel is a fictional logistics operator invented for this template — the premise, the operating principles and how the platform is put together.",
  path: "/about",
});

export default function AboutPage() {
  const demoStats = [
    { value: String(shipments.length), label: "Demo shipments", detail: "All fully trackable" },
    { value: String(facilities.length), label: "Facilities", detail: "Across five regions" },
    {
      value: String(customers.length),
      label: "Customer accounts",
      detail: "Enterprise to starter",
    },
    {
      value: formatNumber(
        shipments.reduce((total, shipment) => total + shipment.events.length, 0),
      ),
      label: "Tracking events",
      detail: "Authored scan history",
    },
  ];

  return (
    <>
      <div className="border-b border-line bg-surface">
        <Container size="wide">
          <div className="max-w-3xl py-14 sm:py-20">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="h-px w-6 bg-accent" />
              <p className="parcel-eyebrow">{about.eyebrow}</p>
            </div>
            <h1 className="mt-4 text-3xl tracking-tight text-balance sm:text-4xl lg:text-5xl">
              {about.headline}
            </h1>
            <p className="mt-6 text-[0.9375rem] leading-relaxed text-ink-muted sm:text-base">
              {about.mission}
            </p>
          </div>
        </Container>
      </div>

      <Section>
        <Container size="wide">
          <SectionHeading
            as="h2"
            eyebrow={aboutPage.principles.eyebrow}
            title={aboutPage.principles.headline}
          />

          <div className="mt-10 grid gap-px border border-line bg-line sm:grid-cols-2">
            {about.principles.map((principle, index) => (
              <div key={principle.title} className="bg-surface p-6">
                <span className="parcel-numeral text-[0.6875rem] font-semibold text-accent">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-[1.0625rem] font-semibold tracking-tight">
                  {principle.title}
                </h3>
                <p className="mt-2 text-[0.875rem] leading-relaxed text-ink-muted">
                  {principle.detail}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="border-y border-line bg-surface">
        <Container size="wide">
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-start">
            <div>
              <SectionHeading
                as="h2"
                eyebrow="Platform philosophy"
                title={about.philosophy.title}
                body={about.philosophy.body}
              />
              <ul className="mt-6 flex flex-col gap-3">
                {about.philosophy.points.map((point) => (
                  <li key={point} className="flex gap-3 text-[0.875rem] text-ink-muted">
                    <span
                      aria-hidden="true"
                      className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent"
                    />
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="parcel-eyebrow mb-4">Company timeline</p>
              <ol className="flex flex-col border-l border-line">
                {about.timeline.map((entry) => (
                  <li key={entry.year} className="relative pb-6 pl-6 last:pb-0">
                    <span
                      aria-hidden="true"
                      className="absolute top-1.5 -left-[3.5px] size-1.5 rounded-full bg-accent"
                    />
                    <p className="parcel-numeral text-[0.75rem] font-semibold text-accent">
                      {entry.year}
                    </p>
                    <p className="mt-1 text-[0.875rem] leading-relaxed text-ink-muted">
                      {entry.event}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Container>
      </Section>

      <Section>
        <Container size="wide">
          <SectionHeading
            as="h2"
            eyebrow={aboutPage.stats.eyebrow}
            title={aboutPage.stats.headline}
            body={aboutPage.stats.body}
          />

          <dl className="mt-10 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {demoStats.map((stat) => (
              <div key={stat.label} className="bg-surface p-5">
                <dt className="parcel-eyebrow">{stat.label}</dt>
                <dd className="parcel-numeral mt-2 text-3xl font-semibold tracking-tight">
                  {stat.value}
                </dd>
                <p className="mt-2 text-[0.75rem] text-ink-faint">{stat.detail}</p>
              </div>
            ))}
          </dl>

          <DemoNotice variant="block" className="mt-8">
            {siteConfig.company.legalName} {aboutPage.disclaimer}
          </DemoNotice>

          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/contact">Contact the team</ButtonLink>
            <ButtonLink href="/dashboard" variant="secondary">
              Open the demo workspace
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </>
  );
}
