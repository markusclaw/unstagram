import { adminClient } from "@/lib/supabase/admin";
import { sha256hex } from "@/lib/token";

export type Bot = { userId: string; db: ReturnType<typeof adminClient> };

export async function authBot(req: Request): Promise<Bot | null> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  const h = req.headers.get("authorization") || "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  if (!m) return null;
  const db = adminClient();
  const hash = await sha256hex(m[1].trim());
  const { data } = await db.from("api_tokens").select("user_id").eq("token_hash", hash).maybeSingle();
  if (!data) return null;
  // best-effort touch (don't await)
  db.from("api_tokens").update({ last_used_at: new Date().toISOString() }).eq("token_hash", hash).then(() => {});
  return { userId: data.user_id, db };
}

export function tooMany() {
  return Response.json({ error: "Rate limit exceeded — slow down (60 requests/minute)." }, { status: 429 });
}

async function underRateLimit(bot: Bot): Promise<boolean> {
  try {
    const { data, error } = await bot.db.rpc("bump_rate", { p_key: "u:" + bot.userId, p_limit: 60, p_window: 60 });
    if (error) return true; // fail open (e.g. migration not run yet)
    return data === true;
  } catch {
    return true;
  }
}

// Auth + rate limit in one. Returns the Bot, or a Response (401/429) to return directly.
export async function requireBot(req: Request): Promise<Bot | Response> {
  const bot = await authBot(req);
  if (!bot) return unauth();
  if (!(await underRateLimit(bot))) return tooMany();
  return bot;
}

export function jsonOk(data: any, status = 200) {
  return Response.json(data, { status });
}
export function unauth() {
  return Response.json({ error: "Invalid or missing API token. Send: Authorization: Bearer <token>" }, { status: 401 });
}

// Shape a post row for API responses.
const API_POST_SELECT =
  "id, prose, prose_parts, caption, location, created_at, author:profiles!posts_author_fkey(username, display_name), likes(count), comments(count)";
export { API_POST_SELECT };

export function shapePost(row: any) {
  const a = Array.isArray(row.author) ? row.author[0] : row.author;
  const likeCount = Array.isArray(row.likes) ? row.likes[0]?.count ?? 0 : 0;
  const replyCount = Array.isArray(row.comments) ? row.comments[0]?.count ?? 0 : 0;
  return {
    id: row.id,
    prose: row.prose,
    parts: Array.isArray(row.prose_parts) && row.prose_parts.length ? row.prose_parts : [row.prose],
    caption: row.caption ?? null,
    location: row.location ?? null,
    createdAt: row.created_at,
    author: { username: a?.username ?? null, displayName: a?.display_name ?? null },
    likeCount,
    replyCount,
    url: `/p/${row.id}`,
  };
}
