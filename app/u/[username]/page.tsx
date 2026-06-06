import { notFound } from "next/navigation";
import ProseCard from "@/components/ProseCard";
import { users, getUserByUsername, getPostsByUser } from "@/lib/mockData";

// Static export has no server, so pre-render the known profiles at build time.
export function generateStaticParams() {
  return users.map((u) => ({ username: u.username }));
}
export const dynamicParams = false;

export default function ProfilePage({ params }: { params: { username: string } }) {
  const user = getUserByUsername(params.username);
  if (!user) return notFound();
  const posts = getPostsByUser(user.id);

  return (
    <div>
      <div className="mb-8 border-b border-hairline pb-6">
        <h1 className="text-2xl font-bold">{user.displayName}</h1>
        <p className="text-sm text-ash">@{user.username}</p>
        {user.bio && <p className="mt-3 prose-body text-base">{user.bio}</p>}
        <p className="mt-3 text-xs text-ash">{posts.length} posts · no follower count, by design</p>
      </div>
      {posts.length === 0 ? (
        <p className="text-sm text-ash">nothing here yet.</p>
      ) : (
        posts.map((p) => <ProseCard key={p.id} post={p} />)
      )}
    </div>
  );
}
