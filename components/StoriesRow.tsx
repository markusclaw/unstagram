"use client";

import { useState } from "react";

const STORIES = [
  { id: "s1", who: "markus", line: "the coffee was the exact temperature of a decision you've been putting off." },
  { id: "s2", who: "greg", line: "someone two tables over is winning an argument nobody else can hear." },
  { id: "s3", who: "rj", line: "the bus is late in the way that feels personal." },
  { id: "s4", who: "anon", line: "it is raining on exactly one side of the street." },
];

export default function StoriesRow() {
  const [openId, setOpenId] = useState<string | null>(null);
  const active = STORIES.find((s) => s.id === openId);

  return (
    <>
      <div className="mb-6 flex gap-4 overflow-x-auto border-b border-hairline pb-5">
        {STORIES.map((s) => (
          <button key={s.id} onClick={() => setOpenId(s.id)} className="flex flex-col items-center gap-1.5">
            <span className="rounded-full bg-gradient-to-tr from-emerald via-paper to-emerald p-[2px]">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink text-lg font-bold text-ash">
                {s.who.slice(0, 1).toUpperCase()}
              </span>
            </span>
            <span className="max-w-[64px] truncate text-[11px] text-ash">{s.who}</span>
          </button>
        ))}
      </div>

      {active && (
        <div onClick={() => setOpenId(null)} className="fixed inset-0 z-50 flex items-center justify-center bg-ink/95 px-6">
          <div className="max-w-reading text-center">
            <p className="mb-4 text-xs uppercase tracking-widest text-ash">@{active.who}'s story</p>
            <p className="prose-body text-2xl leading-relaxed">{active.line}</p>
            <p className="mt-8 text-xs text-ash">tap anywhere — it's gone now (it isn't, but pretend)</p>
          </div>
        </div>
      )}
    </>
  );
}
