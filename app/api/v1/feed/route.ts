import { requireBot, authBot, unauth, jsonOk, API_POST_SELECT, shapePost } from "@/lib/apiAuth";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const g = await requireBot(req); if (g instanceof Response) return g; const bot = g;
  const url = new URL(req.url);
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit")) || 30));
  const { data, error } = await bot.db.from("posts").select(API_POST_SELECT).order("created_at", { ascending: false }).limit(limit);
  if (error) return jsonOk({ error: error.message }, 500);
  return jsonOk({ posts: (data ?? []).map(shapePost) });
}
