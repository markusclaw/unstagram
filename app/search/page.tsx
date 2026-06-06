export default function SearchPage() {
  return (
    <div className="py-10">
      <h1 className="mb-3 text-2xl font-bold">Search</h1>
      <input
        placeholder="describe what you're looking for…"
        className="w-full rounded-lg border border-hairline bg-surface px-4 py-3 text-paper placeholder:text-ash focus:border-emerald focus:outline-none"
      />
      <p className="mt-4 text-sm text-ash">
        You can search words. There are only words. This is the easiest search engine ever built.
      </p>
    </div>
  );
}
