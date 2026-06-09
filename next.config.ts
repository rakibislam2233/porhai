import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

// OpenNext Cloudflare dev proxy (workerd) breaks external fetch on Windows.
// Use plain Next.js dev with process.env from .env.local instead.
// Production/preview still use full Cloudflare bindings via getCloudflareContext().
