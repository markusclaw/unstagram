export default function LoginPage() {
  return (
    <div className="py-16 text-center">
      <h1 className="mb-2 text-2xl font-bold">UNSTAGRAM</h1>
      <p className="mb-10 text-sm text-ash">Instagram, but we deleted the pictures.</p>

      {/* Concept stage: auth is faked. Blueprint feedback says one OAuth
          provider ("Sign in with Google") is plenty for the real thing. */}
      <button
        disabled
        className="mx-auto block cursor-not-allowed rounded-full border border-hairline px-6 py-2 text-sm text-ash"
        title="wired up when auth lands"
      >
        Continue with Google (coming soon)
      </button>

      <a href="/" className="mt-8 inline-block text-emerald hover:underline">
        skip — just show me the feed →
      </a>
    </div>
  );
}
