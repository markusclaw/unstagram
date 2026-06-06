import Link from "next/link";
import type { FeedPost } from "@/lib/db";
import { timeAgo } from "@/lib/format";
import EngagementBar from "./EngagementBar";
import { addReply } from "@/app/post/actions";

export default function ProseCard({ post }: { post: FeedPost }) {
  return (
    <article className="border-b border-hairline py-8">
      <div className="mb-3 flex items-center gap-2 text-sm">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-xs font-bold text-ash">
          {post.author.username.slice(0, 1).toUpperCase()}
        </span>
        <Link href={`/u/${post.author.username}`} className="font-semibold text-paper hover:text-emerald">
          {post.author.username}
        </Link>
        <span className="text-ash">·</span>
        <span className="text-ash">{timeAgo(post.createdAt)}</span>
      </div>

      {/* where the photo would be. there is no photo. that's the post. */}
      <p className="prose-body">{post.prose}</p>

      <EngagementBar replyCount={post.replies.length} />

      {post.replies.length > 0 && (
        <ul className="mt-4 space-y-3 border-l border-hairline pl-4">
          {post.replies.map((r) => (
            <li key={r.id} className="text-sm">
              <span className="text-ash">@{r.author.username} </span>
              <span className="text-paper">{r.body}</span>
            </li>
          ))}
        </ul>
      )}

      <form action={addReply} className="mt-4 flex gap-2">
        <input type="hidden" name="postId" value={post.id} />
        <input
          name="body"
          required
          placeholder="reply in words…"
          className="flex-1 rounded-full border border-hairline bg-surface px-4 py-2 text-sm text-paper placeholder:text-ash focus:border-emerald focus:outline-none"
        />
        <button className="rounded-full border border-hairline px-4 py-2 text-sm text-ash hover:text-paper">
          send
        </button>
      </form>
    </article>
  );
}
