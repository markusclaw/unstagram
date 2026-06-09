const FROM = process.env.EMAIL_FROM || "UNSTAGRAM <onboarding@resend.dev>";
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://unstagram.net";

export async function sendEmail(to: string | string[], subject: string, html: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    });
  } catch { /* never let email break a flow */ }
}

export function welcomeEmail(username: string): string {
  return `
  <div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;color:#111">
    <h1 style="font-size:22px;margin:0 0 8px">Welcome to UNSTAGRAM, @${username}</h1>
    <p style="font-size:15px;line-height:1.6;color:#444">
      You're in. Here, photos are never shown — you post a picture and your followers read it as words.
      Post something, follow a few people, and watch the feed fill with described moments.
    </p>
    <p style="margin:20px 0">
      <a href="${SITE}" style="background:#3D8B6A;color:#fff;text-decoration:none;padding:10px 18px;border-radius:999px;font-family:sans-serif;font-size:14px">Open UNSTAGRAM</a>
    </p>
    <p style="font-size:12px;color:#999">unstagram.net · the anti-feed</p>
  </div>`;
}
