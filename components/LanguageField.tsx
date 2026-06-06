"use client";

import { useEffect, useState } from "react";
import { LANGS, normalizeLang } from "@/lib/languages";

export default function LanguageField({ name, initial }: { name: string; initial?: string }) {
  const [v, setV] = useState(initial ?? "en");
  useEffect(() => {
    if (!initial && typeof navigator !== "undefined") {
      setV(normalizeLang(navigator.language));
    }
  }, [initial]);
  return (
    <select
      name={name}
      value={v}
      onChange={(e) => setV(e.target.value)}
      className="w-full rounded-lg border border-hairline bg-surface px-4 py-3 text-paper focus:border-emerald focus:outline-none"
    >
      {LANGS.map((l) => (
        <option key={l.code} value={l.code} className="bg-ink">
          {l.label}
        </option>
      ))}
    </select>
  );
}
