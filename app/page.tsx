import StoriesRow from "@/components/StoriesRow";
import ProseCard from "@/components/ProseCard";
import { getFeed } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const feed = await getFeed();
  return (
    <div>
      <StoriesRow />
      <div className="mb-2 flex items-baseline justify-between">
        <h1 className="text-2xl font-bold">Feed</h1>
        <span className="text-xs text-ash">chronological. always.</span>
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
