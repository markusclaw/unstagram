"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { notify, usernameOf } from "@/lib/discord";

export async function createStory(body: string): Promise<{ error: string } | void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const clean = body.replace(/\s+/g, " ").trim().slice(0, 280);
  if (!clean) return { error: "Story can't be empty." };
  const { error } = await supabase.from("stories").insert({ author: user.id, body: clean });
  if (error) return { error: error.message };
  await notify(`📖 ${await usernameOf(supabase, user.id)} added a story`);
  revalidatePath("/");
}
