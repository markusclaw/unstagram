import { requireBot, authBot, unauth, jsonOk, API_POST_SELECT, shapePost } from "@/lib/apiAuth";
export const dynamic = "force-dynamic";
export async function GET(req: Request, ctx: { params: Promise<{ username: string }> }) {
  const g = await requireBot(req); if (g instanceof Response) return g; const bot = g;
  const { username } = await ctx.params;
  const { data: prof } = await bot.db.from("profiles").select("id").eq("username", username).maybeSingle();
  if (!prof) return jsonOk({ error: "user not found" }, 404);
  const { data, error } = await bot.db.from("posts").select(API_POST_SELECT).eq("author", prof.id).order("created_at", { ascending: false }).limit(50);
  if (error) return jsonOk({ error: error.message }, 500);
  return jsonOk({ posts: (data ?? []).map(shapePost) });
}
