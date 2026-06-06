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
  language: string;
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
    .select("id, username, display_name, bio, language")
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
    language: data.language ?? "en",
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

export type ActivityItem = {
  id: string;
  type: "follow" | "like" | "repost" | "reply";
  actor: string;
  postId?: string;
  snippet?: string;
  createdAt: string;
};

export async function getActivity(): Promise<ActivityItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: myPosts } = await supabase.from("posts").select("id, prose").eq("author", user.id);
  const myPostIds = (myPosts ?? []).map((p: any) => p.id);
  const proseById = new Map<string, string>((myPosts ?? []).map((p: any) => [p.id, p.prose]));
  const noRows = Promise.resolve({ data: [] as any[] });

  const [follows, likes, reposts, comments] = await Promise.all([
    supabase.from("follows").select("follower, created_at").eq("following", user.id),
    myPostIds.length ? supabase.from("likes").select("user_id, post_id, created_at").in("post_id", myPostIds).neq("user_id", user.id) : noRows,
    myPostIds.length ? supabase.from("reposts").select("user_id, post_id, created_at").in("post_id", myPostIds).neq("user_id", user.id) : noRows,
    myPostIds.length ? supabase.from("comments").select("author, post_id, body, created_at").in("post_id", myPostIds).neq("author", user.id) : noRows,
  ]);

  const actorIds = new Set<string>();
  (follows.data ?? []).forEach((x: any) => actorIds.add(x.follower));
  (likes.data ?? []).forEach((x: any) => actorIds.add(x.user_id));
  (reposts.data ?? []).forEach((x: any) => actorIds.add(x.user_id));
  (comments.data ?? []).forEach((x: any) => actorIds.add(x.author));

  let nameById = new Map<string, string>();
  if (actorIds.size) {
    const { data: profs } = await supabase.from("profiles").select("id, username").in("id", Array.from(actorIds));
    nameById = new Map((profs ?? []).map((p: any) => [p.id, p.username]));
  }
  const snip = (id: string) => {
    const t = proseById.get(id) ?? "";
    return t.length > 70 ? t.slice(0, 70) + "…" : t;
  };
  const name = (id: string) => nameById.get(id) ?? "someone";

  const items: ActivityItem[] = [];
  for (const f of follows.data ?? [])
    items.push({ id: "f" + f.follower + f.created_at, type: "follow", actor: name(f.follower), createdAt: f.created_at });
  for (const l of likes.data ?? [])
    items.push({ id: "l" + l.user_id + l.post_id, type: "like", actor: name(l.user_id), postId: l.post_id, snippet: snip(l.post_id), createdAt: l.created_at });
  for (const r of reposts.data ?? [])
    items.push({ id: "r" + r.user_id + r.post_id, type: "repost", actor: name(r.user_id), postId: r.post_id, snippet: snip(r.post_id), createdAt: r.created_at });
  for (const c of comments.data ?? [])
    items.push({ id: "c" + c.author + c.post_id + c.created_at, type: "reply", actor: name(c.author), postId: c.post_id, snippet: c.body, createdAt: c.created_at });

  items.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  return items.slice(0, 60);
}

export async function getUnreadActivityCount(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data: prof } = await supabase.from("profiles").select("activity_seen_at").eq("id", user.id).maybeSingle();
  const seen = prof?.activity_seen_at ?? "1970-01-01T00:00:00Z";

  const { data: myPosts } = await supabase.from("posts").select("id").eq("author", user.id);
  const ids = (myPosts ?? []).map((p: any) => p.id);
  const head = { count: "exact" as const, head: true };
  const zero = Promise.resolve({ count: 0 });

  const [f, l, r, c] = await Promise.all([
    supabase.from("follows").select("*", head).eq("following", user.id).gt("created_at", seen),
    ids.length ? supabase.from("likes").select("*", head).in("post_id", ids).neq("user_id", user.id).gt("created_at", seen) : zero,
    ids.length ? supabase.from("reposts").select("*", head).in("post_id", ids).neq("user_id", user.id).gt("created_at", seen) : zero,
    ids.length ? supabase.from("comments").select("*", head).in("post_id", ids).neq("author", user.id).gt("created_at", seen) : zero,
  ]);
  return (f.count ?? 0) + (l.count ?? 0) + (r.count ?? 0) + (c.count ?? 0);
}

export async function markActivitySeen(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("profiles").update({ activity_seen_at: new Date().toISOString() }).eq("id", user.id);
}

export async function getCurrentProfile(): Promise<{ id: string; username: string; displayName: string | null; language: string } | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("id, username, display_name, language")
    .eq("id", user.id)
    .maybeSingle();
  if (!data) return null;
  return { id: data.id, username: data.username, displayName: data.display_name, language: data.language ?? "en" };
}
