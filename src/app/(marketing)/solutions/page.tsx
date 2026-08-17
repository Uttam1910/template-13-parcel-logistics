import type { Metadata } from "next";
import { Check } from "lucide-react";
import { solutionsPage } from "@/content/pages";
import { solutions } from "@/content/solutions";
import { createMetadata } from "@/lib/metadata";
import { ButtonLink } from "@/components/ui/Button";
import { Container, Section, SectionHeading } from "@/components/ui/display";

export const metadata: Metadata = createMetadata({
  title: "Solutions",
  description:
    "How Parcel helps ecommerce, retail, enterprise, fulfilment and returns operations — post-purchase visibility, exception handling and one operational picture.",
  path: "/solutions",
});

export default function SolutionsPage() {
  return (
    <>
      <div className="border-b border-line bg-surface">
        <Container size="wide">
          <div className="max-w-2xl py-14 sm:py-20">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="h-px w-6 bg-accent" />
              <p className="parcel-eyebrow">{solutionsPage.intro.eyebrow}</p>
            </div>
            <h1 className="mt-4 text-3xl tracking-tight text-balance sm:text-4xl lg:text-5xl">
              {solutionsPage.intro.headline}
            </h1>
            <p className="mt-5 text-[0.9375rem] leading-relaxed text-ink-muted sm:text-base">
              {solutionsPage.intro.body}
            </p>
          </div>
        </Container>
      </div>

      <Section>
        <Container size="wide">
          <div className="flex flex-col gap-px border border-line bg-line">
            {solutions.map((solution, index) => (
              <article
                key={solution.id}
                className="grid gap-6 bg-surface p-6 lg:grid-cols-[1fr_1.3fr] lg:gap-10 lg:p-8"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="parcel-numeral text-[0.6875rem] font-semibold text-accent">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span aria-hidden="true" className="h-px w-5 bg-accent-line" />
                    <p className="parcel-eyebrow">{solution.name}</p>
                  </div>

                  <h2 className="mt-4 text-xl leading-snug font-semibold tracking-tight text-balance">
                    {solution.headline}
                  </h2>
                  <p className="mt-3 text-[0.875rem] leading-relaxed text-ink-muted">
                    {solution.description}
                  </p>

                  <div className="mt-6 inline-flex flex-col border-l-2 border-accent pl-4">
                    <span className="parcel-numeral text-2xl font-semibold tracking-tight">
                      {solution.metric.value}
                    </span>
                    <span className="mt-0.5 text-[0.75rem] text-ink-faint">
                      {solution.metric.label}
                    </span>
                  </div>
                </div>

                <ul className="flex flex-col gap-px self-start border border-line bg-line">
                  {solution.capabilities.map((capability) => (
                    <li key={capability.title} className="flex gap-3 bg-surface-2 p-4">
                      <Check
                        aria-hidden="true"
                        className="mt-0.5 size-4 shrink-0 text-accent"
                        strokeWidth={2.5}
                      />
                      <div className="min-w-0">
                        <h3 className="text-[0.875rem] font-semibold">{capability.title}</h3>
                        <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink-muted">
                          {capability.detail}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="border-t border-line bg-surface">
        <Container size="wide">
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <SectionHeading
              as="h2"
              eyebrow={solutionsPage.closing.eyebrow}
              title={solutionsPage.closing.headline}
              body={solutionsPage.closing.body}
            />
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/dashboard">Open the dashboard</ButtonLink>
              <ButtonLink href="/tracking" variant="secondary">
                Track a shipment
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
