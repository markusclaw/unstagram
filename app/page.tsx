import StoriesBar from "@/components/StoriesBar";
import ProseCard from "@/components/ProseCard";
import Link from "next/link";
import { getFeed } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort } = await searchParams;
  const mode = sort === "new" ? "new" : "hot";
  const feed = await getFeed(mode);

  const tab = (href: string, label: string, active: boolean) => (
    <Link href={href} className={"text-sm " + (active ? "font-semibold text-paper" : "text-ash hover:text-paper")}>
      {label}
    </Link>
  );

  return (
    <div>
      <StoriesBar />
      <div className="mb-2 flex items-baseline gap-4">
        <h1 className="text-2xl font-bold">Feed</h1>
        <span className="ml-auto flex gap-4">
          {tab("/", "For you", mode === "hot")}
          {tab("/?sort=new", "Latest", mode === "new")}
        </span>
      </div>
      <p className="mb-2 text-sm text-ash">Everything below was a photo once. You'll just have to imagine it.</p>

      {feed.length === 0 ? (
        <p className="py-12 text-sm text-ash">
          Nothing here yet. <a href="/compose" className="text-emerald hover:underline">Describe something →</a>
        </p>
      ) : (
        <div>{feed.map((post) => <ProseCard key={post.id} post={post} />)}</div>
      )}
    </div>
  );
}
