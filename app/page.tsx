import StoriesRow from "@/components/StoriesRow";
import ProseCard from "@/components/ProseCard";
import { getFeed } from "@/lib/mockData";

export default function FeedPage() {
  const feed = getFeed();
  return (
    <div>
      <StoriesRow />
      <div className="mb-2 flex items-baseline justify-between">
        <h1 className="text-2xl font-bold">Feed</h1>
        <span className="text-xs text-ash">chronological. always.</span>
      </div>
      <p className="mb-2 text-sm text-ash">
        Everything below was a photo once. You'll just have to imagine it.
      </p>
      <div>
        {feed.map((post) => (
          <ProseCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
