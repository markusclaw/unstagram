import { createClient } from "@/lib/supabase/server";

export type Author = { username: string; displayName: string | null };
export type Reply = { id: string; body: string; createdAt: string; author: Author };
export type FeedPost = {
  id: string;
  prose: string;
  createdAt: string;
  author: Author;
  replies: Reply[];
};
export type Profile = {
  id: string;
  username: string;
  displayName: string | null;
  bio: string | null;
};

// PostgREST returns to-one embeds as an object, but the generated types
// sometimes widen to arrays — coerce defensively.
function one<T>(v: T | T[] | null | undefined): T | null {
  if (Array.isArray(v)) return v[0] ?? null;
  return v ?? null;
}
function author(raw: any): Author {
  const a = one<any>(raw);
  return { username: a?.username ?? "someone", displayName: a?.display_name ?? null };
}
function mapPost(row: any): FeedPost {
  return {
    id: row.id,
    prose: row.prose,
    createdAt: row.created_at,
    author: author(row.author),
    replies: (row.comments ?? [])
      .slice()
      .sort((a: any, b: any) => +new Date(a.created_at) - +new Date(b.created_at))
      .map((c: any) => ({
        id: c.id,
        body: c.body,
        createdAt: c.created_at,
        author: author(c.author),
      })),
  };
}

const POST_SELECT =
  "id, prose, created_at, author:profiles(username, display_name), comments(id, body, created_at, author:profiles(username, display_name))";

export async function getFeed(): Promise<FeedPost[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error || !data) return [];
  return data.map(mapPost);
}

export async function getProfile(username: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, username, display_name, bio")
    .eq("username", username)
    .maybeSingle();
  if (!data) return null;
  return { id: data.id, username: data.username, displayName: data.display_name, bio: data.bio };
}

export async function getPostsByAuthor(authorId: string): Promise<FeedPost[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("author", authorId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map(mapPost);
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("id, username, display_name, bio")
    .eq("id", user.id)
    .maybeSingle();
  if (!data) return null;
  return { id: data.id, username: data.username, displayName: data.display_name, bio: data.bio };
}
