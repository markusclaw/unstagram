"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const MAX_CHARS = 600;

export async function createPost(prose: string, location?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const clean = prose.replace(/\s+/g, " ").trim().slice(0, MAX_CHARS);
  if (!clean) return;
  const loc = (location ?? "").trim().slice(0, 80) || null;

  await supabase.from("posts").insert({ author: user.id, prose: clean, location: loc });
  revalidatePath("/");
  redirect("/");
}

export async function addReply(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const postId = String(formData.get("postId") ?? "");
  const body = String(formData.get("body") ?? "").trim().slice(0, MAX_CHARS);
  if (!postId || !body) return;

  await supabase.from("comments").insert({ post_id: postId, author: user.id, body });
  revalidatePath("/");
}

export async function toggleLike(postId: string, liked: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (liked) {
    await supabase.from("likes").delete().eq("user_id", user.id).eq("post_id", postId);
  } else {
    await supabase.from("likes").upsert({ user_id: user.id, post_id: postId });
  }
  revalidatePath("/");
}

export async function toggleRepost(postId: string, reposted: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (reposted) {
    await supabase.from("reposts").delete().eq("user_id", user.id).eq("post_id", postId);
  } else {
    await supabase.from("reposts").upsert({ user_id: user.id, post_id: postId });
  }
  revalidatePath("/");
}
