"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { genToken, sha256hex } from "@/lib/token";

export async function createToken(name: string): Promise<{ token?: string; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const token = genToken();
  const hash = await sha256hex(token);
  const { error } = await supabase.from("api_tokens").insert({
    user_id: user.id, name: (name || "token").slice(0, 40), token_prefix: token.slice(0, 12), token_hash: hash,
  });
  if (error) return { error: error.message };
  revalidatePath("/settings");
  return { token };
}

export async function revokeToken(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await supabase.from("api_tokens").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/settings");
}
