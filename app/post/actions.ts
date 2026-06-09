"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { notify, link, usernameOf } from "@/lib/discord";

const MAX_CHARS = 1080;

export async function createPost(parts: string[], location?: string, caption?: string): Promise<{ error: string } | void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const cleaned = (parts ?? []).map((p) => p.replace(/\s+/g, " ").trim().slice(0, MAX_CHARS)).filter(Boolean);
  if (!cleaned.length) return;
  const loc = (location ?? "").trim().slice(0, 80) || null;
  const cap = (caption ?? "").trim().slice(0, 300) || null;

  const { data: created, error } = await supabase.from("posts").insert({
    author: user.id, prose: cleaned.join("\n\n"), prose_parts: cleaned, location: loc, caption: cap,
  }).select("id").maybeSingle();
  if (error) return { error: error.message };
  await notify(`📝 ${await usernameOf(supabase, user.id)} posted — "${cleaned[0].slice(0, 140)}" ${link("/p/" + created?.id)}`);
  revalidatePath("/");
  redirect("/");
}

export async function addReply(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const postId = String(formData.get("postId") ?? "");
  const parentId = String(formData.get("parentId") ?? "") || null;
  const body = String(formData.get("body") ?? "").trim().slice(0, MAX_CHARS);
  if (!postId || !body) return;
  await supabase.from("comments").insert({ post_id: postId, author: user.id, body, parent_id: parentId });
  await notify(`💬 ${await usernameOf(supabase, user.id)} commented: "${body.slice(0, 140)}" ${link("/p/" + postId)}`);
  revalidatePath("/");
}

export async function toggleLike(postId: string, liked: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (liked) await supabase.from("likes").delete().eq("user_id", user.id).eq("post_id", postId);
  else {
    await supabase.from("likes").upsert({ user_id: user.id, post_id: postId });
    await notify(`❤️ ${await usernameOf(supabase, user.id)} liked a post ${link("/p/" + postId)}`);
  }
  revalidatePath("/");
}

export async function toggleCommentLike(commentId: string, liked: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (liked) await supabase.from("comment_likes").delete().eq("user_id", user.id).eq("comment_id", commentId);
  else await supabase.from("comment_likes").upsert({ user_id: user.id, comment_id: commentId });
  revalidatePath("/");
}

export async function reportPost(postId: string, reason?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!postId) return;
  await supabase.from("reports").insert({ post_id: postId, reporter: user.id, reason: (reason ?? "").trim().slice(0, 300) || null });
  await notify(`🚩 a post was reported ${link("/p/" + postId)}`);
}
