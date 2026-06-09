import { ImageResponse } from "next/og";
import { getPost } from "@/lib/db";
import { loadOgFonts } from "@/lib/og";

export const size = { width: 1200, height: 760 };
export const contentType = "image/png";
export const alt = "An UNSTAGRAM post — a photo, described in words";

export default async function OgImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPost(id).catch(() => null);
  const raw = post?.proseParts?.[0] ?? "A photo, described in words.";
  const body = raw.length > 360 ? raw.slice(0, 360).trimEnd() + "…" : raw;
  const user = post ? "@" + post.author.username : "unstagram.net";
  const locRaw = post?.location ?? "";
  const loc = locRaw.length > 42 ? locRaw.slice(0, 42).trimEnd() + "…" : locRaw;
  const fonts = await loadOgFonts();

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#0D0D0D", padding: 44 }}>
        <div
          style={{
            display: "flex", flexDirection: "column", flex: 1, border: "2px solid #3D8B6A",
            borderRadius: 28, padding: "52px 60px",
          }}
        >
          <div style={{ display: "flex", fontSize: 26, fontWeight: 700, letterSpacing: 3, color: "#3D8B6A" }}>
            UNSTAGRAM
          </div>

          <div
            style={{
              display: "flex", flex: 1, minHeight: 0, overflow: "hidden",
              fontFamily: "Merriweather", fontSize: 43, lineHeight: 1.42, color: "#F0F0F0",
              paddingTop: 30, paddingBottom: 30,
            }}
          >
            {"“" + body + "”"}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 23 }}>
            <div style={{ display: "flex", fontWeight: 700, color: "#F0F0F0" }}>{user}</div>
            <div style={{ display: "flex", color: "#A0A0A0" }}>{loc}</div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts, headers: { "cache-control": "public, max-age=31536000, immutable" } },
  );
}
