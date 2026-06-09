import type { MetadataRoute } from "next";
import { adminClient } from "@/lib/supabase/admin";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://unstagram.net";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const base: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, lastModified: now, changeFrequency: "hourly", priority: 1 },
    { url: `${SITE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/developers`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return base;
  try {
    const db = adminClient();
    const [{ data: posts }, { data: profiles }] = await Promise.all([
      db.from("posts").select("id, created_at").order("created_at", { ascending: false }).limit(500),
      db.from("profiles").select("username").limit(500),
    ]);
    for (const p of profiles ?? []) base.push({ url: `${SITE}/u/${p.username}`, changeFrequency: "weekly", priority: 0.5 });
    for (const p of posts ?? []) base.push({ url: `${SITE}/p/${p.id}`, lastModified: new Date(p.created_at), changeFrequency: "weekly", priority: 0.6 });
    return base;
  } catch {
    return base;
  }
}
