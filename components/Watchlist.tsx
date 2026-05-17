"use client";

export type WatchlistEntry = {
  asset: string;
  band: "HIGH_CONVICTION" | "WATCHLIST";
  thesis: string;
  catalyst: string;
  addedAt: string;
};

export function Watchlist({
  entries,
  onClear,
}: {
  entries: WatchlistEntry[];
  onClear: () => void;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-neutral-900/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">
          Frontier Watchlist
        </div>
        {entries.length > 0 && (
          <button
            onClick={onClear}
            className="text-[10px] uppercase tracking-wider text-neutral-500 transition hover:text-neutral-200"
          >
            Clear
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <p className="text-xs text-neutral-500">
          No positions tracked. Ask Atlas about a name with 10x potential.
        </p>
      ) : (
        <ul className="space-y-3">
          {entries.map((e) => (
            <li
              key={e.asset + e.addedAt}
              className="rounded-md border border-white/5 bg-black/30 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="font-medium text-neutral-100">{e.asset}</div>
                <span
                  className={`rounded px-1.5 py-0.5 text-[9px] font-semibold tracking-wider ${
                    e.band === "HIGH_CONVICTION"
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "bg-amber-500/15 text-amber-300"
                  }`}
                >
                  {e.band === "HIGH_CONVICTION" ? "HIGH" : "WATCH"}
                </span>
              </div>
              <p className="mt-1 text-xs text-neutral-300">{e.thesis}</p>
              <p className="mt-1.5 text-[11px] text-neutral-500">
                <span className="text-amber-400/80">Catalyst:</span> {e.catalyst}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
