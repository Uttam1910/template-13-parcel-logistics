import type { Metadata } from "next";
import {
  coverageRegions,
  coverageStatusDescriptions,
  coverageStatusLabels,
} from "@/content/coverage";
import { coveragePage } from "@/content/pages";
import { demoNotices } from "@/content/site";
import { facilities, facilityKindLabels, regionLabels } from "@/data/facilities";
import { serviceLabels } from "@/data/shipments";
import { formatNumber } from "@/lib/format";
import { createMetadata } from "@/lib/metadata";
import { CoverageMap } from "@/components/art/CoverageMap";
import { ButtonLink } from "@/components/ui/Button";
import { DemoNotice } from "@/components/ui/DemoNotice";
import { Container, Panel, PanelHeader, Section, SectionHeading } from "@/components/ui/display";

export const metadata: Metadata = createMetadata({
  title: "Coverage",
  description:
    "Parcel's demo network: five regions, ten facilities, and the service levels and typical transit ranges available in each. Illustrative demo coverage.",
  path: "/coverage",
});

export default function CoveragePage() {
  return (
    <>
      <div className="border-b border-line bg-surface">
        <Container size="wide">
          <div className="max-w-2xl py-14 sm:py-20">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="h-px w-6 bg-accent" />
              <p className="parcel-eyebrow">{coveragePage.intro.eyebrow}</p>
            </div>
            <h1 className="mt-4 text-3xl tracking-tight text-balance sm:text-4xl lg:text-5xl">
              {coveragePage.intro.headline}
            </h1>
            <p className="mt-5 text-[0.9375rem] leading-relaxed text-ink-muted sm:text-base">
              {coveragePage.intro.body}
            </p>
          </div>
        </Container>
      </div>

      <Section>
        <Container size="wide">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
            <CoverageMap />

            <div>
              <SectionHeading
                as="h2"
                eyebrow={coveragePage.services.eyebrow}
                title={coveragePage.services.headline}
                body={coveragePage.services.body}
              />

              <dl className="mt-6 flex flex-col gap-px border border-line bg-line">
                {Object.entries(coverageStatusLabels).map(([status, label]) => (
                  <div key={status} className="bg-surface p-4">
                    <dt className="text-[0.875rem] font-semibold">{label}</dt>
                    <dd className="mt-1 text-[0.8125rem] leading-relaxed text-ink-muted">
                      {coverageStatusDescriptions[status as keyof typeof coverageStatusDescriptions]}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="border-y border-line bg-surface">
        <Container size="wide">
          <SectionHeading
            as="h2"
            eyebrow={coveragePage.regions.eyebrow}
            title={coveragePage.regions.headline}
            body={coveragePage.regions.body}
          />

          <div className="mt-8 flex flex-col gap-4">
            {coverageRegions.map((region) => (
              <Panel key={region.id}>
                <PanelHeader
                  title={region.name}
                  as="h3"
                  description={region.summary}
                  action={
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-sm border px-2 py-1 text-[0.6875rem] font-medium ${
                        region.status === "full"
                          ? "border-accent-line bg-accent-soft text-accent-soft-ink"
                          : region.status === "scheduled"
                            ? "border-info/30 bg-info-soft text-info"
                            : "border-line bg-surface-3 text-ink-muted"
                      }`}
                    >
                      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
                      {coverageStatusLabels[region.status]}
                    </span>
                  }
                />

                <div className="grid gap-px bg-line sm:grid-cols-3">
                  <div className="bg-surface p-4">
                    <p className="parcel-eyebrow">Typical transit</p>
                    <p className="parcel-numeral mt-1.5 text-[0.875rem] text-ink">
                      {region.transit}
                    </p>
                  </div>
                  <div className="bg-surface p-4">
                    <p className="parcel-eyebrow">Services</p>
                    <p className="mt-1.5 text-[0.875rem] text-ink">
                      {region.services.map((service) => serviceLabels[service]).join(", ")}
                    </p>
                  </div>
                  <div className="bg-surface p-4">
                    <p className="parcel-eyebrow">Facilities</p>
                    <p className="mt-1.5 text-[0.875rem] text-ink">{region.hubs.join(", ")}</p>
                  </div>
                </div>
              </Panel>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container size="wide">
          <SectionHeading
            as="h2"
            eyebrow={coveragePage.facilities.eyebrow}
            title={coveragePage.facilities.headline}
            body={coveragePage.facilities.body}
          />

          <Panel className="mt-8">
            <div className="parcel-scroll w-full overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <caption className="sr-only">
                  Parcel demo network facilities with region, type and illustrative daily volume
                </caption>
                <thead>
                  <tr className="border-b border-line">
                    {["Code", "Facility", "City", "Region", "Type", "Daily volume"].map(
                      (heading) => (
                        <th
                          key={heading}
                          scope="col"
                          className={`parcel-eyebrow px-3 py-2.5 font-medium whitespace-nowrap ${
                            heading === "City" || heading === "Type" ? "hidden md:table-cell" : ""
                          }`}
                        >
                          {heading}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {facilities.map((facility) => (
                    <tr key={facility.id} className="border-b border-line last:border-b-0">
                      <td className="parcel-numeral px-3 py-3 text-[0.8125rem] font-semibold text-ink">
                        {facility.code}
                      </td>
                      <td className="px-3 py-3 text-[0.8125rem] text-ink-muted">
                        {facility.name}
                      </td>
                      <td className="hidden px-3 py-3 text-[0.8125rem] text-ink-muted md:table-cell">
                        {facility.city}
                      </td>
                      <td className="px-3 py-3 text-[0.8125rem] text-ink-muted">
                        {regionLabels[facility.region]}
                      </td>
                      <td className="hidden px-3 py-3 text-[0.8125rem] text-ink-muted md:table-cell">
                        {facilityKindLabels[facility.kind]}
                      </td>
                      <td className="parcel-numeral px-3 py-3 text-[0.8125rem] text-ink-muted">
                        {formatNumber(facility.dailyVolume)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <DemoNotice variant="block" className="mt-6">
            {demoNotices.coverage} {coveragePage.disclaimer}
          </DemoNotice>

          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/tracking">Track a shipment</ButtonLink>
            <ButtonLink href="/contact" variant="secondary">
              Ask about a lane
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </>
  );
}
