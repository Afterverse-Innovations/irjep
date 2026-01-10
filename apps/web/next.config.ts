import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  // ✅ REQUIRED for npm monorepo + Cloudflare Pages
  turbopack: {
    root: __dirname,
  },

  // ✅ REQUIRED on Cloudflare Pages
  images: {
    unoptimized: true,
  },
  /* config options here */
};

export default nextConfig;
