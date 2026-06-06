import Link from "next/link";
import type { Post } from "@/lib/types";
import { getUser, timeAgo } from "@/lib/mockData";
import EngagementBar from "./EngagementBar";

export default function ProseCard({ post }: { post: Post }) {
  const author = getUser(post.authorId);
  return (
    <article className="border-b border-hairline py-8">
      <div className="mb-3 flex items-center gap-2 text-sm">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-xs font-bold text-ash">
          {author?.username.slice(0, 1).toUpperCase()}
        </span>
        <Link href={`/u/${author?.username}`} className="font-semibold text-paper hover:text-emerald">
          {author?.username}
        </Link>
        <span className="text-ash">·</span>
        <span className="text-ash">{timeAgo(post.createdAt)}</span>
      </div>

      {/* where the photo would be. there is no photo. that's the post. */}
      <p className="prose-body">{post.prose}</p>

      <EngagementBar replyCount={post.replies.length} />

      {post.replies.length > 0 && (
        <ul className="mt-4 space-y-3 border-l border-hairline pl-4">
          {post.replies.map((r) => {
            const ra = getUser(r.authorId);
            return (
              <li key={r.id} className="text-sm">
                <span className="text-ash">@{ra?.username} </span>
                <span className="text-paper">{r.body}</span>
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
}
