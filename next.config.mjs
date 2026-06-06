/** @type {import('next').NextConfig} */
// Static export so GitHub Pages can host it (Pages serves static files only).
// On Pages the site lives under /unstagram, so set basePath there. Locally
// (npm run dev / build without PAGES) it stays at the root.
const isPages = process.env.PAGES === "true";
const repo = "unstagram";

const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  basePath: isPages ? `/${repo}` : "",
  assetPrefix: isPages ? `/${repo}/` : undefined,
};

export default nextConfig;
