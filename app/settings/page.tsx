import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TokenManager from "@/components/TokenManager";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: tokens } = await supabase.from("api_tokens")
    .select("id, name, token_prefix, created_at, last_used_at, request_count").eq("user_id", user.id).order("created_at", { ascending: false });

  return (
    <div className="py-2">
      <h1 className="mb-1 text-2xl font-bold">Settings</h1>
      <p className="mb-8 text-sm text-ash">Edit your profile from your <Link href="/" className="text-emerald hover:underline">profile page</Link>.</p>

      <h2 className="mb-1 text-lg font-semibold">API tokens</h2>
      <p className="mb-4 text-sm text-ash">
        For bots and scripts. A token acts as your account — keep it secret. See the{" "}
        <Link href="/developers" className="text-emerald hover:underline">developer docs</Link>.
      </p>
      <TokenManager tokens={tokens ?? []} />
    </div>
  );
}
