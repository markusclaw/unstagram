import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type Author = { username: string; displayName: string | null };
export type Reply = {
  id: string;
  body: string;
  createdAt: string;
  author: Author;
  likeCount: number;
  liked: boolean;
  children: Reply[];
};
export type FeedPost = {
  id: string;
  prose: string;
  proseParts: string[];
  caption: string | null;
  createdAt: string;
  location: string | null;
  author: Author;
  replies: Reply[];
  replyCount: number;
  likeCount: number;
  liked: boolean;
};
export type Profile = {
  id: string; username: string; displayName: string | null; bio: string | null;
  language: string; private: boolean; followerCount: number; followingCount: number; isFollowing: boolean; isMe: boolean;
};

function one<T>(v: T | T[] | null | undefined): T | null {
  return Array.isArray(v) ? v[0] ?? null : v ?? null;
}
function author(raw: any): Author {
  const a = one<any>(raw);
  return { username: a?.username ?? "someone", displayName: a?.display_name ?? null };
}

const POST_SELECT =
  "id, prose, prose_parts, caption, created_at, location, author:profiles!posts_author_fkey(username, display_name), comments(id, body, parent_id, created_at, author:profiles!comments_author_fkey(username, display_name))";

type LikeTally = { like: Record<string, number>; myLikes: Set<string> };
type CommentTally = { count: Record<string, number>; mine: Set<string> };

async function tally(ids: string[], meId?: string): Promise<LikeTally> {
  if (ids.length === 0) return { like: {}, myLikes: new Set() };
  const supabase = await createClient();
  const { data } = await supabase.from("likes").select("post_id, user_id").in("post_id", ids);
  const t: LikeTally = { like: {}, myLikes: new Set() };
  for (const x of data ?? []) {
    t.like[x.post_id] = (t.like[x.post_id] ?? 0) + 1;
    if (meId && x.user_id === meId) t.myLikes.add(x.post_id);
  }
  return t;
}

async function commentTally(ids: string[], meId?: string): Promise<CommentTally> {
  if (ids.length === 0) return { count: {}, mine: new Set() };
  const supabase = await createClient();
  const { data } = await supabase.from("comment_likes").select("comment_id, user_id").in("comment_id", ids);
  const t: CommentTally = { count: {}, mine: new Set() };
  for (const x of data ?? []) {
    t.count[x.comment_id] = (t.count[x.comment_id] ?? 0) + 1;
    if (meId && x.user_id === meId) t.mine.add(x.comment_id);
  }
  return t;
}

function mapPost(row: any, t: LikeTally, ct: CommentTally): FeedPost {
  const parts = Array.isArray(row.prose_parts) && row.prose_parts.length ? row.prose_parts : [row.prose];
  const comments: any[] = (row.comments ?? []).slice().sort((a: any, b: any) => +new Date(a.created_at) - +new Date(b.created_at));
  const toReply = (c: any): Reply => ({
    id: c.id, body: c.body, createdAt: c.created_at, author: author(c.author),
    likeCount: ct.count[c.id] ?? 0, liked: ct.mine.has(c.id),
    children: comments.filter((x) => x.parent_id === c.id).map((x) => ({
      id: x.id, body: x.body, createdAt: x.created_at, author: author(x.author),
      likeCount: ct.count[x.id] ?? 0, liked: ct.mine.has(x.id), children: [],
    })),
  });
  const tops = comments.filter((c) => !c.parent_id).map(toReply);
  return {
    id: row.id, prose: row.prose, proseParts: parts, caption: row.caption ?? null,
    createdAt: row.created_at, location: row.location ?? null, author: author(row.author),
    replies: tops, replyCount: comments.length,
    likeCount: t.like[row.id] ?? 0, liked: t.myLikes.has(row.id),
  };
}

async function mapRows(rows: any[], meId?: string): Promise<FeedPost[]> {
  const t = await tally(rows.map((r) => r.id), meId);
  const cids = rows.flatMap((r) => (r.comments ?? []).map((c: any) => c.id));
  const ct = await commentTally(cids, meId);
  return rows.map((r) => mapPost(r, t, ct));
}

