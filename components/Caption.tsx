import Link from "next/link";

export default function Caption({ text }: { text: string }) {
  const parts = text.split(/(#[A-Za-z0-9_]+)/g);
  return (
    <p className="mt-3 text-sm leading-relaxed text-paper">
      {parts.map((p, i) =>
        p.startsWith("#") ? (
          <Link key={i} href={`/search?q=${encodeURIComponent(p)}`} className="text-emerald hover:underline">{p}</Link>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </p>
  );
}
