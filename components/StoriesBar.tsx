import { getActiveStories, getCurrentProfile } from "@/lib/db";
import StoriesClient from "./StoriesClient";

export default async function StoriesBar() {
  const [groups, me] = await Promise.all([getActiveStories(), getCurrentProfile()]);
  return <StoriesClient groups={groups} canAdd={!!me} />;
}
