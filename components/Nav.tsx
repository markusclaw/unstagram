import Link from "next/link";

export default function Nav() {
  return (
    <header className="sticky top-0 z-10 border-b border-hairline bg-ink/90 backdrop-blur">
      <div className="mx-auto flex max-w-reading items-center justify-between px-5 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          UNSTAGRAM
        </Link>
        <nav className="flex items-center gap-5 text-sm text-ash">
          <Link href="/" className="hover:text-paper">feed</Link>
          <Link href="/u/greg" className="hover:text-paper">profile</Link>
          <Link
            href="/compose"
            className="rounded-full border border-emerald px-3 py-1 text-emerald hover:bg-emerald hover:text-ink"
          >
            post
          </Link>
        </nav>
      </div>
    </header>
  );
}
