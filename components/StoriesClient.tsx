"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createStory } from "@/app/story/actions";
import type { StoryGroup } from "@/lib/db";

export default function StoriesClient({ groups, canAdd }: { groups: StoryGroup[]; canAdd: boolean }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState<StoryGroup | null>(null);

  async function submit() {
    if (!text.trim() || busy) return;
    setBusy(true);
    const r = await createStory(text);
    setBusy(false);
    if (r?.error) return;
    setText("");
    setAdding(false);
    router.refresh();
  }

  function Ring({ label, onClick, plus }: { label: string; onClick: () => void; plus?: boolean }) {
    return (
      <button onClick={onClick} className="flex flex-col items-center gap-1.5">
        <span className={"rounded-full p-[2px] " + (plus ? "bg-hairline" : "bg-gradient-to-tr from-emerald via-paper to-emerald")}>
          <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-ink text-lg font-bold text-ash">
            {plus ? "+" : label.slice(0, 1).toUpperCase()}
          </span>
        </span>
        <span className="max-w-[64px] truncate text-[11px] text-ash">{plus ? "your story" : label}</span>
      </button>
    );
  }

  return (
    <>
      <div className="mb-6 flex gap-4 overflow-x-auto border-b border-hairline pb-5">
        {canAdd && <Ring label="" plus onClick={() => setAdding(true)} />}
        {groups.map((g) => (
          <Ring key={g.username} label={g.username} onClick={() => setView(g)} />
        ))}
      </div>

      {adding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 px-6" onClick={() => setAdding(false)}>
          <div className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <p className="mb-2 text-xs uppercase tracking-widest text-ash">add to your story</p>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={280}
              rows={3}
              placeholder="a passing thought… (gone in 24h)"
              className="w-full rounded-lg border border-hairline bg-surface px-4 py-3 text-paper placeholder:text-ash focus:border-emerald focus:outline-none"
            />
            <div className="mt-3 flex gap-3">
              <button onClick={submit} disabled={busy}
                className="rounded-full bg-emerald px-5 py-2 text-sm font-semibold text-ink hover:opacity-90 disabled:opacity-60">
                {busy ? "posting…" : "share"}
              </button>
              <button onClick={() => setAdding(false)} className="rounded-full border border-hairline px-5 py-2 text-sm text-ash hover:text-paper">
                cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {view && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/95 px-6" onClick={() => setView(null)}>
          <div className="max-w-reading text-center">
            <p className="mb-4 text-xs uppercase tracking-widest text-ash">@{view.username}'s story</p>
            <div className="space-y-4">
              {view.lines.map((l, i) => (
                <p key={i} className="prose-body text-2xl leading-relaxed">{l}</p>
              ))}
            </div>
            <p className="mt-8 text-xs text-ash">tap anywhere to close</p>
          </div>
        </div>
      )}
    </>
  );
}
