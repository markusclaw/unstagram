"use client";

import { useState } from "react";
import { toggleFollow } from "@/app/profile/actions";

export default function FollowButton({
  targetId, isFollowing, followerCount,
}: {
  targetId: string; isFollowing: boolean; followerCount: number;
}) {
  const [f, setF] = useState(isFollowing);
  const [fc, setFc] = useState(followerCount);
  const [busy, setBusy] = useState(false);

  async function go() {
    if (busy) return;
    const was = f;
    setF(!was); setFc(fc + (was ? -1 : 1)); setBusy(true);
    try { await toggleFollow(targetId, was); } catch { setF(was); setFc(fc); } finally { setBusy(false); }
  }

  return (
    <button onClick={go} disabled={busy}
      className={
        "rounded-full px-5 py-1.5 text-sm font-semibold transition disabled:opacity-60 " +
        (f ? "border border-hairline text-ash hover:text-paper" : "bg-emerald text-ink hover:opacity-90")
      }>
      {f ? "following" : "follow"}
    </button>
  );
}
