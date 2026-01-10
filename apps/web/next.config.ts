import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  turbopack: {
    // 👇 THIS FIXES THE ERROR
    root: __dirname,
  },

  images: {
    unoptimized: true
  }
  /* config options here */
};

export default nextConfig;
