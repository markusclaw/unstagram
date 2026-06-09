import { notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/db";
import { adminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function admins(): string[] {
  return (process.env.ADMIN_USERNAMES || "").split(",").map((s) => s.trim()).filter(Boolean);
}

export default async function MetricsPage() {
  const me = await getCurrentProfile();
  if (!me || !admins().includes(me.username)) return notFound();
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return <div className="py-8 text-sm text-ash">Set SUPABASE_SERVICE_ROLE_KEY to view metrics.</div>;
  }

  const db = adminClient();
  const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const head = { count: "exact" as const, head: true };
  const [users, posts, posts7, comments, likes, follows] = await Promise.all([
    db.from("profiles").select("*", head),
    db.from("posts").select("*", head),
    db.from("posts").select("*", head).gt("created_at", weekAgo),
    db.from("comments").select("*", head),
    db.from("likes").select("*", head),
    db.from("follows").select("*", head),
  ]);
  const { data: recent } = await db.from("posts").select("author").gt("created_at", weekAgo);
  const activePosters = new Set((recent ?? []).map((r: any) => r.author)).size;

  const stats: [string, number][] = [
    ["Users", users.count ?? 0],
    ["Posts", posts.count ?? 0],
    ["Posts (7d)", posts7.count ?? 0],
    ["Active posters (7d)", activePosters],
    ["Comments", comments.count ?? 0],
    ["Likes", likes.count ?? 0],
    ["Follows", follows.count ?? 0],
  ];

  return (
    <div className="py-2">
      <h1 className="mb-1 text-2xl font-bold">Metrics</h1>
      <p className="mb-6 text-sm text-ash">Product snapshot. Traffic & sources live in Cloudflare Web Analytics. <a href="/reports" className="text-emerald hover:underline">Reports →</a></p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map(([label, n]) => (
          <div key={label} className="rounded-lg border border-hairline bg-surface p-4">
            <p className="text-2xl font-bold text-paper">{n}</p>
            <p className="text-xs text-ash">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