async function uid(): Promise<string | undefined> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id;
}

function hotScore(p: FeedPost): number {
  const hours = (Date.now() - +new Date(p.createdAt)) / 3_600_000;
  const engagement = p.likeCount + 2 * p.replyCount;
  return (engagement + 1) / Math.pow(hours + 2, 1.5);
}

export async function getFeed(sort: "hot" | "new" = "hot"): Promise<FeedPost[]> {
  const supabase = await createClient();
  const meId = await uid();
  const { data, error } = await supabase.from("posts").select(POST_SELECT).order("created_at", { ascending: false }).limit(100);
  if (error) console.error("getFeed error:", error.message);
  if (!data) return [];
  const posts = await mapRows(data, meId);
  if (sort === "new") return posts; // already newest-first
  return posts.sort((a, b) => hotScore(b) - hotScore(a));
}

export async function getPostsByAuthor(authorId: string): Promise<FeedPost[]> {
  const supabase = await createClient();
  const meId = await uid();
  const { data, error } = await supabase.from("posts").select(POST_SELECT).eq("author", authorId).order("created_at", { ascending: false });
  if (error) console.error("getPostsByAuthor error:", error.message);
  if (!data) return [];
  return mapRows(data, meId);
}

export const getPost = cache(async function getPost(id: string): Promise<FeedPost | null> {
  const supabase = await createClient();
  const meId = await uid();
  const { data, error } = await supabase.from("posts").select(POST_SELECT).eq("id", id).maybeSingle();
  if (error) console.error("getPost error:", error.message);
  if (!data) return null;
  return (await mapRows([data], meId))[0] ?? null;
});

export async function searchProfiles(q: string): Promise<{ username: string; displayName: string | null }[]> {
  const safe = q.replace(/[%,()*]/g, " ").trim();
  if (!safe) return [];
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("username, display_name")
    .or(`username.ilike.%${safe}%,display_name.ilike.%${safe}%`).limit(20);
  return (data ?? []).map((p: any) => ({ username: p.username, displayName: p.display_name }));
}

export async function searchPosts(q: string): Promise<FeedPost[]> {
  const safe = q.replace(/[%,()*]/g, " ").trim();
  if (!safe) return [];
  const supabase = await createClient();
  const meId = await uid();
  const { data, error } = await supabase.from("posts").select(POST_SELECT)
    .or(`prose.ilike.%${safe}%,caption.ilike.%${safe}%,location.ilike.%${safe}%`)
    .order("created_at", { ascending: false }).limit(50);
  if (error) console.error("searchPosts error:", error.message);
  if (!data) return [];
  return mapRows(data, meId);
}

export const getProfile = cache(async function getProfile(username: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data } = await supabase.from("profiles").select("id, username, display_name, bio, language, private").eq("username", username).maybeSingle();
  if (!data) return null;
  const [{ count: followers }, { count: following }, mine] = await Promise.all([
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("following", data.id),
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower", data.id),
    user ? supabase.from("follows").select("follower").eq("follower", user.id).eq("following", data.id).maybeSingle() : Promise.resolve({ data: null }),
  ]);
  return {
    id: data.id, username: data.username, displayName: data.display_name, bio: data.bio,
    language: data.language ?? "en", private: !!data.private, followerCount: followers ?? 0, followingCount: following ?? 0,
    isFollowing: !!(mine as any)?.data, isMe: user?.id === data.id,
  };
});

export type ActivityItem = { id: string; type: "follow" | "like" | "repost" | "reply"; actor: string; postId?: string; snippet?: string; createdAt: string };

