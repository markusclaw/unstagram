import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://unstagram.workers.dev";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/about", "/developers", "/login", "/signup", "/p/", "/u/"],
        disallow: ["/compose", "/messages", "/notifications", "/scrolls", "/settings", "/api/"],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
