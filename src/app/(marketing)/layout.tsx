import { PublicFooter } from "@/components/layout/PublicFooter";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { SkipLink } from "@/components/layout/SkipLink";

/**
 * The public site shell. Static and server-rendered — there is no loading
 * boundary here, so navigating between marketing pages never blanks the frame.
 */
export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SkipLink />
      <div className="flex min-h-dvh flex-col">
        <PublicHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <PublicFooter />
      </div>
    </>
  );
}
