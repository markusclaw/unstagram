import Link from "next/link";
import type { FeedPost } from "@/lib/db";

export default function PostTile({ post }: { post: FeedPost }) {
  return (
    <Link
      href={`/p/${post.id}`}
      className="flex aspect-square flex-col justify-between overflow-hidden rounded-sm border border-hairline bg-transparent p-2.5 transition hover:border-emerald"
    >
      <p dir="auto" className="font-serif text-[13px] leading-snug line-clamp-6 text-paper">{post.prose}</p>
      <span className="mt-2 shrink-0 text-[10px] text-ash">♥ {post.likeCount} · {post.replies.length}</span>
    </Link>
  );
}
