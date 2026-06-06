import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://unstagram.workers.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE}/about`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE}/login`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${SITE}/signup`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
  ];
}
