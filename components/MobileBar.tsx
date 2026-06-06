import { getCurrentProfile, getUnreadActivityCount } from "@/lib/db";
import MobileNav from "./MobileNav";

export default async function MobileBar() {
  const me = await getCurrentProfile();
  const unread = me ? await getUnreadActivityCount() : 0;
  return <MobileNav profileHref={me ? `/u/${me.username}` : "/login"} unread={unread} />;
}
