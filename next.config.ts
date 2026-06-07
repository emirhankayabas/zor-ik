import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// Empty by default (root domain, e.g. Vercel). Set NEXT_PUBLIC_BASE_PATH only
// when hosting under a sub-path (e.g. a reverse-proxied Docker deploy at /zor-ik).
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  basePath: BASE_PATH,
  output: "standalone",
};

export default withNextIntl(nextConfig);
