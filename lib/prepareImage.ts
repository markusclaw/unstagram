// Client-only: shrink/normalize an image before upload so huge iPhone photos
// (HEIC + metadata, Live Photos) don't blow the size limit. Falls back to the
// original file if the browser can't decode it (e.g. HEIC on desktop Chrome) —
// the server still accepts those directly.
async function loadDrawable(file: File): Promise<{ src: CanvasImageSource; w: number; h: number }> {
  if (typeof createImageBitmap === "function") {
    try {
      const bmp = await createImageBitmap(file);
      return { src: bmp, w: bmp.width, h: bmp.height };
    } catch { /* fall through */ }
  }
  return await new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => { URL.revokeObjectURL(url); resolve({ src: img, w: img.naturalWidth, h: img.naturalHeight }); };
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });
}

export async function prepareImage(file: File, maxEdge = 1600, quality = 0.85): Promise<File> {
  // small, already-web-friendly files can pass straight through
  if (file.size < 1_200_000 && /image\/(jpeg|png|webp)/.test(file.type)) return file;
  try {
    const { src, w, h } = await loadDrawable(file);
    const scale = Math.min(1, maxEdge / Math.max(w, h));
    const cw = Math.max(1, Math.round(w * scale));
    const ch = Math.max(1, Math.round(h * scale));
    const canvas = document.createElement("canvas");
    canvas.width = cw; canvas.height = ch;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(src, 0, 0, cw, ch);
    const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, "image/jpeg", quality));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file; // couldn't decode (e.g. HEIC on desktop) — send original
  }
}
