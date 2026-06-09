import { ImageResponse } from "next/og";
import { OG_SIZE, loadOgFonts } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "UNSTAGRAM — photos you read, not see";

export default async function OgImage() {
  const fonts = await loadOgFonts();
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#0D0D0D", padding: 44 }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", alignItems: "center", textAlign: "center", border: "2px solid #3D8B6A", borderRadius: 28, padding: "56px 64px" }}>
          <div style={{ display: "flex", fontSize: 64, fontWeight: 700, letterSpacing: 4, color: "#F0F0F0" }}>UNSTAGRAM</div>
          <div style={{ display: "flex", fontFamily: "Merriweather", fontSize: 34, color: "#A0A0A0", paddingTop: 24, maxWidth: 820, lineHeight: 1.4 }}>
            Post a photo. Your followers read the words — never the picture.
          </div>
          <div style={{ display: "flex", fontSize: 22, color: "#3D8B6A", paddingTop: 28, letterSpacing: 2 }}>unstagram.net</div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
