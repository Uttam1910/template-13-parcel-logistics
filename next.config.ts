import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Typed routes are on by default in Next 16 and this template leans on them:
  // every internal <Link href> is validated at type-check time, which is how the
  // "no dead links" guarantee is enforced without a crawler.
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
