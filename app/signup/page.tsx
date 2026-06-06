import Link from "next/link";
import { signUp } from "@/app/auth/actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="mx-auto max-w-sm py-16">
      <h1 className="mb-1 text-center text-2xl font-bold">Join UNSTAGRAM</h1>
      <p className="mb-8 text-center text-sm text-ash">Instagram, but we deleted the pictures.</p>

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
