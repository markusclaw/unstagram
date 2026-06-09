const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://unstagram.net";

export function link(path: string) { return `${SITE}${path}`; }

export async function notify(content: string): Promise<void> {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content: content.slice(0, 1800), allowed_mentions: { parse: [] } }),
    });
  } catch { /* never let logging break an action */ }
}

export async function usernameOf(db: any, userId: string): Promise<string> {
  try {
    const { data } = await db.from("profiles").select("username").eq("id", userId).maybeSingle();
    return data?.username ? "@" + data.username : "someone";
  } catch {
    return "someone";
  }
}
