"use client";

import { RUBRIC_AXES, CONVICTION_BANDS } from "@/lib/rubric";

const MAX_WEIGHT = Math.max(...RUBRIC_AXES.map((a) => a.weight));

const BANDS = [
  {
    label: "High Conviction",
    op: "≥",
    value: CONVICTION_BANDS.HIGH_CONVICTION,
    cls: "border-emerald-500/30 bg-emerald-500/15 text-emerald-300",
  },
  {
    label: "Watchlist",
    op: "≥",
    value: CONVICTION_BANDS.WATCHLIST,
    cls: "border-amber-500/30 bg-amber-500/15 text-amber-300",
  },
  {
    label: "Pass",
    op: "<",
    value: CONVICTION_BANDS.WATCHLIST,
    cls: "border-rose-500/30 bg-rose-500/15 text-rose-300",
  },
];

/**
 * Explains the framework behind the Conviction Scorecard: the 7 weighted axes
 * and the score bands. Data comes straight from lib/rubric, so the panel and
 * the model's actual scoring can never disagree.
 */
export function ScoringRubric() {
  return (
    <div className="rounded-lg border border-white/10 bg-neutral-900/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">
          Scoring Rubric
        </div>
        <div className="text-[10px] text-neutral-600">
          {RUBRIC_AXES.length} axes · weighted
        </div>
      </div>

      <p className="mb-3 text-[11px] leading-relaxed text-neutral-500">
        Atlas grades every thesis 0–10 on each axis, then weights them into one
        conviction score. Weights sum to 100%.
      </p>

      <div className="space-y-2">
        {RUBRIC_AXES.map((axis) => (
          <div key={axis.key} className="flex items-center gap-3">
            <div className="w-32 shrink-0 text-xs text-neutral-400">
              {axis.label}
            </div>
            <div className="relative h-1.5 flex-1 overflow-hidden rounded bg-white/5">
              <div
                className="h-full rounded bg-gradient-to-r from-amber-400 to-amber-200"
                style={{ width: `${(axis.weight / MAX_WEIGHT) * 100}%` }}
              />
            </div>
            <div className="w-9 text-right font-mono text-xs tabular-nums text-neutral-300">
              {Math.round(axis.weight * 100)}%
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t border-white/5 pt-3">
        <div className="mb-2 text-[10px] uppercase tracking-[0.18em] text-neutral-500">
          Conviction Bands
        </div>
        <div className="space-y-1.5">
          {BANDS.map((b) => (
            <div
              key={b.label}
              className="flex items-center justify-between gap-2"
            >
              <span
                className={`rounded border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${b.cls}`}
              >
                {b.label}
              </span>
              <span className="font-mono text-[11px] tabular-nums text-neutral-400">
                {b.op} {b.value.toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
