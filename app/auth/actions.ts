"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { notify } from "@/lib/discord";

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const identifier = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  // Allow logging in with a username: resolve it to the account email
  // server-side (the email is never exposed to the client).
  let email = identifier;
  if (identifier && !identifier.includes("@") && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const admin = adminClient();
      const { data: prof } = await admin.from("profiles").select("id").eq("username", identifier.toLowerCase()).maybeSingle();
      if (prof?.id) {
        const { data } = await admin.auth.admin.getUserById(prof.id);
        if (data?.user?.email) email = data.user.email;
      }
    } catch { /* fall back to treating it as an email */ }
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect("/login?error=" + encodeURIComponent("Wrong username/email or password."));

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const language = String(formData.get("language") ?? "en");

  if (!/^[a-z0-9_.]{3,20}$/.test(username)) {
    redirect("/signup?error=" + encodeURIComponent("Username: 3–20 chars, a–z 0–9 . _"));
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username, language } },
  });
  if (error) redirect("/signup?error=" + encodeURIComponent(error.message));

  await notify(`🆕 new user @${username} joined`);

  // If email confirmation is on, there's no session yet — tell them to check their inbox.
  if (!data.session) redirect("/login?notice=confirm&email=" + encodeURIComponent(email));

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function resendConfirmation(email: string): Promise<{ ok?: boolean; error?: string }> {
  const clean = email.trim();
  if (!clean.includes("@")) return { error: "Enter the email you signed up with." };
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({ type: "signup", email: clean });
  if (error) return { error: error.message };
  return { ok: true };
}
