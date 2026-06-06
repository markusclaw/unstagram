import Link from "next/link";
import { getCurrentProfile } from "@/lib/db";

function Icon({ d }: { d: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  home: "M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3",
  scrolls: "M4 5h16v14H4zM10 9l5 3-5 3z",
  messages: "M21 11.5a8.5 8.5 0 0 1-12.3 7.6L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5Z",
  notifications: "M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0",
  create: "M12 5v14M5 12h14",
  profile: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0",
};

export default async function Sidebar() {
  const me = await getCurrentProfile();
  const profileHref = me ? `/u/${me.username}` : "/login";

  const NAV = [
    { href: "/", label: "Home", icon: ICONS.home },
    { href: "/search", label: "Search", icon: ICONS.search },
    { href: "/scrolls", label: "Scrolls", icon: ICONS.scrolls },
    { href: "/messages", label: "Messages", icon: ICONS.messages },
    { href: "/notifications", label: "Notifications", icon: ICONS.notifications },
    { href: "/compose", label: "Create", icon: ICONS.create },
    { href: profileHref, label: "Profile", icon: ICONS.profile },
  ];

  return (
    <aside className="sticky top-0 hidden h-screen w-[76px] shrink-0 flex-col border-r border-hairline px-3 py-6 md:flex xl:w-[245px]">
      <Link href="/" className="mb-8 px-2 text-xl font-bold tracking-tight">
        <span className="hidden xl:inline">UNSTAGRAM</span>
        <span className="xl:hidden">U.</span>
      </Link>
      <nav className="flex flex-col gap-1">
        {NAV.map((item) => (
          <Link key={item.label} href={item.href}
            className="flex items-center gap-4 rounded-lg px-2 py-3 text-paper hover:bg-surface">
            <Icon d={item.icon} />
            <span className="hidden text-[15px] xl:inline">{item.label}</span>
          </Link>
        ))}
      </nav>
      <p className="mt-auto hidden px-2 text-[11px] leading-relaxed text-ash xl:block">
        no algorithm.<br />chronological.<br />no pictures.
      </p>
    </aside>
  );
}
