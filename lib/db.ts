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

// Plain columns + comments only — no aggregate embeds (those were failing).
const POST_SELECT =
  "id, prose, created_at, location, author:profiles!posts_author_fkey(username, display_name), comments(id, body, created_at, author:profiles!comments_author_fkey(username, display_name))";

type Tally = {
  like: Record<string, number>;
  repost: Record<string, number>;
  myLikes: Set<string>;
  myReposts: Set<string>;
};

async function tally(ids: string[], meId?: string): Promise<Tally> {
  const empty: Tally = { like: {}, repost: {}, myLikes: new Set(), myReposts: new Set() };
  if (ids.length === 0) return empty;
  const supabase = await createClient();
  const [{ data: likes }, { data: reposts }] = await Promise.all([
    supabase.from("likes").select("post_id, user_id").in("post_id", ids),
    supabase.from("reposts").select("post_id, user_id").in("post_id", ids),
  ]);
  const t: Tally = { like: {}, repost: {}, myLikes: new Set(), myReposts: new Set() };
  for (const x of likes ?? []) {
    t.like[x.post_id] = (t.like[x.post_id] ?? 0) + 1;
    if (meId && x.user_id === meId) t.myLikes.add(x.post_id);
  }
  for (const x of reposts ?? []) {
    t.repost[x.post_id] = (t.repost[x.post_id] ?? 0) + 1;
    if (meId && x.user_id === meId) t.myReposts.add(x.post_id);
  }
  return t;
}

function mapPost(row: any, t: Tally): FeedPost {
  return {
    id: row.id,
    prose: row.prose,
    createdAt: row.created_at,
    location: row.location ?? null,
    author: author(row.author),
    likeCount: t.like[row.id] ?? 0,
    repostCount: t.repost[row.id] ?? 0,
    liked: t.myLikes.has(row.id),
    reposted: t.myReposts.has(row.id),
    replies: (row.comments ?? [])
      .slice()
      .sort((a: any, b: any) => +new Date(a.created_at) - +new Date(b.created_at))
      .map((c: any) => ({ id: c.id, body: c.body, createdAt: c.created_at, author: author(c.author) })),
  };
}

export async function getFeed(): Promise<FeedPost[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) console.error("getFeed error:", error.message);
  if (error || !data) return [];
  const t = await tally(data.map((r: any) => r.id), user?.id);
  return data.map((row: any) => mapPost(row, t));
}

export async function getPostsByAuthor(authorId: string): Promise<FeedPost[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("author", authorId)
    .order("created_at", { ascending: false });
  if (error) console.error("getPostsByAuthor error:", error.message);
  if (error || !data) return [];
  const t = await tally(data.map((r: any) => r.id), user?.id);
  return data.map((row: any) => mapPost(row, t));
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


export async function getPost(id: string): Promise<FeedPost | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase.from("posts").select(POST_SELECT).eq("id", id).maybeSingle();
  if (error) console.error("getPost error:", error.message);
  if (!data) return null;
  const t = await tally([data.id], user?.id);
  return mapPost(data, t);
}

export type StoryGroup = { username: string; displayName: string | null; lines: string[] };

export async function getActiveStories(): Promise<StoryGroup[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stories")
    .select("id, body, created_at, author:profiles!stories_author_fkey(username, display_name)")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: true });
  if (error) console.error("getActiveStories error:", error.message);
  if (!data) return [];
  const map = new Map<string, StoryGroup>();
  for (const row of data as any[]) {
    const a = author(row.author);
    const g = map.get(a.username) ?? { username: a.username, displayName: a.displayName, lines: [] };
    g.lines.push(row.body);
    map.set(a.username, g);
  }
  return Array.from(map.values());
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
