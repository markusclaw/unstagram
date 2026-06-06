import { notFound } from "next/navigation";
import ProseCard from "@/components/ProseCard";
import { getProfile, getPostsByAuthor } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await getProfile(username);
  if (!profile) return notFound();
  const posts = await getPostsByAuthor(profile.id);

  return (
    <div>
      <div className="mb-8 border-b border-hairline pb-6">
        <h1 className="text-2xl font-bold">{profile.displayName ?? profile.username}</h1>
        <p className="text-sm text-ash">@{profile.username}</p>
        {profile.bio && <p className="mt-3 prose-body text-base">{profile.bio}</p>}
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
