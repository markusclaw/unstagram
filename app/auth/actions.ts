"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect("/login?error=" + encodeURIComponent(error.message));

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const invite = String(formData.get("invite") ?? "").trim();

  if (!/^[a-z0-9_.]{3,20}$/.test(username)) {
    redirect("/signup?error=" + encodeURIComponent("Username: 3–20 chars, a–z 0–9 . _"));
  }

  // Invite-only: validate the code before creating the account.
  const { data: ok, error: rpcErr } = await supabase.rpc("is_invite_valid", { code: invite });
  if (rpcErr) {
    redirect("/signup?error=" + encodeURIComponent("invite check failed: " + rpcErr.message));
  }
  if (!ok) {
    redirect("/signup?error=" + encodeURIComponent("Invalid or already-used invite code"));
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });
  if (error) redirect("/signup?error=" + encodeURIComponent(error.message));

  // Burn the invite (best-effort; security-definer RPC).
  await supabase.rpc("consume_invite", { code: invite });

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
