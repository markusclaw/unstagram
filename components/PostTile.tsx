import Link from "next/link";
import type { FeedPost } from "@/lib/db";

export default function PostTile({ post }: { post: FeedPost }) {
  return (
    <Link
      href={`/p/${post.id}`}
      className="flex aspect-square flex-col justify-between overflow-hidden rounded-sm border border-hairline bg-surface p-3 transition hover:border-emerald"
    >
      <p className="prose-body line-clamp-5 text-[13px] leading-snug">{post.prose}</p>
      <span className="mt-2 shrink-0 text-[11px] text-ash">♥ {post.likeCount} · {post.replies.length}</span>
    </Link>
  );
}
