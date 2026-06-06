import Link from "next/link";
import { getCurrentProfile } from "@/lib/db";
import { signOut } from "@/app/auth/actions";

export default async function MobileTopBar() {
  const me = await getCurrentProfile();
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-hairline bg-ink/90 px-4 py-3 backdrop-blur md:hidden">
      <Link href="/" className="text-lg font-bold tracking-tight">UNSTAGRAM</Link>
      {me ? (
        <form action={signOut}>
          <button className="text-xs font-semibold text-emerald">log out</button>
        </form>
      ) : (
        <Link href="/login" className="text-xs font-semibold text-emerald">log in</Link>
      )}
    </header>
  );
}
