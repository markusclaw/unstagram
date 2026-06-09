"use client";

import { useRef, useState } from "react";
import { toggleLike } from "@/app/post/actions";

function Icon({ d, fill = "none", size = 22 }: { d: string; fill?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}
const P = {
  like: "M19.5 12.6 12 20l-7.5-7.4a4.6 4.6 0 0 1 6.5-6.5l1 1 1-1a4.6 4.6 0 0 1 6.5 6.5Z",
  comment: "M21 11.5a8.5 8.5 0 0 1-12.3 7.6L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5Z",
  share: "M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z",
};

export default function PostBody({
  postId, parts, likeCount, replyCount, liked,
}: {
  postId: string; parts: string[]; likeCount: number; replyCount: number; liked: boolean;
}) {
  const [l, setL] = useState(liked);
  const [lc, setLc] = useState(likeCount);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [idx, setIdx] = useState(0);
  const [pop, setPop] = useState(0);
  const lastTap = useRef(0);
  const multi = parts.length > 1;

  function toggle() {
    const was = l;
    setL(!was); setLc(lc + (was ? -1 : 1)); setBusy(true);
    toggleLike(postId, was).catch(() => { setL(was); setLc(lc); }).finally(() => setBusy(false));
  }

  function doubleTapLike() {
    setPop((n) => n + 1);
    if (!l) {
      setL(true); setLc(lc + 1);
      toggleLike(postId, false).catch(() => {});
    }
  }

  function onTap() {
    const now = Date.now();
    if (now - lastTap.current < 350) {
      lastTap.current = 0;
      doubleTapLike();
    } else {
      lastTap.current = now;
    }
  }

  async function share() {
    const url = `${window.location.origin}/p/${postId}`;
    const text = parts.join(" — ").slice(0, 140);
    if (navigator.share) {
      try { await navigator.share({ title: "UNSTAGRAM", text, url }); } catch {}
    } else {
      try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
    }
  }

  return (
    <div>
      <div className="relative select-none" onClick={onTap}>
        <p dir="auto" className="prose-body">{parts[idx]}</p>

        {pop > 0 && (
          <div key={pop} className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="heart-pop text-red-500">
              <Icon d={P.like} fill="currentColor" size={72} />
            </span>
          </div>
        )}
      </div>

      {multi && (
        <div className="mt-3 flex items-center gap-3">
          <button onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0}
            className="text-ash hover:text-paper disabled:opacity-30" aria-label="previous">‹</button>
          <div className="flex gap-1.5">
            {parts.map((_, i) => (
              <span key={i} className={"h-1.5 w-1.5 rounded-full " + (i === idx ? "bg-emerald" : "bg-hairline")} />
            ))}
          </div>
          <button onClick={() => setIdx((i) => Math.min(parts.length - 1, i + 1))} disabled={idx === parts.length - 1}
            className="text-ash hover:text-paper disabled:opacity-30" aria-label="next">›</button>
          <span className="ml-1 text-[11px] text-ash">{idx + 1}/{parts.length}</span>
        </div>
      )}

      <div className="mt-4 flex items-center gap-6 text-sm text-ash">
        <button onClick={toggle} aria-label="like"
          className={"flex items-center gap-1.5 transition hover:text-paper " + (l ? "text-red-500" : "")}>
          <Icon d={P.like} fill={l ? "currentColor" : "none"} />
          <span>{lc}</span>
        </button>
        <span className="flex items-center gap-1.5"><Icon d={P.comment} /><span>{replyCount}</span></span>
        <button onClick={share} aria-label="share" className="flex items-center gap-1.5 transition hover:text-paper">
          <Icon d={P.share} /><span>{copied ? "link copied" : "share"}</span>
        </button>
      </div>
    </div>
  );
}