export async function getActivity(): Promise<ActivityItem[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data: myPosts } = await supabase.from("posts").select("id, prose").eq("author", user.id);
  const myPostIds = (myPosts ?? []).map((p: any) => p.id);
  const proseById = new Map<string, string>((myPosts ?? []).map((p: any) => [p.id, p.prose]));
  const noRows = Promise.resolve({ data: [] as any[] });
  const [follows, likes, comments] = await Promise.all([
    supabase.from("follows").select("follower, created_at").eq("following", user.id),
    myPostIds.length ? supabase.from("likes").select("user_id, post_id, created_at").in("post_id", myPostIds).neq("user_id", user.id) : noRows,
    myPostIds.length ? supabase.from("comments").select("author, post_id, body, created_at").in("post_id", myPostIds).neq("author", user.id) : noRows,
  ]);
  const actorIds = new Set<string>();
  (follows.data ?? []).forEach((x: any) => actorIds.add(x.follower));
  (likes.data ?? []).forEach((x: any) => actorIds.add(x.user_id));
  (comments.data ?? []).forEach((x: any) => actorIds.add(x.author));
  let nameById = new Map<string, string>();
  if (actorIds.size) {
    const { data: profs } = await supabase.from("profiles").select("id, username").in("id", Array.from(actorIds));
    nameById = new Map((profs ?? []).map((p: any) => [p.id, p.username]));
  }
  const snip = (id: string) => { const t = proseById.get(id) ?? ""; return t.length > 70 ? t.slice(0, 70) + "…" : t; };
  const name = (id: string) => nameById.get(id) ?? "someone";
  const items: ActivityItem[] = [];
  for (const f of follows.data ?? []) items.push({ id: "f" + f.follower + f.created_at, type: "follow", actor: name(f.follower), createdAt: f.created_at });
  for (const l of likes.data ?? []) items.push({ id: "l" + l.user_id + l.post_id, type: "like", actor: name(l.user_id), postId: l.post_id, snippet: snip(l.post_id), createdAt: l.created_at });
  for (const c of comments.data ?? []) items.push({ id: "c" + c.author + c.post_id + c.created_at, type: "reply", actor: name(c.author), postId: c.post_id, snippet: c.body, createdAt: c.created_at });
  items.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  return items.slice(0, 60);
}

export const getUnreadActivityCount = cache(async function getUnreadActivityCount(): Promise<number> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;
  const { data: prof } = await supabase.from("profiles").select("activity_seen_at").eq("id", user.id).maybeSingle();
  const seen = prof?.activity_seen_at ?? "1970-01-01T00:00:00Z";
  const { data: myPosts } = await supabase.from("posts").select("id").eq("author", user.id);
  const ids = (myPosts ?? []).map((p: any) => p.id);
  const head = { count: "exact" as const, head: true };
  const zero = Promise.resolve({ count: 0 });
  const [f, l, c] = await Promise.all([
    supabase.from("follows").select("*", head).eq("following", user.id).gt("created_at", seen),
    ids.length ? supabase.from("likes").select("*", head).in("post_id", ids).neq("user_id", user.id).gt("created_at", seen) : zero,
    ids.length ? supabase.from("comments").select("*", head).in("post_id", ids).neq("author", user.id).gt("created_at", seen) : zero,
  ]);
  return (f.count ?? 0) + (l.count ?? 0) + (c.count ?? 0);
});

export async function markActivitySeen(): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("profiles").update({ activity_seen_at: new Date().toISOString() }).eq("id", user.id);
}

export type StoryGroup = { username: string; displayName: string | null; lines: string[] };

export async function getActiveStories(): Promise<StoryGroup[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("stories")
    .select("id, body, created_at, author:profiles!stories_author_fkey(username, display_name)")
    .gt("expires_at", new Date().toISOString()).order("created_at", { ascending: true });
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

export const getCurrentProfile = cache(async function getCurrentProfile(): Promise<{ id: string; username: string; displayName: string | null; language: string } | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("id, username, display_name, language").eq("id", user.id).maybeSingle();
  if (!data) return null;
  return { id: data.id, username: data.username, displayName: data.display_name, language: data.language ?? "en" };
});
