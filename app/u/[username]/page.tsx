import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostTile from "@/components/PostTile";
import FollowButton from "@/components/FollowButton";
import EditProfile from "@/components/EditProfile";
import { getProfile, getPostsByAuthor } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  const p = await getProfile(username);
  if (!p) return { title: "Profile" };
  const title = `${p.displayName ?? p.username} (@${p.username})`;
  const desc = p.bio || `@${p.username} on UNSTAGRAM — photos described in words.`;
  return {
    title, description: desc,
    alternates: { canonical: `/u/${username}` },
    openGraph: { type: "profile", title, description: desc, url: `/u/${username}` },
    twitter: { card: "summary", title, description: desc },
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await getProfile(username);
  if (!profile) return notFound();
  const posts = await getPostsByAuthor(profile.id);

  const ld = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: { "@type": "Person", name: profile.displayName ?? profile.username, alternateName: "@" + profile.username, description: profile.bio ?? undefined },
  };
  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div className="mb-6 border-b border-hairline pb-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{profile.displayName ?? profile.username}{profile.private && <span className="ml-2 align-middle text-sm text-ash">🔒 private</span>}</h1>
            <p className="text-sm text-ash">@{profile.username}</p>
          </div>
          {profile.isMe ? (
            <EditProfile username={profile.username} displayName={profile.displayName} bio={profile.bio} language={profile.language} isPrivate={profile.private} />
          ) : (
            <FollowButton targetId={profile.id} isFollowing={profile.isFollowing} followerCount={profile.followerCount} />
          )}
        </div>

        {profile.bio && <p className="mt-3 text-sm leading-relaxed text-paper">{profile.bio}</p>}

        <div className="mt-4 flex gap-6 text-sm">
          <span><span className="font-semibold text-paper">{posts.length}</span> <span className="text-ash">posts</span></span>
          <span><span className="font-semibold text-paper">{profile.followerCount}</span> <span className="text-ash">followers</span></span>
          <span><span className="font-semibold text-paper">{profile.followingCount}</span> <span className="text-ash">following</span></span>
        </div>
      </div>

      {posts.length === 0 ? (
        <p className="text-sm text-ash">nothing here yet.</p>
      ) : (
        <div className="grid grid-cols-3 gap-1">
          {posts.map((p) => <PostTile key={p.id} post={p} />)}
        </div>
      )}
    </div>
  );
}
