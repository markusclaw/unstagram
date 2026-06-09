"use client";

import { useState } from "react";
import { createPost } from "@/app/post/actions";
import { LANGS } from "@/lib/languages";
import LocationInput from "./LocationInput";
import { prepareImage } from "@/lib/prepareImage";

type Stage = "pick" | "staging" | "thinking" | "review" | "posting";
type Result = { ok: boolean; prose?: string; error?: string };
const MAX_IMAGES = 10;

export default function Composer({ defaultLanguage = "en" }: { defaultLanguage?: string }) {
  const [stage, setStage] = useState<Stage>("pick");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [lang, setLang] = useState(defaultLanguage);
  const [progress, setProgress] = useState({ i: 0, n: 0 });
  const [err, setErr] = useState("");

  function reset() {
    previews.forEach((u) => URL.revokeObjectURL(u));
    setFiles([]); setPreviews([]); setResults([]); setErr(""); setStage("pick");
  }
  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const fs = Array.from(e.target.files ?? []).slice(0, MAX_IMAGES);
    if (!fs.length) return;
    previews.forEach((u) => URL.revokeObjectURL(u));
    setFiles(fs); setPreviews(fs.map((f) => URL.createObjectURL(f))); setErr(""); setStage("staging");
  }
  function addMore(e: React.ChangeEvent<HTMLInputElement>) {
    const fs = Array.from(e.target.files ?? []);
    if (!fs.length) return;
    const merged = [...files, ...fs].slice(0, MAX_IMAGES);
    previews.forEach((u) => URL.revokeObjectURL(u));
    setFiles(merged); setPreviews(merged.map((f) => URL.createObjectURL(f)));
  }
  function removeAt(i: number) {
    URL.revokeObjectURL(previews[i]);
    const f = files.filter((_, j) => j !== i);
    const p = previews.filter((_, j) => j !== i);
    setFiles(f); setPreviews(p);
    if (!f.length) reset();
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= files.length) return;
    const f = [...files], p = [...previews];
    [f[i], f[j]] = [f[j], f[i]]; [p[i], p[j]] = [p[j], p[i]];
    setFiles(f); setPreviews(p);
  }

  async function describeOne(file: File): Promise<Result> {
    try {
      const prepared = await prepareImage(file);
      const fd = new FormData();
      fd.append("image", prepared); fd.append("lang", lang); fd.append("caption", caption);
      const res = await fetch("/api/describe", { method: "POST", body: fd });
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || "failed");
      return { ok: true, prose: (await res.json()).prose };
    } catch (e: any) {
      return { ok: false, error: e?.message ?? "failed" };
    }
  }

  async function describeAll() {
    setErr(""); setStage("thinking");
    const res: Result[] = [];
    for (let i = 0; i < files.length; i++) { setProgress({ i: i + 1, n: files.length }); res.push(await describeOne(files[i])); }
    setResults(res);
    if (!res.some((r) => r.ok)) { setErr("None of the photos could be described — try again in a moment."); setStage("staging"); return; }
    setStage("review");
  }
  async function retryFailed() {
    setStage("thinking");
    const res = [...results];
    for (let i = 0; i < res.length; i++) { if (!res[i].ok) { setProgress({ i: i + 1, n: res.length }); res[i] = await describeOne(files[i]); } }
    setResults(res); setStage("review");
  }

  async function publish() {
    const parts = results.filter((r) => r.ok).map((r) => r.prose!);
    if (!parts.length) return;
    setStage("posting");
    const res = await createPost(parts, location || undefined, caption || undefined);
    if (res?.error) { setErr("Couldn't post: " + res.error); setStage("review"); }
  }

  const failedCount = results.filter((r) => !r.ok).length;
  const okResults = results.filter((r) => r.ok);

  return (
    <div className="py-4">
      <h1 className="mb-2 text-2xl font-bold">Post something</h1>
      <p className="mb-6 text-sm text-ash">
        Pick one photo or several. We turn each into a high-resolution description. The pictures are never shown, and never stored.
      </p>

      {err && <p className="mb-4 rounded-md border border-hairline bg-surface px-3 py-2 text-sm text-paper">{err}</p>}

      {stage === "pick" && (
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-hairline px-6 py-16 text-center hover:border-emerald">
          <span className="mb-2 text-paper">choose photo(s)</span>
          <span className="text-xs text-ash">select up to {MAX_IMAGES} — only the descriptions get posted</span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={onPick} />
        </label>
      )}

      {stage === "staging" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {previews.map((src, i) => (
              <div key={i} className="relative h-20 w-20 overflow-hidden rounded-md border border-hairline bg-surface">
                <img src={src} alt={`photo ${i + 1}`} className="h-full w-full object-cover" />
                <button onClick={() => removeAt(i)} aria-label="remove"
                  className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink/80 text-xs text-paper hover:bg-ink">×</button>
                <div className="absolute inset-x-0 bottom-0 flex justify-between bg-ink/70 px-1 text-xs text-paper">
                  <button onClick={() => move(i, -1)} disabled={i === 0} className="disabled:opacity-30" aria-label="move left">‹</button>
                  <span className="text-[10px] text-ash">{i + 1}</span>
                  <button onClick={() => move(i, 1)} disabled={i === previews.length - 1} className="disabled:opacity-30" aria-label="move right">›</button>
                </div>
              </div>
            ))}
            {files.length < MAX_IMAGES && (
              <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-md border border-dashed border-hairline text-2xl text-ash hover:border-emerald hover:text-paper">
                +<input type="file" accept="image/*" multiple className="hidden" onChange={addMore} />
              </label>
            )}
          </div>
          <button onClick={reset} className="text-xs text-ash hover:text-paper">clear all</button>

          <textarea value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={300} rows={3}
            placeholder="write a caption… (optional — helps the AI read abstract shots; add #hashtags)"
            className="w-full rounded-lg border border-hairline bg-surface px-4 py-3 text-sm text-paper placeholder:text-ash focus:border-emerald focus:outline-none" />

          <label className="flex items-center gap-1.5 text-xs text-ash">in
            <select value={lang} onChange={(e) => setLang(e.target.value)}
              className="bg-transparent text-xs text-ash underline decoration-hairline underline-offset-2 focus:text-paper focus:outline-none">
              {LANGS.map((l) => <option key={l.code} value={l.code} className="bg-ink text-paper">{l.label}</option>)}
            </select>
          </label>

          <LocationInput value={location} onChange={setLocation} />

          <button onClick={describeAll}
            className="w-full rounded-full bg-emerald px-5 py-3 text-sm font-semibold text-ink hover:opacity-90">
            describe {files.length > 1 ? `${files.length} photos` : "photo"} →
          </button>
        </div>
      )}

      {stage === "thinking" && (
        <p className="py-16 text-center text-ash animate-pulse">reading the room… {progress.n > 1 ? `(${progress.i}/${progress.n})` : ""}</p>
      )}

      {(stage === "review" || stage === "posting") && (
        <div className="space-y-4">
          {failedCount > 0 && (
            <div className="flex items-center justify-between gap-3 rounded-md border border-hairline bg-surface px-3 py-2 text-sm text-paper">
              <span>{failedCount} photo{failedCount > 1 ? "s" : ""} couldn't be described — the rest are fine.</span>
              <button onClick={retryFailed} className="shrink-0 text-emerald hover:underline">retry</button>
            </div>
          )}

          <p className="text-xs uppercase tracking-wide text-ash">how it reads {okResults.length > 1 ? `· ${okResults.length} slides` : ""}</p>
          <div className="space-y-3">
            {okResults.map((r, i) => (
              <div key={i} className="rounded-lg border border-hairline bg-surface p-5">
                {okResults.length > 1 && <p className="mb-1 text-[11px] uppercase tracking-wide text-ash">{i + 1}/{okResults.length}</p>}
                <p dir="auto" className="prose-body">{r.prose}</p>
              </div>
            ))}
          </div>

          <textarea value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={300} rows={2}
            placeholder="caption (optional) — add #hashtags"
            className="w-full rounded-lg border border-hairline bg-surface px-4 py-3 text-sm text-paper placeholder:text-ash focus:border-emerald focus:outline-none" />
          <LocationInput value={location} onChange={setLocation} />

          <div className="flex gap-3">
            <button onClick={publish} disabled={stage === "posting"}
              className="rounded-full bg-emerald px-5 py-2 text-sm font-semibold text-ink hover:opacity-90 disabled:opacity-60">
              {stage === "posting" ? "publishing…" : "publish"}
            </button>
            <button onClick={describeAll} disabled={stage === "posting"}
              className="rounded-full border border-hairline px-5 py-2 text-sm text-ash hover:text-paper">regenerate</button>
            <button onClick={() => setStage("staging")} disabled={stage === "posting"}
              className="rounded-full border border-hairline px-5 py-2 text-sm text-ash hover:text-paper">back</button>
          </div>
        </div>
      )}
    </div>
  );
}
