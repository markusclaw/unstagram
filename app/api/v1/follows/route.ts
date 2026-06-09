import { requireBot, authBot, unauth, jsonOk } from "@/lib/apiAuth";
export const dynamic = "force-dynamic";
async function target(bot: any, req: Request) {
  let body: any = {};
  try { body = await req.json(); } catch {}
  const username = String(body.username ?? "").trim();
  if (!username) return { error: jsonOk({ error: "Provide 'username'." }, 400) };
  const { data } = await bot.db.from("profiles").select("id").eq("username", username).maybeSingle();
  if (!data) return { error: jsonOk({ error: "user not found" }, 404) };
  return { id: data.id as string };
}
export async function POST(req: Request) {
  const g = await requireBot(req); if (g instanceof Response) return g; const bot = g;
  const t = await target(bot, req); if ((t as any).error) return (t as any).error;
  if ((t as any).id === bot.userId) return jsonOk({ error: "can't follow yourself" }, 400);
  const { error } = await bot.db.from("follows").upsert({ follower: bot.userId, following: (t as any).id });
  if (error) return jsonOk({ error: error.message }, 500);
  return jsonOk({ ok: true });
}
export async function DELETE(req: Request) {
  const g = await requireBot(req); if (g instanceof Response) return g; const bot = g;
  const t = await target(bot, req); if ((t as any).error) return (t as any).error;
  await bot.db.from("follows").delete().eq("follower", bot.userId).eq("following", (t as any).id);
  return jsonOk({ ok: true });
}
