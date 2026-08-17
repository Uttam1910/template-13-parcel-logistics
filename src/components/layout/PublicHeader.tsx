"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { appNav, publicNav } from "@/content/navigation";
import { Container } from "@/components/ui/display";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

/**
 * The public site header.
 *
 * Client-side only because of the mobile disclosure and `aria-current`. The
 * mobile panel carries every primary route — public pages, the demo workspace
 * and sign-in — so nothing is reachable on desktop but stranded on a phone.
 */
export function PublicHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the panel when the route changes. Adjusted during render rather than
  // in an effect, so the closed panel is what actually paints.
  const [openedOn, setOpenedOn] = useState(pathname);
  if (openedOn !== pathname) {
    setOpenedOn(pathname);
    setOpen(false);
  }

  // Escape closes it too.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="parcel-no-print sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      <Container size="wide">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link
            href="/"
            className="rounded-sm text-ink"
            aria-label="Parcel — home"
            aria-current={pathname === "/" ? "page" : undefined}
          >
            <Logo />
          </Link>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {publicNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={`rounded-sm px-3 py-2 text-[0.8125rem] font-medium transition-colors ${
                      isActive(item.href)
                        ? "text-accent"
                        : "text-ink-muted hover:bg-surface-3 hover:text-ink"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle className="hidden sm:inline-flex" />
            <Link
              href="/login"
              className="hidden rounded-sm px-3 py-2 text-[0.8125rem] font-medium text-ink-muted transition-colors hover:text-ink lg:inline-block"
            >
              Sign in
            </Link>
            <Link
              href="/tracking"
              className="hidden h-9 items-center rounded-sm border border-accent bg-accent px-4 text-[0.8125rem] font-medium text-accent-fg transition-colors hover:border-accent-hover hover:bg-accent-hover sm:inline-flex"
            >
              Track shipment
            </Link>

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="mobile-navigation"
              className="inline-flex size-9 items-center justify-center rounded-sm border border-line text-ink-muted transition-colors hover:bg-surface-3 hover:text-ink lg:hidden"
            >
              {open ? (
                <X aria-hidden="true" className="size-4" />
              ) : (
                <Menu aria-hidden="true" className="size-4" />
              )}
              <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            </button>
          </div>
        </div>
      </Container>

      {open ? (
        <div
          id="mobile-navigation"
          className="animate-parcel-in border-t border-line bg-surface lg:hidden"
        >
          <Container size="wide">
            <nav aria-label="Mobile" className="flex flex-col gap-6 py-5">
              <div>
                <p className="parcel-eyebrow mb-2">Parcel</p>
                <ul className="flex flex-col">
                  {publicNav.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={isActive(item.href) ? "page" : undefined}
                        className={`block border-b border-line py-2.5 text-[0.9375rem] ${
                          isActive(item.href) ? "font-medium text-accent" : "text-ink"
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href="/contact"
                      aria-current={isActive("/contact") ? "page" : undefined}
                      className={`block border-b border-line py-2.5 text-[0.9375rem] ${
                        isActive("/contact") ? "font-medium text-accent" : "text-ink"
                      }`}
                    >
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <p className="parcel-eyebrow mb-2">Demo workspace</p>
                <ul className="flex flex-col">
                  {appNav.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={isActive(item.href) ? "page" : undefined}
                        className={`block border-b border-line py-2.5 text-[0.9375rem] ${
                          isActive(item.href) ? "font-medium text-accent" : "text-ink"
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/tracking"
                  className="inline-flex h-11 flex-1 items-center justify-center rounded-sm border border-accent bg-accent px-4 text-sm font-medium text-accent-fg"
                >
                  Track shipment
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-11 items-center justify-center rounded-sm border border-line-strong px-4 text-sm font-medium text-ink"
                >
                  Sign in
                </Link>
                <ThemeToggle className="size-11 sm:hidden" />
              </div>
            </nav>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
