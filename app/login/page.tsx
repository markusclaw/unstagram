import Link from "next/link";
import type { Metadata } from "next";
import { signIn } from "@/app/auth/actions";
import ResendConfirm from "@/components/ResendConfirm";

export const metadata: Metadata = { title: "Log in", description: "Log in to UNSTAGRAM — where photos become words." };

function friendlyError(e?: string): string | null {
  if (!e) return null;
  if (e === "access_denied" || e.toLowerCase().includes("expired") || e.toLowerCase().includes("invalid"))
    return "That confirmation link was invalid or has expired. Log in below, or sign up again.";
  return e;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string; email?: string }>;
}) {
  const { error, notice, email } = await searchParams;
  const err = friendlyError(error);

  return (
    <div className="mx-auto max-w-sm py-16">
      <h1 className="mb-1 text-center text-2xl font-bold">UNSTAGRAM</h1>
      <p className="mb-8 text-center text-sm text-ash">Post a photo. Your followers read the words.</p>

      {notice === "confirm" && (
        <p className="mb-4 rounded-md border border-emerald bg-surface px-3 py-2 text-sm text-paper">
          📧 Almost there — we sent a confirmation link to your email. Click it, then log in here.
        </p>
      )}
      {notice === "confirm" && <ResendConfirm email={email} />}
      {err && (
        <p className="mb-4 rounded-md border border-hairline bg-surface px-3 py-2 text-sm text-paper">{err}</p>
      )}

      <form action={signIn} className="space-y-3">
        <input name="email" type="text" required placeholder="email or username"
          className="w-full rounded-lg border border-hairline bg-surface px-4 py-3 text-paper placeholder:text-ash focus:border-emerald focus:outline-none" />
        <input name="password" type="password" required placeholder="password"
          className="w-full rounded-lg border border-hairline bg-surface px-4 py-3 text-paper placeholder:text-ash focus:border-emerald focus:outline-none" />
        <button type="submit"
          className="w-full rounded-full bg-emerald px-5 py-3 text-sm font-semibold text-ink hover:opacity-90">
          log in
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ash">
        new here?{" "}
        <Link href="/signup" className="text-emerald hover:underline">sign up</Link>
      </p>
    </div>
  );
}
