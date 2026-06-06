import Link from "next/link";
import { users, getUser } from "@/lib/mockData";

const SUGGESTIONS = [
  { id: "u_void", note: "also refuses to post pictures" },
  { id: "u_rj", note: "described a sandwich once. beautifully." },
  { id: "u_markus", note: "suggested for you" },
];

export default function SuggestionsRail() {
  const me = getUser("u_greg");
  return (
    <aside className="sticky top-0 hidden h-screen w-[320px] shrink-0 px-8 py-8 xl:block">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-paper">@{me?.username}</p>
          <p className="text-sm text-ash">{me?.displayName}</p>
        </div>
        <button className="text-xs font-semibold text-emerald hover:text-paper">Switch</button>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-ash">Suggested for you</span>
        <span className="text-xs font-semibold text-paper">See all</span>
      </div>

      <ul className="space-y-3">
        {SUGGESTIONS.map((s) => {
          const u = getUser(s.id);
          if (!u) return null;
          return (
            <li key={s.id} className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <Link href={`/u/${u.username}`} className="block truncate text-sm font-semibold text-paper hover:text-emerald">
                  {u.displayName}
                </Link>
                <p className="truncate text-xs text-ash">{s.note}</p>
              </div>
              <button className="shrink-0 text-xs font-semibold text-emerald hover:text-paper">Follow</button>
            </li>
          );
        })}
      </ul>

      <footer className="mt-8 space-y-1 text-[11px] text-ash">
        <p>About · Help · Press · API · Jobs · Privacy · Terms</p>
        <p>© 2026 UNSTAGRAM · <span className="italic">not from Meta</span></p>
      </footer>
    </aside>
  );
}
