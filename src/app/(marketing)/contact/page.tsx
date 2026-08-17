import type { Metadata } from "next";
import { Building2, Clock, Mail, Phone } from "lucide-react";
import { contactPage } from "@/content/pages";
import { siteConfig } from "@/content/site";
import { createMetadata } from "@/lib/metadata";
import { ContactForm } from "@/components/forms/ContactForm";
import { ButtonLink } from "@/components/ui/Button";
import { Container, Panel, PanelHeader, Section } from "@/components/ui/display";

export const metadata: Metadata = createMetadata({
  title: "Contact",
  description:
    "Talk to the Parcel team about lanes, volume and service levels. This is a template demo — no message is sent and no contact details are collected.",
  path: "/contact",
});

export default function ContactPage() {
  const { contact, office } = siteConfig.company;

  return (
    <Section className="py-12 sm:py-16">
      <Container size="wide">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="h-px w-6 bg-accent" />
            <p className="parcel-eyebrow">{contactPage.intro.eyebrow}</p>
          </div>
          <h1 className="mt-4 text-3xl tracking-tight text-balance sm:text-4xl">
            {contactPage.intro.headline}
          </h1>
          <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-muted">
            {contactPage.intro.body}
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-[1.3fr_1fr] lg:items-start">
          <Panel>
            <PanelHeader
              title="Send a message"
              description="All fields marked * are required"
            />
            <div className="p-5 sm:p-6">
              <ContactForm />
            </div>
          </Panel>

          <div className="flex flex-col gap-4">
            <Panel>
              <PanelHeader title="Direct" />
              <ul className="flex flex-col">
                <li className="flex items-start gap-3 border-b border-line px-4 py-3.5">
                  <Mail aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-ink-faint" />
                  <div className="min-w-0">
                    <p className="parcel-eyebrow">General</p>
                    <a
                      href={`mailto:${contact.email}`}
                      className="mt-0.5 block text-[0.875rem] text-ink hover:text-accent"
                    >
                      {contact.email}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3 border-b border-line px-4 py-3.5">
                  <Mail aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-ink-faint" />
                  <div className="min-w-0">
                    <p className="parcel-eyebrow">Sales</p>
                    <a
                      href={`mailto:${contact.sales}`}
                      className="mt-0.5 block text-[0.875rem] text-ink hover:text-accent"
                    >
                      {contact.sales}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3 border-b border-line px-4 py-3.5">
                  <Phone aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-ink-faint" />
                  <div className="min-w-0">
                    <p className="parcel-eyebrow">Phone</p>
                    <a
                      href={`tel:${contact.phone.replace(/[^+\d]/g, "")}`}
                      className="parcel-numeral mt-0.5 block text-[0.875rem] text-ink hover:text-accent"
                    >
                      {contact.phone}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3 px-4 py-3.5">
                  <Clock aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-ink-faint" />
                  <div className="min-w-0">
                    <p className="parcel-eyebrow">Hours</p>
                    <p className="mt-0.5 text-[0.875rem] text-ink">{contact.hours}</p>
                  </div>
                </li>
              </ul>
            </Panel>

            <Panel>
              <PanelHeader title="Office" />
              <div className="flex items-start gap-3 px-4 py-3.5">
                <Building2
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-ink-faint"
                />
                <div className="min-w-0">
                  <p className="text-[0.875rem] font-medium text-ink">{office.name}</p>
                  <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink-muted">
                    {office.address}
                    <br />
                    {office.region}
                  </p>
                </div>
              </div>
            </Panel>

            <Panel className="p-4">
              <p className="parcel-eyebrow">{contactPage.tracking.title}</p>
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-muted">
                {contactPage.tracking.body}
              </p>
              <ButtonLink
                href="/tracking"
                variant="secondary"
                size="sm"
                className="mt-3 w-full"
              >
                Track a shipment
              </ButtonLink>
            </Panel>
          </div>
        </div>
      </Container>
    </Section>
  );
}
