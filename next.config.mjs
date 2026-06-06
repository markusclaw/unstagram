/** @type {import('next').NextConfig} */
const nextConfig = {
  // Phase 2 runs on Cloudflare Workers via OpenNext (SSR), not static export.
  images: { unoptimized: true },
};

export default nextConfig;

// Lets `next dev` talk to local Cloudflare bindings during development.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
