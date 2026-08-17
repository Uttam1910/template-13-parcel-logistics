import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SkipLink } from "@/components/layout/SkipLink";

/**
 * The operations workspace shell.
 *
 * Deliberately no `loading.tsx` at this level: the navigation frame must stay
 * on screen while a route resolves. All five workspace routes are static, so
 * there is nothing to wait for anyway.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SkipLink />
      <AppShell>{children}</AppShell>
    </>
  );
}
