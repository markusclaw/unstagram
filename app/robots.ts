import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://unstagram.workers.dev";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/about", "/login", "/signup"],
        disallow: ["/compose", "/messages", "/notifications", "/search", "/scrolls", "/u/", "/api/"],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
