"use client";

import { useState } from "react";
import { resendConfirmation } from "@/app/auth/actions";

export default function ResendConfirm({ email = "" }: { email?: string }) {
  const [v, setV] = useState(email);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function go() {
    if (!v || busy) return;
    setBusy(true);
    const r = await resendConfirmation(v);
    setBusy(false);
    setMsg(r?.error ?? "Sent — check your inbox (and spam).");
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-ash">
      <span>didn&apos;t get it?</span>
      <input value={v} onChange={(e) => setV(e.target.value)} placeholder="your email"
        className="flex-1 rounded-md border border-hairline bg-surface px-2 py-1 text-xs text-paper placeholder:text-ash focus:border-emerald focus:outline-none" />
      <button onClick={go} disabled={busy} className="text-emerald hover:underline disabled:opacity-60">
        {busy ? "sending…" : "resend"}
      </button>
      {msg && <span className="w-full text-ash">{msg}</span>}
    </div>
  );
}
