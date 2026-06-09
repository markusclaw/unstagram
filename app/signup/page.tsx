import Link from "next/link";
import type { Metadata } from "next";
import { signUp } from "@/app/auth/actions";
import LanguageField from "@/components/LanguageField";

export const metadata: Metadata = { title: "Sign up", description: "Create an UNSTAGRAM account — post a photo, your followers read the description." };

function friendlyError(e?: string): string | null {
  if (!e) return null;
  if (e.toLowerCase().includes("already") || e.toLowerCase().includes("registered"))
    return "That email is already registered. Try logging in.";
  return e;
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error: rawError } = await searchParams;
  const error = friendlyError(rawError);
  return (
    <div className="mx-auto max-w-sm py-16">
      <h1 className="mb-1 text-center text-2xl font-bold">Join UNSTAGRAM</h1>
      <p className="mb-8 text-center text-sm text-ash">Post a photo. Your followers read the words.</p>

      {error && (
        <p className="mb-4 rounded-md border border-hairline bg-surface px-3 py-2 text-sm text-paper">{error}</p>
      )}

      <form action={signUp} className="space-y-3">
        <input name="username" required placeholder="username"
          className="w-full rounded-lg border border-hairline bg-surface px-4 py-3 text-paper placeholder:text-ash focus:border-emerald focus:outline-none" />
        <input name="email" type="email" required placeholder="email"
          className="w-full rounded-lg border border-hairline bg-surface px-4 py-3 text-paper placeholder:text-ash focus:border-emerald focus:outline-none" />
        <input name="password" type="password" required minLength={6} placeholder="password (6+ chars)"
          className="w-full rounded-lg border border-hairline bg-surface px-4 py-3 text-paper placeholder:text-ash focus:border-emerald focus:outline-none" />
        <div>
          <label className="mb-1 block text-xs text-ash">preferred language for your posts</label>
          <LanguageField name="language" />
        </div>
        <button type="submit"
          className="w-full rounded-full bg-emerald px-5 py-3 text-sm font-semibold text-ink hover:opacity-90">
          create account
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ash">
        already in?{" "}
        <Link href="/login" className="text-emerald hover:underline">log in</Link>
      </p>
    </div>
  );
}
