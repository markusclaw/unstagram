import { ImageResponse } from "next/og";
import { getPost } from "@/lib/db";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "An UNSTAGRAM post — a photo, described in words";

async function loadFont(weight: 400 | 700): Promise<ArrayBuffer> {
  const res = await fetch(`https://cdn.jsdelivr.net/npm/@fontsource/merriweather/files/merriweather-latin-${weight}-normal.woff`);
  return res.arrayBuffer();
}

export default async function OgImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPost(id).catch(() => null);

  const raw = post?.proseParts?.[0] ?? "A photo, described in words.";
  const body = raw.length > 240 ? raw.slice(0, 240).trimEnd() + "…" : raw;
  const user = post ? "@" + post.author.username : "unstagram.net";
  const loc = post?.location ?? "";

  let fonts;
  try {
    const [reg, bold] = await Promise.all([loadFont(400), loadFont(700)]);
    fonts = [
      { name: "Merriweather", data: reg, weight: 400 as const, style: "normal" as const },
      { name: "Merriweather", data: bold, weight: 700 as const, style: "normal" as const },
    ];
  } catch {
    fonts = undefined; // fall back to default font if CDN hiccups
  }

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#0D0D0D", padding: 44 }}>
        <div
          style={{
            display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between",
            border: "2px solid #3D8B6A", borderRadius: 28, padding: "56px 64px",
          }}
        >
          <div style={{ display: "flex", fontSize: 26, fontWeight: 700, letterSpacing: 3, color: "#3D8B6A" }}>
            UNSTAGRAM
          </div>
          <div
            style={{
              display: "flex", fontFamily: "Merriweather", fontSize: 46, lineHeight: 1.45,
              color: "#F0F0F0", paddingTop: 24, paddingBottom: 24,
            }}
          >
            {"“" + body + "”"}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#A0A0A0" }}>
            <div style={{ display: "flex", fontWeight: 700, color: "#F0F0F0" }}>{user}</div>
            <div style={{ display: "flex" }}>{loc}</div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
