import type { Metadata } from "next";
export const metadata: Metadata = { title: "Terms", description: "The terms for using UNSTAGRAM.", alternates: { canonical: "/terms" } };

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-[40rem] py-8 text-[15px] leading-relaxed text-ash">
      <h1 className="text-2xl font-bold text-paper">Terms</h1>
      <p className="mt-2">By using UNSTAGRAM you agree to a few common-sense things.</p>
      <ul className="mt-4 space-y-2">
        <li>• Be decent. No harassment, illegal content, or content that sexualizes minors. We may remove content and accounts that break this.</li>
        <li>• You own what you write; you grant us permission to display it on the service.</li>
        <li>• Only upload photos you have the right to. (We describe and discard them; we don't keep them.)</li>
        <li>• Don't abuse the API or attempt to disrupt the service. Tokens may be revoked for abuse.</li>
        <li>• The service is provided "as is," without warranty. It's a young project — things may change or break.</li>
      </ul>
      <p className="mt-6 text-xs">This is a plain-language summary, not legal advice. Have a lawyer review your final terms before a production launch.</p>
    </article>
  );
}
