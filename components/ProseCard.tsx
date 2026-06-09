import Link from "next/link";
import type { FeedPost } from "@/lib/db";
import { timeAgo } from "@/lib/format";
import PostBody from "./PostBody";
import Caption from "./Caption";
import CommentList from "./CommentList";
import { addReply } from "@/app/post/actions";
import PostMenu from "./PostMenu";

function PinIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block -mt-0.5">
      <path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export default function ProseCard({ post, detail = false }: { post: FeedPost; detail?: boolean }) {
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
        <span className="ml-auto"><PostMenu postId={post.id} /></span>
      </div>

      {post.location && <p className="mb-3 -mt-1 text-xs text-ash"><PinIcon /> {post.location}</p>}

      <PostBody postId={post.id} parts={post.proseParts} likeCount={post.likeCount} replyCount={post.replyCount} liked={post.liked} />

      {post.caption && <Caption text={post.caption} />}


      <CommentList replies={post.replies} postId={post.id} total={post.replyCount} detail={detail} />

      <form action={addReply} className="mt-4 flex gap-2">
        <input type="hidden" name="postId" value={post.id} />
        <input name="body" required maxLength={1080} placeholder="add a comment…"
          className="flex-1 rounded-full border border-hairline bg-surface px-4 py-2 text-sm text-paper placeholder:text-ash focus:border-emerald focus:outline-none" />
        <button className="rounded-full border border-hairline px-4 py-2 text-sm text-ash hover:text-paper">send</button>
      </form>
    </article>
  );
}
