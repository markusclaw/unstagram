"use client";

import { useState } from "react";
import { toggleLike, toggleRepost } from "@/app/post/actions";

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
  share: "M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3",
};

export default function EngagementBar({
  postId, likeCount, repostCount, replyCount, liked, reposted,
}: {
  postId: string; likeCount: number; repostCount: number; replyCount: number; liked: boolean; reposted: boolean;
}) {
  const [l, setL] = useState(liked);
  const [lc, setLc] = useState(likeCount);
  const [r, setR] = useState(reposted);
  const [rc, setRc] = useState(repostCount);
  const [busy, setBusy] = useState(false);

  async function like() {
    if (busy) return;
    const was = l;
    setL(!was); setLc(lc + (was ? -1 : 1)); setBusy(true);
    try { await toggleLike(postId, was); } catch { setL(was); setLc(lc); } finally { setBusy(false); }
  }
  async function repost() {
    if (busy) return;
    const was = r;
    setR(!was); setRc(rc + (was ? -1 : 1)); setBusy(true);
    try { await toggleRepost(postId, was); } catch { setR(was); setRc(rc); } finally { setBusy(false); }
  }

  return (
    <div className="mt-4 flex items-center gap-6 text-sm text-ash">
      <button onClick={like} aria-label="like"
        className={"flex items-center gap-1.5 transition hover:text-paper " + (l ? "text-emerald" : "")}>
        <Icon d={PATHS.like} fill={l ? "currentColor" : "none"} />
        <span>{lc}</span>
      </button>

      <span className="flex items-center gap-1.5">
        <Icon d={PATHS.comment} />
        <span>{replyCount}</span>
      </span>

      <button onClick={repost} aria-label="share"
        className={"flex items-center gap-1.5 transition hover:text-paper " + (r ? "text-emerald" : "")}>
        <Icon d={PATHS.share} />
        <span>{rc}</span>
      </button>
    </div>
  );
}
