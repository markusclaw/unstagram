"use client";

import { useState } from "react";
import { createPost } from "@/app/post/actions";

type Stage = "pick" | "thinking" | "review" | "posting";

export default function Composer() {
  const [stage, setStage] = useState<Stage>("pick");
  const [file, setFile] = useState<File | null>(null);
  const [prose, setProse] = useState("");
  const [location, setLocation] = useState("");
  const [geoBusy, setGeoBusy] = useState(false);
  const [err, setErr] = useState("");

  async function describe(f: File) {
    setErr("");
    setStage("thinking");
    try {
      const fd = new FormData();
      fd.append("image", f);
      const res = await fetch("/api/describe", { method: "POST", body: fd });
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || "describe failed");
      const { prose } = await res.json();
      setProse(prose);
      setStage("review");
    } catch (e: any) {
      setErr(e?.message ?? "Something went wrong describing that image.");
      setStage("pick");
    }
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    describe(f);
  }

  function addLocation() {
    if (!navigator.geolocation) { setErr("Geolocation isn't available in this browser."); return; }
    setGeoBusy(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const r = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
          );
          const d = await r.json();
          const region = [d.city || d.locality, d.principalSubdivision || d.countryName].filter(Boolean).join(", ");
          setLocation(region || d.countryName || "somewhere");
        } catch {
          setErr("Couldn't look up that location.");
        } finally {
          setGeoBusy(false);
        }
      },
      () => { setErr("Location permission denied."); setGeoBusy(false); },
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }

  async function post() {
    setErr("");
    setStage("posting");
    const res = await createPost(prose, location || undefined); // redirects to feed on success
    if (res?.error) {
      setErr("Couldn't post: " + res.error);
      setStage("review");
    }
  }

  return (
    <div className="py-4">
      <h1 className="mb-2 text-2xl font-bold">Post something</h1>
      <p className="mb-8 text-sm text-ash">
        Pick a photo. We turn it into a few vivid sentences. The picture is never shown — and never stored.
      </p>

      {err && <p className="mb-4 rounded-md border border-hairline bg-surface px-3 py-2 text-sm text-paper">{err}</p>}

      {stage === "pick" && (
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-hairline px-6 py-16 text-center hover:border-emerald">
          <span className="mb-2 text-paper">choose a photo</span>
          <span className="text-xs text-ash">only the description gets posted</span>
          <input type="file" accept="image/*" className="hidden" onChange={onPick} />
        </label>
      )}

      {stage === "thinking" && <p className="py-16 text-center text-ash animate-pulse">reading the room…</p>}

      {(stage === "review" || stage === "posting") && (
        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-ash">how it reads ({prose.length}/720)</p>
          <p className="prose-body rounded-lg border border-hairline bg-surface p-5">{prose}</p>

          <div className="mt-4">
            {location ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-hairline px-3 py-1 text-xs text-ash">
                {location}
                <button onClick={() => setLocation("")} className="hover:text-paper" aria-label="remove location">×</button>
              </span>
            ) : (
              <button onClick={addLocation} disabled={geoBusy}
                className="rounded-full border border-hairline px-3 py-1 text-xs text-ash hover:text-paper disabled:opacity-60">
                {geoBusy ? "locating…" : "add location (optional)"}
              </button>
            )}
          </div>

          <div className="mt-5 flex gap-3">
            <button onClick={post} disabled={stage === "posting"}
              className="rounded-full bg-emerald px-5 py-2 text-sm font-semibold text-ink hover:opacity-90 disabled:opacity-60">
              {stage === "posting" ? "posting…" : "post this"}
            </button>
            <button onClick={() => file && describe(file)} disabled={stage === "posting"}
              className="rounded-full border border-hairline px-5 py-2 text-sm text-ash hover:text-paper">
              regenerate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
