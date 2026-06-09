import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "What UNSTAGRAM is and how it works: post a photo, your followers read an AI-written description, and the image is never shown or stored. Chronological, privacy-first, text-only.",
  alternates: { canonical: "/about" },
};

const FAQ = [
  {
    q: "What is UNSTAGRAM?",
    a: "UNSTAGRAM is a social feed where photos are never shown. You upload a photo, an AI turns it into a short written description, and that description — not the image — is what your followers see. The feed is chronological, with no ranking algorithm and no image surveillance.",
  },
  {
    q: "How does it work?",
    a: "Pick a photo on your device. UNSTAGRAM sends it to a vision AI that writes a vivid description, then immediately discards the image. The description is posted to a chronological feed. Followers read it and imagine the rest.",
  },
  {
    q: "Is my photo stored anywhere?",
    a: "No. The image is sent to the AI to be described and is never saved to a server, never shown to other users, and never used to train facial recognition. Only the text description is stored.",
  },
  {
    q: "Is there an algorithm or ads?",
    a: "No ranking algorithm and no ads. The feed is strictly chronological — you see posts in the order they were made.",
  },
  {
    q: "What does a post look like?",
    a: "A short paragraph of evocative prose with the author and a timestamp — and optionally a coarse location. You can like, share, reply, and follow people. No picture, ever.",
  },
];

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: "UNSTAGRAM",
        url: "https://unstagram.net",
        potentialAction: {
          "@type": "SearchAction",
          target: "https://unstagram.net/search?q={query}",
          "query-input": "required name=query",
        },
      },
      {
        "@type": "WebApplication",
        name: "UNSTAGRAM",
        applicationCategory: "SocialNetworkingApplication",
        operatingSystem: "Web",
        description:
          "A text-only, privacy-first social feed where you post a photo and followers read an AI-written description instead. The image is never shown or stored.",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <article className="mx-auto max-w-[34rem] py-8 text-[15px] leading-relaxed text-ash">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="mb-10">
        <h1 className="text-xl font-bold text-paper">UNSTAGRAM</h1>
        <p className="mt-1 text-[15px] text-ash">Post a photo. Your followers read the words — never the picture.</p>
      </header>

      <section className="mb-7">
        <h2 className="mb-1.5 text-sm font-semibold uppercase tracking-wide text-paper">What it is</h2>
        <p>
          A social feed where photos are never shown. You post a photo; an AI turns it into a short,
          vivid description; your followers read the words and picture the rest. The image is never
          stored. The feed is chronological. There is no algorithm.
        </p>
      </section>

      <section className="mb-7">
        <h2 className="mb-1.5 text-sm font-semibold uppercase tracking-wide text-paper">How it works</h2>
        <ol className="space-y-1">
          <li>1. Pick a photo on your device.</li>
          <li>2. An AI writes a vivid description of it.</li>
          <li>3. The image is discarded; only the words are posted.</li>
          <li>4. Followers read it in a chronological feed and imagine the scene.</li>
        </ol>
      </section>

      <section className="mb-7">
        <h2 className="mb-1.5 text-sm font-semibold uppercase tracking-wide text-paper">Why</h2>
        <p>
          We're oversaturated with images and metrics. UNSTAGRAM asks for a little imagination and
          restraint instead — privacy by design, no surveillance, no infinite scroll of dopamine.
        </p>
      </section>

      <section className="mb-9">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-paper">FAQ</h2>
        <dl className="space-y-4">
          {FAQ.map((f) => (
            <div key={f.q}>
              <dt className="font-semibold text-paper">{f.q}</dt>
              <dd className="mt-0.5">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="flex gap-3">
        <Link href="/signup" className="rounded-full bg-emerald px-5 py-2 text-sm font-semibold text-ink hover:opacity-90">
          create an account
        </Link>
        <Link href="/login" className="rounded-full border border-hairline px-5 py-2 text-sm text-ash hover:text-paper">
          log in
        </Link>
      </div>
    </article>
  );
}
