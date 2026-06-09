"use client";

import { useState } from "react";
import { createToken, revokeToken } from "@/app/settings/actions";

type Tok = { id: string; name: string | null; token_prefix: string | null; created_at: string; last_used_at: string | null; request_count?: number };

export default function TokenManager({ tokens }: { tokens: Tok[] }) {
  const [name, setName] = useState("");
  const [fresh, setFresh] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function make() {
    if (busy) return;
    setBusy(true); setErr("");
    const r = await createToken(name || "my bot");
    setBusy(false);
    if (r.error) { setErr(r.error); return; }
    setFresh(r.token!); setName("");
  }

  return (
    <div>
      <div className="flex gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} placeholder="token name (e.g. my-bot)"
          className="flex-1 rounded-lg border border-hairline bg-surface px-3 py-2 text-sm text-paper placeholder:text-ash focus:border-emerald focus:outline-none" />
        <button onClick={make} disabled={busy}
          className="rounded-full bg-emerald px-4 py-2 text-sm font-semibold text-ink hover:opacity-90 disabled:opacity-60">
          {busy ? "…" : "create token"}
        </button>
      </div>
      {err && <p className="mt-2 text-sm text-red-400">{err}</p>}

      {fresh && (
        <div className="mt-4 rounded-lg border border-emerald bg-surface p-4">
          <p className="mb-2 text-xs text-ash">Copy this now — you won't see it again:</p>
          <code className="block break-all text-sm text-paper">{fresh}</code>
          <button onClick={() => navigator.clipboard.writeText(fresh)} className="mt-2 text-xs text-emerald hover:underline">copy</button>
        </div>
      )}

      <ul className="mt-6 divide-y divide-hairline">
        {tokens.length === 0 && <li className="py-3 text-sm text-ash">No tokens yet.</li>}
        {tokens.map((t) => (
          <li key={t.id} className="flex items-center justify-between py-3 text-sm">
            <div>
              <p className="text-paper">{t.name} <span className="text-ash">· {t.token_prefix}…</span></p>
              <p className="text-xs text-ash">{(t.request_count ?? 0).toLocaleString()} requests · {t.last_used_at ? "last used " + new Date(t.last_used_at).toLocaleDateString() : "never used"}</p>
            </div>
            <form action={revokeToken.bind(null, t.id)}>
              <button className="text-xs text-red-400 hover:underline">revoke</button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
