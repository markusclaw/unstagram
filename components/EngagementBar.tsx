"use client";

import { useState } from "react";

function Btn({ d, label, disabled, onClick }: {
  d: string; label: string; disabled?: boolean; onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={disabled ? "we removed this. on purpose." : label}
      aria-label={label}
      className={
        "transition " +
        (disabled ? "cursor-not-allowed text-hairline" : "text-paper hover:text-emerald")
      }
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d={d} />
      </svg>
    </button>
  );
}

const PATHS = {
  like: "M19.5 12.6 12 20l-7.5-7.4a4.6 4.6 0 0 1 6.5-6.5l1 1 1-1a4.6 4.6 0 0 1 6.5 6.5Z",
  comment: "M21 11.5a8.5 8.5 0 0 1-12.3 7.6L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5Z",
  share: "M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z",
  save: "M6 3h12v18l-6-4-6 4z",
};

export default function EngagementBar({ replyCount }: { replyCount: number }) {
  const [poked, setPoked] = useState(false);
  return (
    <div className="mt-4">
      <div className="flex items-center gap-5">
        <Btn d={PATHS.like} label="like" disabled />
        <Btn d={PATHS.comment} label="reply" onClick={() => setPoked(true)} />
        <Btn d={PATHS.share} label="share" disabled />
        <span className="ml-auto" />
        <Btn d={PATHS.save} label="save" disabled />
      </div>
      <p className="mt-2 text-xs italic text-ash">
        {poked
          ? "scroll down to reply in words. that's the only button that works."
          : "no likes. no shares. no counts. on purpose."}
      </p>
      <p className="mt-0.5 text-xs text-ash">
        {replyCount} {replyCount === 1 ? "reply" : "replies"}
      </p>
    </div>
  );
}
