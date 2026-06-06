"use client";

import { useState } from "react";
import { toggleLike } from "@/app/post/actions";

function Icon({ d, fill = "none" }: { d: string; fill?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={fill} stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const PATHS = {
  like: "M19.5 12.6 12 20l-7.5-7.4a4.6 4.6 0 0 1 6.5-6.5l1 1 1-1a4.6 4.6 0 0 1 6.5 6.5Z",
  comment: "M21 11.5a8.5 8.5 0 0 1-12.3 7.6L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5Z",
  share: "M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z",
};

export default function EngagementBar({
  postId, prose, likeCount, replyCount, liked,
}: {
  postId: string; prose: string; likeCount: number; replyCount: number; liked: boolean;
}) {
  const [l, setL] = useState(liked);
  const [lc, setLc] = useState(likeCount);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  async function like() {
    if (busy) return;
    const was = l;
    setL(!was); setLc(lc + (was ? -1 : 1)); setBusy(true);
    try { await toggleLike(postId, was); } catch { setL(was); setLc(lc); } finally { setBusy(false); }
  }

  async function share() {
    const url = `${window.location.origin}/p/${postId}`;
    const text = prose.length > 140 ? prose.slice(0, 140) + "…" : prose;
    if (navigator.share) {
      try { await navigator.share({ title: "UNSTAGRAM", text, url }); } catch { /* cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch { /* ignore */ }
    }
  }

  return (
    <div className="mt-4 flex items-center gap-6 text-sm text-ash">
      <button onClick={like} aria-label="like"
        className={"flex items-center gap-1.5 transition hover:text-paper " + (l ? "text-red-500" : "")}>
        <Icon d={PATHS.like} fill={l ? "currentColor" : "none"} />
        <span>{lc}</span>
      </button>

      <span className="flex items-center gap-1.5">
        <Icon d={PATHS.comment} />
        <span>{replyCount}</span>
      </span>

      <button onClick={share} aria-label="share" className="flex items-center gap-1.5 transition hover:text-paper">
        <Icon d={PATHS.share} />
        <span>{copied ? "link copied" : "share"}</span>
      </button>
    </div>
  );
}
