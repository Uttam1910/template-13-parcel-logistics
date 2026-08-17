import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { loginPage } from "@/content/pages";
import { siteConfig } from "@/content/site";
import { createMetadata } from "@/lib/metadata";
import { LoginForm } from "@/components/forms/LoginForm";
import { Logo } from "@/components/layout/Logo";
import { SkipLink } from "@/components/layout/SkipLink";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Panel } from "@/components/ui/display";

export const metadata: Metadata = createMetadata({
  title: "Sign in",
  description: "Sign in to the Parcel demo operations workspace.",
  path: "/login",
  noIndex: true,
});

export default function LoginPage() {
  return (
    <>
      <SkipLink />
      <div className="relative flex min-h-dvh flex-col">
        <div aria-hidden="true" className="parcel-graticule absolute inset-0" />

        <header className="relative flex h-16 items-center justify-between px-5 sm:px-8">
          <Link href="/" className="rounded-sm text-ink" aria-label="Parcel — home">
            <Logo />
          </Link>
          <ThemeToggle />
        </header>

        <main id="main" className="relative flex flex-1 items-center justify-center px-5 py-10">
          <div className="w-full max-w-md">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-[0.75rem] font-medium text-ink-muted transition-colors hover:text-accent"
            >
              <ArrowLeft aria-hidden="true" className="size-3.5" />
              Back to {siteConfig.name}
            </Link>

            <div className="mt-5">
              <p className="parcel-eyebrow">{loginPage.eyebrow}</p>
              <h1 className="mt-2 text-2xl tracking-tight sm:text-3xl">{loginPage.headline}</h1>
              <p className="mt-3 text-[0.875rem] leading-relaxed text-ink-muted">
                {loginPage.body}
              </p>
            </div>

            <Panel className="mt-6 p-5 sm:p-6">
              <LoginForm />
            </Panel>

            <p className="mt-6 text-center text-[0.75rem] text-ink-faint">
              The workspace is also open without signing in —{" "}
              <Link href="/dashboard" className="font-medium text-accent hover:underline">
                go straight to the dashboard
              </Link>
              .
            </p>
          </div>
        </main>
      </div>
    </>
  );
}
