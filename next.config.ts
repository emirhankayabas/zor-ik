import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const BASE_PATH = process.env.NODE_ENV === "production" ? "/zor-ik" : "";

const nextConfig: NextConfig = {
  basePath: BASE_PATH,
  assetPrefix: BASE_PATH,
};

export default withNextIntl(nextConfig);
