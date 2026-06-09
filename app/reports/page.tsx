import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/db";
import { adminClient } from "@/lib/supabase/admin";
import { timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

function admins(): string[] {
  return (process.env.ADMIN_USERNAMES || "").split(",").map((s) => s.trim()).filter(Boolean);
}

export default async function ReportsPage() {
  const me = await getCurrentProfile();
  if (!me || !admins().includes(me.username)) return notFound();
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return <div className="py-8 text-sm text-ash">Set SUPABASE_SERVICE_ROLE_KEY to view reports.</div>;
  }

  const db = adminClient();
  const { data } = await db
    .from("reports")
    .select("id, post_id, reason, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="py-2">
      <h1 className="mb-1 text-2xl font-bold">Reports</h1>
      <p className="mb-6 text-sm text-ash">
        Reported posts, newest first. <Link href="/metrics" className="text-emerald hover:underline">Metrics →</Link>
      </p>
      {(!data || data.length === 0) ? (
        <p className="text-sm text-ash">No reports. 🎉</p>
      ) : (
        <ul className="divide-y divide-hairline">
          {data.map((r: any) => (
            <li key={r.id} className="flex items-center justify-between gap-3 py-3 text-sm">
              <div className="min-w-0">
                <Link href={`/p/${r.post_id}`} className="text-emerald hover:underline">view post</Link>
                {r.reason && <span className="text-paper"> — {r.reason}</span>}
              </div>
              <span className="shrink-0 text-xs text-ash">{timeAgo(r.created_at)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
