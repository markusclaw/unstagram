import Link from "next/link";
import { getActivity } from "@/lib/db";
import { timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

const VERB: Record<string, string> = {
  follow: "followed you",
  like: "liked your post",
  repost: "shared your post",
  reply: "replied to your post",
};

export default async function NotificationsPage() {
  const items = await getActivity();

  return (
    <div className="py-2">
      <h1 className="mb-1 text-2xl font-bold">Activity</h1>
      <p className="mb-6 text-sm text-ash">Who's been reading, reacting, and following.</p>

      {items.length === 0 ? (
        <p className="text-sm text-ash">
          Nothing yet. When people follow you or react to your posts, it shows up here.
        </p>
      ) : (
        <ul className="divide-y divide-hairline">
          {items.map((a) => (
            <li key={a.id} className="flex items-start gap-3 py-4 text-sm">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-xs font-bold text-ash">
                {a.actor.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p>
                  <Link href={`/u/${a.actor}`} className="font-semibold text-paper hover:text-emerald">
                    @{a.actor}
                  </Link>{" "}
                  <span className="text-ash">{VERB[a.type]}</span>{" "}
                  <span className="text-ash">· {timeAgo(a.createdAt)}</span>
                </p>
                {a.snippet && (
                  <Link href={a.postId ? `/p/${a.postId}` : "#"} className="mt-0.5 block truncate text-ash hover:text-paper">
                    {a.type === "reply" ? `“${a.snippet}”` : a.snippet}
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
