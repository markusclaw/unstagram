import Link from "next/link";
import type { FeedPost } from "@/lib/db";

export default function PostTile({ post }: { post: FeedPost }) {
  return (
    <Link
      href={`/p/${post.id}`}
      className="flex aspect-square flex-col justify-between overflow-hidden rounded-sm border border-hairline bg-transparent p-2.5 transition hover:border-emerald"
    >
      <p dir="auto" className="font-serif text-[13px] leading-snug line-clamp-6 text-paper">{post.proseParts[0]}</p>
      <span className="mt-2 flex shrink-0 items-center justify-between text-[10px] text-ash"><span>♥ {post.likeCount} · {post.replies.length}</span>{post.proseParts.length > 1 && <span title="multiple">▦ {post.proseParts.length}</span>}</span>
    </Link>
  );
}
