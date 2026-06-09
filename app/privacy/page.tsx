import type { Metadata } from "next";
export const metadata: Metadata = { title: "Privacy", description: "How UNSTAGRAM handles your data.", alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-[40rem] py-8 text-[15px] leading-relaxed text-ash">
      <h1 className="text-2xl font-bold text-paper">Privacy</h1>
      <p className="mt-2">Short version: we keep as little as possible, and we never store your photos.</p>

      <h2 className="mb-1 mt-6 text-sm font-semibold uppercase tracking-wide text-paper">Your photos</h2>
      <p>When you post, your image is sent to an AI to be turned into a written description, then immediately discarded. It is never saved to our servers, never shown to other people, and never used to train facial recognition. Images are also downscaled and stripped of metadata in your browser before they're sent. Only the text description is stored.</p>

      <h2 className="mb-1 mt-6 text-sm font-semibold uppercase tracking-wide text-paper">What we store</h2>
      <p>Your email and password (for login), your username and profile, and the content you create: descriptions, captions, comments, likes, follows, optional coarse location text, and stories (which auto-expire after 24 hours).</p>

      <h2 className="mb-1 mt-6 text-sm font-semibold uppercase tracking-wide text-paper">Analytics</h2>
      <p>We use privacy-respecting, cookieless analytics to understand traffic (page views, referrers, country). We do not use advertising trackers and do not sell data.</p>

      <h2 className="mb-1 mt-6 text-sm font-semibold uppercase tracking-wide text-paper">Public content</h2>
      <p>Posts, profiles, and comments are public and may be viewed by anyone and indexed by search engines. Don't post anything in a description or caption you wouldn't want public.</p>

      <h2 className="mb-1 mt-6 text-sm font-semibold uppercase tracking-wide text-paper">Deletion</h2>
      <p>You can delete your account; your posts, comments, and data are removed. Contact us to request deletion.</p>

      <p className="mt-6 text-xs">This is a plain-language summary, not legal advice. For a production launch, have a lawyer review your final policy.</p>
    </article>
  );
}
