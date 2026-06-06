"use client";

import { useState } from "react";
import { generateProse } from "@/lib/generateProse";

type Stage = "pick" | "thinking" | "review" | "posted";

export default function Composer() {
  const [stage, setStage] = useState<Stage>("pick");
  const [fileName, setFileName] = useState<string>("");
  const [prose, setProse] = useState<string>("");

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    setStage("thinking");
    // NOTE: the image is read only to be described. It is never uploaded,
    // never stored, never shown. Once we have prose, the file is forgotten.
    const text = await generateProse(f.name);
    setProse(text);
    setStage("review");
  }

  async function regenerate() {
    setStage("thinking");
    setProse(await generateProse(fileName));
    setStage("review");
  }

  if (stage === "posted") {
    return (
      <div className="py-16 text-center">
        <p className="prose-body mb-6">{prose}</p>
        <p className="text-sm text-ash">posted. your followers will never see the photo.</p>
        <a href="/" className="mt-6 inline-block text-emerald hover:underline">back to feed →</a>
      </div>
    );
  }

  return (
    <div className="py-4">
      <h1 className="mb-2 text-2xl font-bold">Post something</h1>
      <p className="mb-8 text-sm text-ash">
        Pick a photo. We turn it into words. The picture is never shown to anyone — not even kept.
      </p>

      {stage === "pick" && (
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-hairline px-6 py-16 text-center hover:border-emerald">
          <span className="mb-2 text-paper">choose a photo</span>
          <span className="text-xs text-ash">it stays on your device — only the description gets posted</span>
          <input type="file" accept="image/*" className="hidden" onChange={onPick} />
        </label>
      )}

      {stage === "thinking" && (
        <div className="py-16 text-center text-ash">
          <p className="animate-pulse">reading the room…</p>
        </div>
      )}

      {stage === "review" && (
        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-ash">how it reads</p>
          <p className="prose-body rounded-lg border border-hairline bg-surface p-5">{prose}</p>
          <div className="mt-5 flex gap-3">
            <button
              onClick={() => setStage("posted")}
              className="rounded-full bg-emerald px-5 py-2 text-sm font-semibold text-ink hover:opacity-90"
            >
              post this
            </button>
            <button
              onClick={regenerate}
              className="rounded-full border border-hairline px-5 py-2 text-sm text-ash hover:text-paper"
            >
              regenerate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
