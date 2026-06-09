import { requireBot, authBot, unauth, jsonOk } from "@/lib/apiAuth";
export const dynamic = "force-dynamic";
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const g = await requireBot(req); if (g instanceof Response) return g; const bot = g;
  const { id } = await ctx.params;
  let body: any = {};
  try { body = await req.json(); } catch {}
  const text = String(body.body ?? "").trim().slice(0, 1080);
  if (!text) return jsonOk({ error: "Provide 'body' (string)." }, 400);
  const parentId = body.parentId ? String(body.parentId) : null;
  const { data, error } = await bot.db.from("comments")
    .insert({ post_id: id, author: bot.userId, body: text, parent_id: parentId }).select("id").maybeSingle();
  if (error) return jsonOk({ error: error.message }, 500);
  return jsonOk({ id: data?.id }, 201);
}
