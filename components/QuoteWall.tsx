"use client";

import { INVESTOR_QUOTES } from "@/lib/quotes";

export function QuoteWall() {
  return (
    <div className="rounded-lg border border-white/10 bg-neutral-900/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">
          Growth Investor Quotes
        </div>
        <div className="text-[10px] text-neutral-600">
          {INVESTOR_QUOTES.length} entries
        </div>
      </div>
      <ul className="max-h-80 space-y-3 overflow-y-auto pr-1">
        {INVESTOR_QUOTES.map((q, i) => (
          <li
            key={i}
            className="rounded-md border border-white/5 bg-black/30 p-3"
          >
            <p className="text-xs leading-relaxed text-neutral-200">
              <span className="text-amber-400/80">“</span>
              {q.quote}
              <span className="text-amber-400/80">”</span>
            </p>
            <div className="mt-1.5 flex items-baseline justify-between gap-2 text-[10px]">
              <span className="font-medium text-neutral-300">{q.author}</span>
              <span className="text-neutral-500">{q.role}</span>
            </div>
            <div className="mt-0.5 text-[10px] text-neutral-600">{q.source}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
