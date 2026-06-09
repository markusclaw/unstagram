import { adminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const provided = req.headers.get("x-cron-secret") || new URL(req.url).searchParams.get("secret");
  if (!secret || provided !== secret) return Response.json({ error: "unauthorized" }, { status: 401 });
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return Response.json({ error: "not configured" }, { status: 503 });

  const db = adminClient();
  const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const head = { count: "exact" as const, head: true };
  const [users7, posts7, comments7] = await Promise.all([
    db.from("profiles").select("*", head).gt("created_at", weekAgo),
    db.from("posts").select("*", head).gt("created_at", weekAgo),
    db.from("comments").select("*", head).gt("created_at", weekAgo),
  ]);
  const { data: recent } = await db.from("posts").select("author").gt("created_at", weekAgo);
  const activePosters = new Set((recent ?? []).map((r: any) => r.author)).size;

  const stats = {
    newUsers: users7.count ?? 0,
    newPosts: posts7.count ?? 0,
    newComments: comments7.count ?? 0,
    activePosters,
  };

  const to = (process.env.ADMIN_EMAILS || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (to.length) {
    const html = `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#111">
        <h2>UNSTAGRAM — this week</h2>
        <ul style="font-size:15px;line-height:1.8">
          <li><b>${stats.newUsers}</b> new users</li>
          <li><b>${stats.newPosts}</b> new posts</li>
          <li><b>${stats.newComments}</b> new comments</li>
          <li><b>${stats.activePosters}</b> active posters</li>
        </ul>
      </div>`;
    await sendEmail(to, "UNSTAGRAM weekly digest", html);
  }
  return Response.json({ ok: true, stats });
}
