"use client";

export type ScorecardData = {
  asset: string;
  analog: string;
  rationale: string;
  weighted: number;
  band: "HIGH_CONVICTION" | "WATCHLIST" | "PASS";
  breakdown: Array<{ label: string; score: number; weight: number }>;
};

const BAND_STYLES: Record<ScorecardData["band"], string> = {
  HIGH_CONVICTION: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  WATCHLIST: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  PASS: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

export function Scorecard({ data }: { data: ScorecardData }) {
  return (
    <div className="rounded-lg border border-white/10 bg-neutral-900/60 p-4 backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">
            Conviction Scorecard
          </div>
          <div className="mt-0.5 text-lg font-semibold text-neutral-50">
            {data.asset}
          </div>
        </div>
        <div
          className={`shrink-0 rounded-md border px-2 py-1 text-[10px] font-semibold tracking-wider ${BAND_STYLES[data.band]}`}
        >
          {data.band.replace("_", " ")} · {data.weighted.toFixed(2)}
        </div>
      </div>

      <p className="mt-2 text-xs italic text-amber-200/80">↻ {data.analog}</p>
      <p className="mt-2 text-sm leading-relaxed text-neutral-300">
        {data.rationale}
      </p>

      <div className="mt-4 space-y-2">
        {data.breakdown.map((axis) => (
          <div key={axis.label} className="flex items-center gap-3">
            <div className="w-36 shrink-0 text-xs text-neutral-400">
              {axis.label}
            </div>
            <div className="relative h-1.5 flex-1 overflow-hidden rounded bg-white/5">
              <div
                className="h-full rounded bg-gradient-to-r from-amber-400 to-amber-200"
                style={{ width: `${(axis.score / 10) * 100}%` }}
              />
            </div>
            <div className="w-10 text-right font-mono text-xs tabular-nums text-neutral-200">
              {axis.score.toFixed(1)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
