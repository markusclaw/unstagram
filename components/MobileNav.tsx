"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function Icon({ d }: { d: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  home: "M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3",
  create: "M12 5v14M5 12h14",
  activity: "M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0",
  profile: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0",
};

export default function MobileNav({ profileHref, unread }: { profileHref: string; unread: number }) {
  const path = usePathname();
  const items = [
    { href: "/", icon: ICONS.home, label: "home" },
    { href: "/search", icon: ICONS.search, label: "search" },
    { href: "/compose", icon: ICONS.create, label: "create" },
    { href: "/notifications", icon: ICONS.activity, label: "activity", badge: unread },
    { href: profileHref, icon: ICONS.profile, label: "profile" },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-hairline bg-ink/95 py-2.5 backdrop-blur md:hidden">
      {items.map((it) => {
        const active = it.href === "/" ? path === "/" : path.startsWith(it.href);
        return (
          <Link key={it.label} href={it.href} aria-label={it.label}
            className={"relative " + (active ? "text-paper" : "text-ash")}>
            <Icon d={it.icon} />
            {!!it.badge && it.badge > 0 && (
              <span className="absolute -right-2 -top-1.5 min-w-[16px] rounded-full bg-red-500 px-1 text-center text-[10px] font-bold leading-4 text-white">
                {it.badge > 9 ? "9+" : it.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
