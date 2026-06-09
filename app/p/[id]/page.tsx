import { notFound } from "next/navigation";
import ProseCard from "@/components/ProseCard";
import { getPost } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) return notFound();
  return <div className="py-2">
    <ProseCard post={post} detail />
  </div>;
}
