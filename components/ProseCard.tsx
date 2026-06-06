import Link from "next/link";
import type { FeedPost } from "@/lib/db";
import { timeAgo } from "@/lib/format";
import EngagementBar from "./EngagementBar";
import { addReply } from "@/app/post/actions";
import ReportButton from "./ReportButton";

function PinIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block -mt-0.5">
      <path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

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
        <span className="ml-auto"><ReportButton postId={post.id} /></span>
      </div>

      {/* where the photo would be. there is no photo. that's the post. */}
      <p dir="auto" className="prose-body">{post.prose}</p>

      {post.location && (
        <p className="mt-2 text-xs text-ash">
          <PinIcon /> {post.location}
        </p>
      )}

      <EngagementBar
        postId={post.id}
        likeCount={post.likeCount}
        repostCount={post.repostCount}
        replyCount={post.replies.length}
        liked={post.liked}
        reposted={post.reposted}
      />

      {post.replies.length > 0 && (
        <ul className="mt-4 space-y-3 border-l border-hairline pl-4">
          {post.replies.map((r) => (
            <li key={r.id} className="text-sm">
              <Link href={`/u/${r.author.username}`} className="text-ash hover:text-emerald">@{r.author.username}</Link>{" "}
              <span className="text-paper">{r.body}</span>
            </li>
          ))}
        </ul>
      )}

      <form action={addReply} className="mt-4 flex gap-2">
        <input type="hidden" name="postId" value={post.id} />
        <input name="body" required maxLength={720} placeholder="reply in words…"
          className="flex-1 rounded-full border border-hairline bg-surface px-4 py-2 text-sm text-paper placeholder:text-ash focus:border-emerald focus:outline-none" />
        <button className="rounded-full border border-hairline px-4 py-2 text-sm text-ash hover:text-paper">send</button>
      </form>
    </article>
  );
}
