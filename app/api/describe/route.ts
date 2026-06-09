import { NextResponse } from "next/server";
import { languageName, normalizeLang } from "@/lib/languages";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// THE PRODUCT. Image -> evocative prose. The image is never stored.
// Provider-agnostic: set PROSE_PROVIDER to "gemini" | "openai" | "anthropic".
// Each provider reads its own key/model env var, so you can keep all keys on
// hand and switch instantly. Keys live server-side only (never the browser).

type Provider = "gemini" | "openai" | "anthropic";
const PROVIDER = (process.env.PROSE_PROVIDER || "gemini").toLowerCase() as Provider;

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"];
const MAX_BYTES = 20 * 1024 * 1024;

const MAX_CHARS = 1080;

const PROMPT = `You are the voice of UNSTAGRAM. The reader will NEVER see this photo — your words are the only way they experience it, so describe it well enough that they can fully picture AND appreciate it.
Convey two layers: (1) the CONTENT — what's happening, the mood, the small telling details and the story; and (2) the PHOTOGRAPHIC COMPOSITION, so a photography enthusiast can appreciate the craft: framing and angle, the direction and quality of light, depth of field and focus, color palette and contrast, perspective, balance, and any notable technique.
Write evocative, atmospheric prose — wry and warm, woven together (not a checklist). Let length follow the image, up to about 1080 characters; never pad.
No hashtags, no quotes, no emoji. Do not say "this is a photo/image" — render it as if the reader is standing inside the frame while also admiring how it was captured.`;

type Result = { prose?: string; error?: string; status?: number };

async function viaGemini(prompt: string, mediaType: string, base64: string): Promise<Result> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { error: "Missing GEMINI_API_KEY", status: 503 };
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mediaType, data: base64 } }] }],
  });
  let res: Response | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    res = await fetch(url, { method: "POST", headers: { "x-goog-api-key": key, "content-type": "application/json" }, body });
    if (res.ok) break;
    if ((res.status === 503 || res.status === 429) && attempt < 2) {
      await new Promise((r) => setTimeout(r, 1200 * (attempt + 1)));
      continue;
    }
    break;
  }
  if (!res || !res.ok) {
    const status = res?.status ?? 0;
    const msg = status === 503 || status === 429
      ? "The describer is briefly overloaded — try again in a moment."
      : `Gemini ${status}: ${(await res?.text().catch(() => "") ?? "").slice(0, 300)}`;
    return { error: msg, status: 502 };
  }
  const data: any = await res.json();
  if (data?.promptFeedback?.blockReason)
    return { error: `Gemini wouldn't describe that (${data.promptFeedback.blockReason}).`, status: 422 };
  const prose = (data?.candidates?.[0]?.content?.parts ?? []).map((p: any) => p?.text ?? "").join("").trim();
  return { prose };
}

async function viaOpenAI(prompt: string, mediaType: string, base64: string): Promise<Result> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return { error: "Missing OPENAI_API_KEY", status: 503 };
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({
      model,
      max_tokens: 600,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: `data:${mediaType};base64,${base64}` } },
          ],
        },
      ],
    }),
  });
  if (!res.ok) return { error: `OpenAI ${res.status}: ${(await res.text()).slice(0, 400)}`, status: 502 };
  const data: any = await res.json();
  return { prose: (data?.choices?.[0]?.message?.content ?? "").trim() };
}

async function viaAnthropic(prompt: string, mediaType: string, base64: string): Promise<Result> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return { error: "Missing ANTHROPIC_API_KEY", status: 503 };
  const model = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5";
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model,
      max_tokens: 600,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
            { type: "text", text: prompt },
          ],
        },
      ],
    }),
  });
  if (!res.ok) return { error: `Anthropic ${res.status}: ${(await res.text()).slice(0, 400)}`, status: 502 };
  const data: any = await res.json();
  return { prose: (data?.content?.[0]?.text ?? "").trim() };
}

// Guarantee the cap even if the model overshoots — trim at a word boundary.
function capChars(text: string, max: number): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[.,;:\-]+$/, "") + "…";
}

export async function POST(req: Request) {
  // Require a logged-in user + rate limit (this route costs money per call).
  const auth = await createClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to describe images." }, { status: 401 });
  try {
    const { data: allowed } = await auth.rpc("bump_rate", { p_key: "describe:" + user.id, p_limit: 20, p_window: 60 });
    if (allowed === false) return NextResponse.json({ error: "Slow down — too many in a minute." }, { status: 429 });
  } catch { /* fail open if rate table not set up */ }

  let file: File | null = null;
  let lang = "en";
  let caption = "";
  try {
    const form = await req.formData();
    file = form.get("image") as File | null;
    lang = String(form.get("lang") ?? "en");
    caption = String(form.get("caption") ?? "");
  } catch {
    return NextResponse.json({ error: "Expected multipart form-data with an 'image' field." }, { status: 400 });
  }
  if (!file) return NextResponse.json({ error: "No image provided." }, { status: 400 });

  const mediaType = file.type || "image/jpeg";
  if (!ALLOWED.includes(mediaType))
    return NextResponse.json({ error: `Unsupported type ${mediaType}.` }, { status: 415 });
  const bytes = await file.arrayBuffer();
  if (bytes.byteLength > MAX_BYTES)
    return NextResponse.json({ error: "Image too large (max 10MB)." }, { status: 413 });

  let binary = "";
  const arr = new Uint8Array(bytes);
  for (let i = 0; i < arr.length; i++) binary += String.fromCharCode(arr[i]);
  const base64 = btoa(binary);

  const langName = languageName(normalizeLang(lang));
  const hint = caption.trim()
    ? ` The photographer added this caption as a hint — use it only if it genuinely clarifies an abstract or ambiguous image, and never just repeat it: "${caption.trim().slice(0, 200)}".`
    : "";
  const prompt = PROMPT + ` Write the entire description in ${langName}.` + hint;
  const run = PROVIDER === "openai" ? viaOpenAI : PROVIDER === "anthropic" ? viaAnthropic : viaGemini;
  const { prose, error, status } = await run(prompt, mediaType, base64);

  // Image is now out of scope and discarded. Nothing is persisted here.
  if (error) return NextResponse.json({ error }, { status: status ?? 502 });
  if (!prose) return NextResponse.json({ error: "Empty description returned." }, { status: 502 });
  return NextResponse.json({ prose: capChars(prose, MAX_CHARS) });
}
