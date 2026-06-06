import Link from "next/link";
import ProseCard from "@/components/ProseCard";
import { searchProfiles, searchPosts } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const [people, posts] = query
    ? await Promise.all([searchProfiles(query), searchPosts(query)])
    : [[], []];

  return (
    <div className="py-2">
      <h1 className="mb-3 text-2xl font-bold">Search</h1>

      <form action="/search" method="GET">
        <input
          name="q"
          defaultValue={query}
          autoFocus
          placeholder="search people and words…"
          className="w-full rounded-lg border border-hairline bg-surface px-4 py-3 text-paper placeholder:text-ash focus:border-emerald focus:outline-none"
        />
      </form>

      {!query ? (
        <p className="mt-4 text-sm text-ash">Search usernames, or any word inside a description.</p>
      ) : (
        <div className="mt-6">
          {people.length > 0 && (
            <section className="mb-6">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ash">People</h2>
              <ul className="space-y-2">
                {people.map((u) => (
                  <li key={u.username}>
                    <Link href={`/u/${u.username}`} className="flex items-center gap-2 text-sm hover:text-emerald">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-xs font-bold text-ash">
                        {u.username.slice(0, 1).toUpperCase()}
                      </span>
                      <span className="font-semibold text-paper">@{u.username}</span>
                      {u.displayName && <span className="text-ash">· {u.displayName}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ash">Posts</h2>
          {posts.length === 0 && people.length === 0 ? (
            <p className="text-sm text-ash">No results for “{query}”.</p>
          ) : posts.length === 0 ? (
            <p className="text-sm text-ash">No posts match “{query}”.</p>
          ) : (
            posts.map((p) => <ProseCard key={p.id} post={p} />)
          )}
        </div>
      )}
    </div>
  );
}
