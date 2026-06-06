"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createPost(prose: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const clean = prose.trim();
  if (!clean) return;

  await supabase.from("posts").insert({ author: user.id, prose: clean });
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
  const body = String(formData.get("body") ?? "").trim();
  if (!postId || !body) return;

  await supabase.from("comments").insert({ post_id: postId, author: user.id, body });
  revalidatePath("/");
}
