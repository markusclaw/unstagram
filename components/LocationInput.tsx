"use client";

import { useEffect, useRef, useState } from "react";

export default function LocationInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [sugg, setSugg] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [geoBusy, setGeoBusy] = useState(false);
  const skip = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (skip.current) { skip.current = false; return; }
    if (value.trim().length < 3) { setSugg([]); setOpen(false); return; }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        const r = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(value)}&limit=5`);
        const d = await r.json();
        const items = (d.features ?? []).map((f: any) => {
          const p = f.properties ?? {};
          return [p.name, p.city || p.county, p.state, p.country].filter(Boolean).join(", ");
        });
        setSugg(Array.from(new Set(items)).slice(0, 5) as string[]);
        setOpen(true);
      } catch { setSugg([]); }
    }, 300);
  }, [value]);

  function pick(s: string) { skip.current = true; onChange(s); setOpen(false); setSugg([]); }

  function useMyLocation() {
    if (!navigator.geolocation) return;
    setGeoBusy(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const r = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          const d = await r.json();
          skip.current = true;
          onChange([d.city || d.locality, d.principalSubdivision || d.countryName].filter(Boolean).join(", ") || d.countryName || "");
        } catch {} finally { setGeoBusy(false); }
      },
      () => setGeoBusy(false),
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <input value={value} onChange={(e) => onChange(e.target.value)} maxLength={120}
          placeholder="add a location (optional) — start typing"
          className="flex-1 rounded-full border border-hairline bg-surface px-3 py-1.5 text-xs text-paper placeholder:text-ash focus:border-emerald focus:outline-none" />
        <button onClick={useMyLocation} disabled={geoBusy}
          className="shrink-0 rounded-full border border-hairline px-3 py-1.5 text-xs text-ash hover:text-paper disabled:opacity-60">
          {geoBusy ? "locating…" : "use my location"}
        </button>
      </div>
      {open && sugg.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-hairline bg-ink shadow-lg">
          {sugg.map((s) => (
            <li key={s}>
              <button onClick={() => pick(s)} className="block w-full truncate px-3 py-2 text-left text-xs text-paper hover:bg-surface">{s}</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
