"use client";

import { FRONTIER_THESES } from "@/lib/frontier-theses";

export function ThesisLibrary({
  onPick,
}: {
  onPick: (prompt: string) => void;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-neutral-900/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">
          Historical Analogs
        </div>
        <div className="text-[10px] text-neutral-600">pattern library</div>
      </div>
      <ul className="space-y-2">
        {FRONTIER_THESES.map((t) => (
          <li key={t.id}>
            <button
              onClick={() =>
                onPick(
                  `Walk me through the ${t.asset} ${t.era} thesis — what was the exact setup, who would have seen it, and what's a present-day analog rhyming with it?`,
                )
              }
              className="group block w-full rounded-md border border-white/5 bg-black/20 p-3 text-left transition hover:border-amber-500/40 hover:bg-amber-500/5"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-medium text-neutral-100">{t.asset}</span>
                <span className="font-mono text-[10px] text-amber-300/80">
                  {t.multiple}
                </span>
              </div>
              <div className="mt-0.5 text-[11px] text-neutral-500">{t.era}</div>
              <p className="mt-1.5 text-xs leading-relaxed text-neutral-400 group-hover:text-neutral-300">
                {t.trigger}
              </p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
