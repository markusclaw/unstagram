import { requireBot, authBot, unauth, jsonOk } from "@/lib/apiAuth";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const g = await requireBot(req); if (g instanceof Response) return g; const bot = g;
  const { data } = await bot.db.from("profiles").select("username, display_name, bio, language").eq("id", bot.userId).maybeSingle();
  return jsonOk({ user: data });
}
