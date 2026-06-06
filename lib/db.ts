import { createClient } from "@/lib/supabase/server";

export type Author = { username: string; displayName: string | null };
export type Reply = { id: string; body: string; createdAt: string; author: Author };
export type FeedPost = {
  id: string;
  prose: string;
  createdAt: string;
  location: string | null;
  author: Author;
  replies: Reply[];
  likeCount: number;
  repostCount: number;
  liked: boolean;
  reposted: boolean;
};
export type Profile = {
  id: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
  isMe: boolean;
};

function one<T>(v: T | T[] | null | undefined): T | null {
  return Array.isArray(v) ? v[0] ?? null : v ?? null;
}
function author(raw: any): Author {
  const a = one<any>(raw);
  return { username: a?.username ?? "someone", displayName: a?.display_name ?? null };
}
function aggCount(raw: any): number {
  const a = one<any>(raw);
  return a?.count ?? 0;
}

const POST_SELECT =
  "id, prose, created_at, location, author:profiles(username, display_name), comments(id, body, created_at, author:profiles(username, display_name)), likes(count), reposts(count)";

function mapPost(row: any, myLikes: Set<string>, myReposts: Set<string>): FeedPost {
  return {
    id: row.id,
    prose: row.prose,
    createdAt: row.created_at,
    location: row.location ?? null,
    author: author(row.author),
    likeCount: aggCount(row.likes),
    repostCount: aggCount(row.reposts),
    liked: myLikes.has(row.id),
    reposted: myReposts.has(row.id),
    replies: (row.comments ?? [])
      .slice()
      .sort((a: any, b: any) => +new Date(a.created_at) - +new Date(b.created_at))
      .map((c: any) => ({ id: c.id, body: c.body, createdAt: c.created_at, author: author(c.author) })),
  };
}

async function myInteractions(ids: string[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || ids.length === 0) return { myLikes: new Set<string>(), myReposts: new Set<string>() };
  const [{ data: l }, { data: r }] = await Promise.all([
    supabase.from("likes").select("post_id").eq("user_id", user.id).in("post_id", ids),
    supabase.from("reposts").select("post_id").eq("user_id", user.id).in("post_id", ids),
  ]);
  return {
    myLikes: new Set((l ?? []).map((x: any) => x.post_id)),
    myReposts: new Set((r ?? []).map((x: any) => x.post_id)),
  };
}

export async function getFeed(): Promise<FeedPost[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error || !data) return [];
  const { myLikes, myReposts } = await myInteractions(data.map((r: any) => r.id));
  return data.map((row: any) => mapPost(row, myLikes, myReposts));
}

export async function getProfile(username: string): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data } = await supabase
    .from("profiles")
    .select("id, username, display_name, bio")
    .eq("username", username)
    .maybeSingle();
  if (!data) return null;

  const [{ count: followers }, { count: following }, mine] = await Promise.all([
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("following", data.id),
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower", data.id),
    user
      ? supabase.from("follows").select("follower").eq("follower", user.id).eq("following", data.id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return {
    id: data.id,
    username: data.username,
    displayName: data.display_name,
    bio: data.bio,
    followerCount: followers ?? 0,
    followingCount: following ?? 0,
    isFollowing: !!(mine as any)?.data,
    isMe: user?.id === data.id,
  };
}

export async function getPostsByAuthor(authorId: string): Promise<FeedPost[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("author", authorId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  const { myLikes, myReposts } = await myInteractions(data.map((r: any) => r.id));
  return data.map((row: any) => mapPost(row, myLikes, myReposts));
}

export async function getCurrentProfile(): Promise<{ id: string; username: string; displayName: string | null } | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .eq("id", user.id)
    .maybeSingle();
  if (!data) return null;
  return { id: data.id, username: data.username, displayName: data.display_name };
}
