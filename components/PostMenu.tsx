"use client";

import { useState } from "react";
import { reportPost } from "@/app/post/actions";

export default function PostMenu({ postId }: { postId: string }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");

  async function copy() {
    try { await navigator.clipboard.writeText(`${window.location.origin}/p/${postId}`); setNote("link copied"); } catch {}
    setOpen(false);
    setTimeout(() => setNote(""), 1500);
  }
  async function report() {
    try { await reportPost(postId); } finally { setNote("reported — thanks"); setOpen(false); setTimeout(() => setNote(""), 2000); }
  }

  return (
    <div className="relative flex items-center">
      {note && <span className="mr-2 text-xs text-ash">{note}</span>}
      <button onClick={() => setOpen((o) => !o)} aria-label="more options" className="px-1 text-ash hover:text-paper">⋯</button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-6 z-20 w-36 overflow-hidden rounded-lg border border-hairline bg-ink text-sm shadow-lg">
            <button onClick={copy} className="block w-full px-3 py-2 text-left text-paper hover:bg-surface">Copy link</button>
            <button onClick={report} className="block w-full px-3 py-2 text-left text-red-400 hover:bg-surface">Report</button>
          </div>
        </>
      )}
    </div>
  );
}
