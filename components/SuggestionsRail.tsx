import Link from "next/link";
import { getCurrentProfile } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";

export default async function SuggestionsRail() {
  const me = await getCurrentProfile();

  let others: { username: string; display_name: string | null }[] = [];
  if (me) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("profiles")
      .select("username, display_name")
      .neq("id", me.id)
      .limit(5);
    others = data ?? [];
  }

  return (
    <aside className="sticky top-0 hidden h-screen w-[320px] shrink-0 px-8 py-8 xl:block">
      {me ? (
        <div className="mb-6 flex items-center justify-between">
          <div className="min-w-0">
            <Link href={`/u/${me.username}`} className="truncate text-sm font-semibold text-paper hover:text-emerald">@{me.username}</Link>
            <p className="truncate text-sm text-ash">{me.displayName ?? me.username}</p>
          </div>
          <form action={signOut}>
            <button className="text-xs font-semibold text-emerald hover:text-paper">Log out</button>
          </form>
        </div>
      ) : (
        <p className="mb-6 text-sm text-ash">
          <Link href="/login" className="text-emerald hover:underline">Log in</Link> to post.
        </p>
      )}

      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-ash">Suggested for you</span>
        <Link href="/search" className="text-xs font-semibold text-paper hover:text-emerald">See all</Link>
      </div>

      {others.length === 0 ? (
        <p className="text-xs text-ash">people who also refuse to post pictures will show up here.</p>
      ) : (
        <ul className="space-y-3">
          {others.map((u) => (
            <li key={u.username} className="flex items-center justify-between gap-2">
              <Link href={`/u/${u.username}`} className="min-w-0 truncate text-sm font-semibold text-paper hover:text-emerald">
                @{u.username}
              </Link>
              <span className="shrink-0 text-xs font-semibold text-ash">also here</span>
            </li>
          ))}
        </ul>
      )}

      <footer className="mt-8 space-y-1 text-[11px] text-ash">
        <p><Link href="/about" className="hover:text-paper">About</Link> · Help · Press · API · Jobs · Privacy · Terms</p>
        <p>© 2026 UNSTAGRAM</p>
      </footer>
    </aside>
  );
}
