"use client";

import { useEffect, useRef, useState } from "react";

const LINES = [
  "A dog has found a stick it considers historically important.",
  "The elevator arrives empty and somehow disappointed.",
  "Two pigeons are having the same fight they had yesterday.",
  "The vending machine is out of the only thing worth wanting.",
  "Somewhere a printer is jammed and nobody has been told.",
  "The moon is up early, like it has a question.",
  "A child explains the rules of a game that does not exist.",
  "The last fry has been offered three times and refused twice.",
];

export default function Scrolls() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (paused) return;
    timer.current = setInterval(() => setI((n) => (n + 1) % LINES.length), 4000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused]);

  return (
    <div className="-mx-5 -mt-6">
      <div
        className="relative flex h-[calc(100vh-2rem)] select-none items-center justify-center px-8 text-center"
        onClick={() => setI((n) => (n + 1) % LINES.length)}
      >
        <div>
          <p className="mb-6 text-xs uppercase tracking-widest text-ash">scrolls</p>
          <p key={i} className="prose-body mx-auto max-w-reading text-3xl leading-snug">{LINES[i]}</p>
          <p className="mt-10 text-xs text-ash">tap for the next one · no sound · no video · just this</p>
        </div>
        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-1.5">
          {LINES.map((_, n) => (
            <span key={n} className={"h-1 w-6 rounded-full " + (n === i ? "bg-emerald" : "bg-hairline")} />
          ))}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setPaused((p) => !p); }}
          className="absolute right-4 top-4 text-xs text-ash hover:text-paper"
        >
          {paused ? "play" : "pause"}
        </button>
      </div>
    </div>
  );
}
