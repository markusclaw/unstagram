"use client";

import { useState } from "react";
import { createPost } from "@/app/post/actions";
import { LANGS } from "@/lib/languages";

type Stage = "pick" | "thinking" | "review" | "posting";
const MAX_IMAGES = 10;

export default function Composer({ defaultLanguage = "en" }: { defaultLanguage?: string }) {
  const [stage, setStage] = useState<Stage>("pick");
  const [files, setFiles] = useState<File[]>([]);
  const [parts, setParts] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [geoBusy, setGeoBusy] = useState(false);
  const [lang, setLang] = useState(defaultLanguage);
  const [caption, setCaption] = useState("");
  const [progress, setProgress] = useState({ i: 0, n: 0 });
  const [err, setErr] = useState("");

  async function describeAll(fs: File[]) {
    setErr("");
    setStage("thinking");
    const out: string[] = [];
    for (let i = 0; i < fs.length; i++) {
      setProgress({ i: i + 1, n: fs.length });
      try {
        const fd = new FormData();
        fd.append("image", fs[i]);
        fd.append("lang", lang);
        fd.append("caption", caption);
        const res = await fetch("/api/describe", { method: "POST", body: fd });
        if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || "describe failed");
        out.push((await res.json()).prose);
      } catch (e: any) {
        setErr(e?.message ?? "Something went wrong describing an image.");
        setStage("pick");
        return;
      }
    }
    setParts(out);
    setStage("review");
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const fs = Array.from(e.target.files ?? []).slice(0, MAX_IMAGES);
    if (!fs.length) return;
    setFiles(fs);
    describeAll(fs);
  }

  function addLocation() {
    if (!navigator.geolocation) { setErr("Geolocation isn't available in this browser."); return; }
    setGeoBusy(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const r = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          const d = await r.json();
          const region = [d.city || d.locality, d.principalSubdivision || d.countryName].filter(Boolean).join(", ");
          setLocation(region || d.countryName || "somewhere");
        } catch { setErr("Couldn't look up that location."); }
        finally { setGeoBusy(false); }
      },
      () => { setErr("Location permission denied."); setGeoBusy(false); },
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }

  async function post() {
    setStage("posting");
    const res = await createPost(parts, location || undefined, caption || undefined);
    if (res?.error) { setErr("Couldn't post: " + res.error); setStage("review"); }
  }

  return (
    <div className="py-4">
      <h1 className="mb-2 text-2xl font-bold">Post something</h1>
      <p className="mb-6 text-sm text-ash">
        Pick one photo or several. We turn each into a high-resolution description — a little story.
        The pictures are never shown, and never stored.
      </p>

      <div className="mb-6 flex items-center gap-2 text-sm">
        <span className="text-ash">language</span>
        <select value={lang} onChange={(e) => setLang(e.target.value)}
          className="rounded-lg border border-hairline bg-surface px-3 py-1.5 text-paper focus:border-emerald focus:outline-none">
          {LANGS.map((l) => <option key={l.code} value={l.code} className="bg-ink">{l.label}</option>)}
        </select>
      </div>

      <div className="mb-6">
        <textarea value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={300} rows={2}
          placeholder="caption (optional) — helps the AI read abstract shots, and you can add #hashtags"
          className="w-full rounded-lg border border-hairline bg-surface px-4 py-3 text-sm text-paper placeholder:text-ash focus:border-emerald focus:outline-none" />
      </div>

      {err && <p className="mb-4 rounded-md border border-hairline bg-surface px-3 py-2 text-sm text-paper">{err}</p>}

      {stage === "pick" && (
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-hairline px-6 py-16 text-center hover:border-emerald">
          <span className="mb-2 text-paper">choose photo(s)</span>
          <span className="text-xs text-ash">select up to {MAX_IMAGES} — only the descriptions get posted</span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={onPick} />
        </label>
      )}

      {stage === "thinking" && (
        <p className="py-16 text-center text-ash animate-pulse">
          reading the room… {progress.n > 1 ? `(${progress.i}/${progress.n})` : ""}
        </p>
      )}

      {(stage === "review" || stage === "posting") && (
        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-ash">
            how it reads {parts.length > 1 ? `· ${parts.length} slides` : ""}
          </p>
          <div className="space-y-3">
            {parts.map((p, i) => (
              <div key={i} className="rounded-lg border border-hairline bg-surface p-5">
                {parts.length > 1 && <p className="mb-1 text-[11px] uppercase tracking-wide text-ash">{i + 1}/{parts.length}</p>}
                <p dir="auto" className="prose-body">{p}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <input value={location} onChange={(e) => setLocation(e.target.value)} maxLength={80}
              placeholder="add a location (optional)"
              className="flex-1 rounded-full border border-hairline bg-surface px-3 py-1.5 text-xs text-paper placeholder:text-ash focus:border-emerald focus:outline-none" />
            <button onClick={addLocation} disabled={geoBusy}
              className="shrink-0 rounded-full border border-hairline px-3 py-1.5 text-xs text-ash hover:text-paper disabled:opacity-60">
              {geoBusy ? "locating…" : "use my location"}
            </button>
          </div>

          <div className="mt-5 flex gap-3">
            <button onClick={post} disabled={stage === "posting"}
              className="rounded-full bg-emerald px-5 py-2 text-sm font-semibold text-ink hover:opacity-90 disabled:opacity-60">
              {stage === "posting" ? "posting…" : "post this"}
            </button>
            <button onClick={() => files.length && describeAll(files)} disabled={stage === "posting"}
              className="rounded-full border border-hairline px-5 py-2 text-sm text-ash hover:text-paper">
              regenerate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
