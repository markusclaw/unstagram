"use client";

import { useState } from "react";
import { reportPost } from "@/app/post/actions";

export default function ReportButton({ postId }: { postId: string }) {
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  if (done) return <span className="text-xs text-ash">reported — thanks</span>;

  return (
    <button
      onClick={async () => {
        if (busy) return;
        setBusy(true);
        try {
          await reportPost(postId);
        } finally {
          setDone(true);
          setBusy(false);
        }
      }}
      disabled={busy}
      className="text-xs text-ash hover:text-paper"
      aria-label="report this post"
    >
      {busy ? "…" : "report"}
    </button>
  );
}
