export const OG_SIZE = { width: 1200, height: 630 };

type Font = { name: string; data: ArrayBuffer; weight: 400 | 700; style: "normal" };

export async function loadOgFonts(): Promise<Font[] | undefined> {
  try {
    const f = async (w: 400 | 700) =>
      (await fetch(`https://cdn.jsdelivr.net/npm/@fontsource/merriweather/files/merriweather-latin-${w}-normal.woff`)).arrayBuffer();
    const [reg, bold] = await Promise.all([f(400), f(700)]);
    return [
      { name: "Merriweather", data: reg, weight: 400, style: "normal" },
      { name: "Merriweather", data: bold, weight: 700, style: "normal" },
    ];
  } catch {
    return undefined;
  }
}
