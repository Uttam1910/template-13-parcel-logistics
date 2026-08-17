import Link from "next/link";
import { footerNav } from "@/content/navigation";
import { siteConfig } from "@/content/site";
import { Container } from "@/components/ui/display";
import { Logo } from "./Logo";

export function PublicFooter() {
  return (
    <footer className="parcel-no-print mt-auto border-t border-line bg-surface">
      <Container size="wide">
        <div className="grid gap-10 py-12 lg:grid-cols-[1.4fr_3fr]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-[0.8125rem] leading-relaxed text-ink-muted">
              {siteConfig.shortDescription}
            </p>
            <p className="parcel-eyebrow mt-5">{siteConfig.company.legalName}</p>
            <p className="mt-1.5 text-[0.75rem] text-ink-faint">
              {siteConfig.company.office.address}, {siteConfig.company.office.region}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {footerNav.map((group) => (
              <nav key={group.title} aria-label={group.title}>
                <p className="parcel-eyebrow">{group.title}</p>
                <ul className="mt-3 flex flex-col gap-2">
                  {group.links.map((link) => (
                    <li key={`${group.title}-${link.label}`}>
                      <Link
                        href={link.href}
                        className="text-[0.8125rem] text-ink-muted transition-colors hover:text-accent"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-line py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.75rem] text-ink-faint">
            © {siteConfig.company.founded}–2026 {siteConfig.company.legalName}. A demo template
            — no carrier, tracking API or map provider is connected.
          </p>
          <p className="parcel-eyebrow">{siteConfig.tagline}</p>
        </div>
      </Container>
    </footer>
  );
}
