"use client";

import { useState } from "react";
import { toggleCommentLike } from "@/app/post/actions";

export default function CommentLike({ commentId, count, liked }: { commentId: string; count: number; liked: boolean }) {
  const [l, setL] = useState(liked);
  const [c, setC] = useState(count);
  const [busy, setBusy] = useState(false);
  async function go() {
    if (busy) return;
    const was = l;
    setL(!was); setC(c + (was ? -1 : 1)); setBusy(true);
    try { await toggleCommentLike(commentId, was); } catch { setL(was); setC(c); } finally { setBusy(false); }
  }
  return (
    <button onClick={go} className={"flex items-center gap-1 " + (l ? "text-red-500" : "text-ash hover:text-paper")} aria-label="like comment">
      <svg width="12" height="12" viewBox="0 0 24 24" fill={l ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <path d="M19.5 12.6 12 20l-7.5-7.4a4.6 4.6 0 0 1 6.5-6.5l1 1 1-1a4.6 4.6 0 0 1 6.5 6.5Z" />
      </svg>
      {c > 0 && <span>{c}</span>}
    </button>
  );
}
