import { ImageResponse } from "next/og";
import { getProfile } from "@/lib/db";
import { OG_SIZE, loadOgFonts } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "An UNSTAGRAM profile";

export default async function OgImage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const p = await getProfile(username).catch(() => null);
  const name = p?.displayName || p?.username || username;
  const handle = "@" + (p?.username || username);
  const bioRaw = p?.bio || "Photos described in words.";
  const bio = bioRaw.length > 160 ? bioRaw.slice(0, 160).trimEnd() + "…" : bioRaw;
  const stats = p ? `${p.followerCount} followers · ${p.followingCount} following` : "";
  const fonts = await loadOgFonts();

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#0D0D0D", padding: 44 }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between", border: "2px solid #3D8B6A", borderRadius: 28, padding: "56px 64px" }}>
          <div style={{ display: "flex", fontSize: 26, fontWeight: 700, letterSpacing: 3, color: "#3D8B6A" }}>UNSTAGRAM</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontFamily: "Merriweather", fontSize: 64, fontWeight: 700, color: "#F0F0F0" }}>{name}</div>
            <div style={{ display: "flex", fontSize: 28, color: "#A0A0A0", paddingTop: 8 }}>{handle}</div>
            <div style={{ display: "flex", fontFamily: "Merriweather", fontSize: 30, lineHeight: 1.4, color: "#F0F0F0", paddingTop: 22 }}>{bio}</div>
          </div>
          <div style={{ display: "flex", fontSize: 24, color: "#A0A0A0" }}>{stats}</div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
