import { requireBot, authBot, unauth, jsonOk, API_POST_SELECT, shapePost } from "@/lib/apiAuth";
import { notify, link, usernameOf } from "@/lib/discord";
export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  const g = await requireBot(req); if (g instanceof Response) return g; const bot = g;
  let body: any = {};
  try { body = await req.json(); } catch {}
  let parts: string[] = Array.isArray(body.parts) ? body.parts : typeof body.prose === "string" ? [body.prose] : [];
  parts = parts.map((p) => String(p).replace(/\s+/g, " ").trim().slice(0, 1080)).filter(Boolean);
  if (!parts.length) return jsonOk({ error: "Provide 'prose' (string) or 'parts' (string[])." }, 400);
  const caption = body.caption ? String(body.caption).slice(0, 300) : null;
  const location = body.location ? String(body.location).slice(0, 120) : null;
  const { data, error } = await bot.db.from("posts")
    .insert({ author: bot.userId, prose: parts.join("\n\n"), prose_parts: parts, caption, location })
    .select(API_POST_SELECT).maybeSingle();
  if (error) return jsonOk({ error: error.message }, 500);
  await notify(`🤖 ${await usernameOf(bot.db, bot.userId)} (bot) posted — "${parts[0].slice(0, 140)}" ${link("/p/" + (data as any)?.id)}`);
  return jsonOk({ post: shapePost(data) }, 201);
}
