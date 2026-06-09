"use client";

import { useState } from "react";
import Link from "next/link";
import type { Reply } from "@/lib/db";
import { addReply } from "@/app/post/actions";
import CommentLike from "./CommentLike";

function Row({ c, threadId, onReply }: { c: Reply; threadId: string; onReply: (threadId: string, username: string) => void }) {
  return (
    <div className="text-sm">
      <Link href={`/u/${c.author.username}`} className="text-ash hover:text-emerald">@{c.author.username}</Link>{" "}
      <span className="text-paper">{c.body}</span>
      <div className="mt-0.5 flex items-center gap-3 text-[11px] text-ash">
        <CommentLike commentId={c.id} count={c.likeCount} liked={c.liked} />
        <button onClick={() => onReply(threadId, c.author.username)} className="hover:text-paper">reply</button>
      </div>
    </div>
  );
}

export default function CommentList({ replies, postId }: { replies: Reply[]; postId: string }) {
  const [open, setOpen] = useState<string | null>(null);
  const [prefill, setPrefill] = useState("");
  function onReply(threadId: string, username: string) { setOpen(threadId); setPrefill("@" + username + " "); }

  if (replies.length === 0) return null;
  return (
    <ul className="mt-4 space-y-3 border-l border-hairline pl-4">
      {replies.map((t) => (
        <li key={t.id} className="space-y-2">
          <Row c={t} threadId={t.id} onReply={onReply} />
          {t.children.length > 0 && (
            <div className="ml-4 space-y-2">
              {t.children.map((ch) => <Row key={ch.id} c={ch} threadId={t.id} onReply={onReply} />)}
            </div>
          )}
          {open === t.id && (
            <form key={t.id + prefill} action={addReply} className="ml-4 flex gap-2" onSubmit={() => setOpen(null)}>
              <input type="hidden" name="postId" value={postId} />
              <input type="hidden" name="parentId" value={t.id} />
              <input name="body" defaultValue={prefill} autoFocus maxLength={1080} placeholder="reply…"
                className="flex-1 rounded-full border border-hairline bg-surface px-3 py-1.5 text-sm text-paper placeholder:text-ash focus:border-emerald focus:outline-none" />
              <button className="rounded-full border border-hairline px-3 py-1.5 text-xs text-ash hover:text-paper">send</button>
            </form>
          )}
        </li>
      ))}
    </ul>
  );
}
