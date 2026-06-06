import Composer from "@/components/Composer";
import { getCurrentProfile } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ComposePage() {
  const me = await getCurrentProfile();
  return <Composer defaultLanguage={me?.language ?? "en"} />;
}
