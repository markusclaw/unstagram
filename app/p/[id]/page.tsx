import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProseCard from "@/components/ProseCard";
import { getPost } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) return { title: "Post" };
  const desc = (post.caption || post.proseParts[0] || "").slice(0, 160);
  const title = `@${post.author.username} on UNSTAGRAM`;
  return {
    title, description: desc,
    alternates: { canonical: `/p/${id}` },
    openGraph: { type: "article", title, description: desc, url: `/p/${id}` },
    twitter: { card: "summary_large_image", title, description: desc },
  };
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) return notFound();

  const ld = {
    "@context": "https://schema.org",
    "@type": "SocialMediaPosting",
    headline: post.proseParts[0].slice(0, 110),
    articleBody: post.proseParts.join("\n\n"),
    datePublished: post.createdAt,
    author: { "@type": "Person", name: post.author.username },
    interactionStatistic: [
      { "@type": "InteractionCounter", interactionType: "https://schema.org/LikeAction", userInteractionCount: post.likeCount },
      { "@type": "InteractionCounter", interactionType: "https://schema.org/CommentAction", userInteractionCount: post.replyCount },
    ],
  };

  return (
    <div className="py-2">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <ProseCard post={post} detail />
    </div>
  );
}
