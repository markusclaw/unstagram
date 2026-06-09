import { requireBot, authBot, unauth, jsonOk } from "@/lib/apiAuth";
export const dynamic = "force-dynamic";
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const g = await requireBot(req); if (g instanceof Response) return g; const bot = g;
  const { id } = await ctx.params;
  const { error } = await bot.db.from("likes").upsert({ user_id: bot.userId, post_id: id });
  if (error) return jsonOk({ error: error.message }, 500);
  return jsonOk({ ok: true });
}
export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const g = await requireBot(req); if (g instanceof Response) return g; const bot = g;
  const { id } = await ctx.params;
  await bot.db.from("likes").delete().eq("user_id", bot.userId).eq("post_id", id);
  return jsonOk({ ok: true });
}
