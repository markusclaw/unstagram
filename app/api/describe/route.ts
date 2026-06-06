import { NextResponse } from "next/server";
import { languageName, normalizeLang } from "@/lib/languages";

export const dynamic = "force-dynamic";

// THE PRODUCT. Image -> evocative prose. The image is never stored.
// Provider-agnostic: set PROSE_PROVIDER to "gemini" | "openai" | "anthropic".
// Each provider reads its own key/model env var, so you can keep all keys on
// hand and switch instantly. Keys live server-side only (never the browser).

type Provider = "gemini" | "openai" | "anthropic";
const PROVIDER = (process.env.PROSE_PROVIDER || "gemini").toLowerCase() as Provider;

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"];
const MAX_BYTES = 10 * 1024 * 1024;

const MAX_CHARS = 1080;

const PROMPT = `You are the voice of UNSTAGRAM, where photos are never shown — only described.
Describe this image richly in roughly 800–1080 characters (about 6–9 sentences). Use the full space.
Capture the light, the mood, the textures, the spatial details, and several small telling specifics — wry and warm.
No hashtags, no quotes, no emoji. Do not mention that this is a photo or image.
Write it like an immersive, high-resolution description someone could stand inside.`;

type Result = { prose?: string; error?: string; status?: number };

async function viaGemini(prompt: string, mediaType: string, base64: string): Promise<Result> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { error: "Missing GEMINI_API_KEY", status: 503 };
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: { "x-goog-api-key": key, "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mediaType, data: base64 } }] }],
      }),
    },
  );
  if (!res.ok) return { error: `Gemini ${res.status}: ${(await res.text()).slice(0, 400)}`, status: 502 };
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
  let file: File | null = null;
  let lang = "en";
  try {
    const form = await req.formData();
    file = form.get("image") as File | null;
    lang = String(form.get("lang") ?? "en");
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
  const prompt = PROMPT + ` Write the entire description in ${langName}.`;
  const run = PROVIDER === "openai" ? viaOpenAI : PROVIDER === "anthropic" ? viaAnthropic : viaGemini;
  const { prose, error, status } = await run(prompt, mediaType, base64);

  // Image is now out of scope and discarded. Nothing is persisted here.
  if (error) return NextResponse.json({ error }, { status: status ?? 502 });
  if (!prose) return NextResponse.json({ error: "Empty description returned." }, { status: 502 });
  return NextResponse.json({ prose: capChars(prose, MAX_CHARS) });
}
