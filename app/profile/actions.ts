"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { notify, usernameOf, link } from "@/lib/discord";

export async function toggleFollow(targetId: string, isFollowing: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (user.id === targetId) return;

  if (isFollowing) {
    await supabase.from("follows").delete().eq("follower", user.id).eq("following", targetId);
  } else {
    await supabase.from("follows").upsert({ follower: user.id, following: targetId });
    const [me, them] = [await usernameOf(supabase, user.id), await usernameOf(supabase, targetId)];
    await notify(`➕ ${me} followed ${them}`);
  }
  revalidatePath("/", "layout");
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const displayName = String(formData.get("displayName") ?? "").trim().slice(0, 60);
  const bio = String(formData.get("bio") ?? "").trim().slice(0, 240);
  const language = String(formData.get("language") ?? "en");
  const isPrivate = formData.get("private") === "on";
  await supabase.from("profiles").update({ display_name: displayName || null, bio, language, private: isPrivate }).eq("id", user.id);
  revalidatePath("/", "layout");
  redirect(`/u/${String(formData.get("username") ?? "")}`);
}
