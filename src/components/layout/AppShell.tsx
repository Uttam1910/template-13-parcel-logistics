"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LogIn, LogOut, Menu, RotateCcw, UserRound, X } from "lucide-react";
import { appNav } from "@/content/navigation";
import { demoNotices, siteConfig } from "@/content/site";
import { demoAccount } from "@/data/users";
import { useDemo, useSession } from "@/lib/demo/store";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { useToast } from "@/components/ui/Toast";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

/**
 * The operations workspace shell.
 *
 * The navigation frame is always present: route changes swap the content
 * region only, and there is no full-page loading state that blanks the shell.
 * On narrow viewports the sidebar becomes a drawer with the same links.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);

  // Close the drawer when the route changes. Adjusted during render rather than
  // in an effect, so the closed drawer is what actually paints.
  const [openedOn, setOpenedOn] = useState(pathname);
  if (openedOn !== pathname) {
    setOpenedOn(pathname);
    setNavOpen(false);
  }

  useEffect(() => {
    if (!navOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setNavOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [navOpen]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const navList = (
    <ul className="flex flex-col gap-0.5">
      {appNav.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-2.5 rounded-sm px-3 py-2 text-[0.8125rem] font-medium transition-colors ${
                active
                  ? "border-l-2 border-accent bg-accent-soft pl-2.5 text-accent-soft-ink"
                  : "border-l-2 border-transparent pl-2.5 text-ink-muted hover:bg-surface-3 hover:text-ink"
              }`}
            >
              <Icon aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.75} />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Top bar */}
      <header className="parcel-no-print sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
        <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            aria-expanded={navOpen}
            aria-controls="workspace-navigation"
            className="inline-flex size-9 items-center justify-center rounded-sm border border-line text-ink-muted transition-colors hover:bg-surface-3 hover:text-ink lg:hidden"
          >
            <Menu aria-hidden="true" className="size-4" />
            <span className="sr-only">Open navigation</span>
          </button>

          <Link href="/" className="rounded-sm text-ink" aria-label="Parcel — home">
            <Logo />
          </Link>

          <span aria-hidden="true" className="hidden h-5 w-px bg-line sm:block" />
          <p className="parcel-eyebrow hidden sm:block">Operations</p>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <aside className="parcel-no-print hidden w-60 shrink-0 border-r border-line bg-surface lg:block">
          <nav aria-label="Workspace" className="sticky top-14 flex flex-col gap-6 p-4">
            {navList}
            <div className="border-t border-line pt-4">
              <p className="parcel-eyebrow">Demo data</p>
              <p className="mt-1.5 text-[0.75rem] leading-relaxed text-ink-faint">
                {demoNotices.workspace}
              </p>
            </div>
          </nav>
        </aside>

        {/* Mobile drawer */}
        {navOpen ? (
          <div className="parcel-no-print fixed inset-0 z-50 flex lg:hidden">
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setNavOpen(false)}
              className="absolute inset-0 cursor-default bg-overlay"
            />
            <div
              id="workspace-navigation"
              className="animate-parcel-slide-left relative z-10 flex w-72 max-w-[85vw] flex-col border-r border-line bg-surface"
            >
              <div className="flex h-14 items-center justify-between border-b border-line px-4">
                <Logo />
                <button
                  type="button"
                  onClick={() => setNavOpen(false)}
                  className="inline-flex size-8 items-center justify-center rounded-sm text-ink-faint hover:bg-surface-3 hover:text-ink"
                >
                  <X aria-hidden="true" className="size-4" />
                  <span className="sr-only">Close navigation</span>
                </button>
              </div>
              <nav aria-label="Workspace" className="flex-1 overflow-y-auto p-4">
                {navList}
                <div className="mt-6 border-t border-line pt-4">
                  <Link
                    href="/"
                    className="block rounded-sm px-3 py-2 text-[0.8125rem] text-ink-muted hover:bg-surface-3 hover:text-ink"
                  >
                    Back to {siteConfig.name} site
                  </Link>
                  <Link
                    href="/tracking"
                    className="block rounded-sm px-3 py-2 text-[0.8125rem] text-ink-muted hover:bg-surface-3 hover:text-ink"
                  >
                    Public tracking
                  </Link>
                </div>
              </nav>
            </div>
          </div>
        ) : null}

        <main id="main" className="min-w-0 flex-1 bg-bg">
          {children}
        </main>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * User menu
 * ------------------------------------------------------------------ */

function UserMenu() {
  const { signedIn, hydrated, signOut } = useSession();
  const { resetDemo } = useDemo();
  const { notify } = useToast();
  const [open, setOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // Before hydration the session is unknown; render the neutral signed-out form
  // rather than guessing and flipping.
  if (!hydrated || !signedIn) {
    return (
      <Link
        href="/login"
        className="inline-flex h-9 items-center gap-2 rounded-sm border border-line-strong px-3 text-[0.8125rem] font-medium text-ink transition-colors hover:bg-surface-2"
      >
        <LogIn aria-hidden="true" className="size-3.5" />
        Sign in
      </Link>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex h-9 items-center gap-2 rounded-sm border border-line px-2 text-[0.8125rem] font-medium text-ink transition-colors hover:bg-surface-2"
      >
        <span
          aria-hidden="true"
          className="parcel-numeral inline-flex size-6 items-center justify-center rounded-sm bg-accent-soft text-[0.625rem] font-semibold text-accent-soft-ink"
        >
          {demoAccount.user.initials}
        </span>
        <span className="hidden sm:inline">{demoAccount.user.name}</span>
        <ChevronDown aria-hidden="true" className="size-3.5 text-ink-faint" />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Account"
          className="animate-parcel-scale-in absolute right-0 z-50 mt-1.5 w-64 border border-line bg-surface shadow-parcel-lg"
        >
          <div className="border-b border-line px-3 py-2.5">
            <p className="text-[0.8125rem] font-medium text-ink">{demoAccount.user.name}</p>
            <p className="text-[0.75rem] text-ink-faint">{demoAccount.user.role}</p>
          </div>
          <div className="p-1">
            <Link
              href="/settings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-sm px-2.5 py-2 text-[0.8125rem] text-ink-muted hover:bg-surface-3 hover:text-ink"
            >
              <UserRound aria-hidden="true" className="size-3.5" />
              Account
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                setConfirmReset(true);
              }}
              className="flex w-full items-center gap-2.5 rounded-sm px-2.5 py-2 text-left text-[0.8125rem] text-ink-muted hover:bg-surface-3 hover:text-ink"
            >
              <RotateCcw aria-hidden="true" className="size-3.5" />
              Reset demo
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                signOut();
                notify("Signed out of the demo workspace.", "info");
              }}
              className="flex w-full items-center gap-2.5 rounded-sm px-2.5 py-2 text-left text-[0.8125rem] text-ink-muted hover:bg-surface-3 hover:text-ink"
            >
              <LogOut aria-hidden="true" className="size-3.5" />
              Sign out
            </button>
          </div>
        </div>
      ) : null}

      <Dialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Reset demo data?"
        description="This clears every local change made in this browser."
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmReset(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                resetDemo();
                setConfirmReset(false);
                notify("Demo data reset. All local changes have been cleared.");
              }}
            >
              Reset demo data
            </Button>
          </>
        }
      >
        <p className="text-[0.875rem] leading-relaxed text-ink-muted">
          Status changes, exceptions, delivery confirmations, internal notes, preferences and
          the demo session will all return to their starting state. The authored shipment
          dataset is untouched — it is read from{" "}
          <span className="parcel-numeral">src/data</span> and was never modified.
        </p>
      </Dialog>
    </div>
  );
}
