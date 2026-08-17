import type { Metadata } from "next";
import Link from "next/link";
import { Compass } from "lucide-react";
import { publicNav } from "@/content/navigation";
import { notFoundPage } from "@/content/pages";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/display";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { SkipLink } from "@/components/layout/SkipLink";

/**
 * 404.
 *
 * `noindex`, and deliberately no canonical: pointing a not-found URL at the
 * homepage tells search engines the wrong thing.
 */
export const metadata: Metadata = {
  title: "Page not found — Parcel",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <SkipLink />
      <div className="flex min-h-dvh flex-col">
        <PublicHeader />
        <main id="main" className="flex flex-1 items-center">
          <Container size="narrow">
            <div className="flex flex-col items-start gap-6 py-20">
              <span
                aria-hidden="true"
                className="inline-flex size-12 items-center justify-center rounded-sm border border-line bg-surface text-ink-faint"
              >
                <Compass className="size-5" strokeWidth={1.5} />
              </span>

              <div>
                <p className="parcel-eyebrow">{notFoundPage.eyebrow}</p>
                <h1 className="mt-3 text-3xl sm:text-4xl">{notFoundPage.headline}</h1>
                <p className="mt-4 max-w-lg text-[0.9375rem] leading-relaxed text-ink-muted">
                  {notFoundPage.body}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <ButtonLink href="/tracking">Track a shipment</ButtonLink>
                <ButtonLink href="/" variant="secondary">
                  Back to home
                </ButtonLink>
              </div>

              <nav aria-label="Site sections" className="w-full border-t border-line pt-6">
                <p className="parcel-eyebrow mb-3">Or try one of these</p>
                <ul className="flex flex-wrap gap-x-6 gap-y-2">
                  {publicNav.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="text-[0.875rem] text-ink-muted hover:text-accent"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href="/contact"
                      className="text-[0.875rem] text-ink-muted hover:text-accent"
                    >
                      Contact
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </Container>
        </main>
        <PublicFooter />
      </div>
    </>
  );
}
