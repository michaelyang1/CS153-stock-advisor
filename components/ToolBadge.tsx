"use client";

const LABELS: Record<string, string> = {
  "tool-getQuote": "Pulling quote",
  "tool-getFundamentals": "Reading fundamentals",
  "tool-searchNews": "Scanning the tape",
  "tool-scoreThesis": "Scoring conviction",
  "tool-addToWatchlist": "Adding to watchlist",
};

type ToolPart = {
  type: string;
  state?: string;
  input?: unknown;
  output?: unknown;
};

export function ToolBadge({ part }: { part: ToolPart }) {
  const label = LABELS[part.type] ?? part.type.replace("tool-", "");
  const running =
    part.state === "input-streaming" || part.state === "input-available";
  const errored = part.state === "output-error";

  const detail = (() => {
    const input = part.input as Record<string, unknown> | undefined;
    if (!input) return null;
    if (typeof input.ticker === "string") return input.ticker;
    if (typeof input.query === "string") return input.query;
    if (typeof input.asset === "string") return input.asset;
    return null;
  })();

  return (
    <div
      className={`mt-1 inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[10px] tracking-wide ${
        errored
          ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
          : running
            ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
            : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${
          running ? "ticker-pulse bg-amber-400" : errored ? "bg-rose-400" : "bg-emerald-400"
        }`}
      />
      <span>{label}</span>
      {detail && <span className="text-neutral-400">· {detail}</span>}
    </div>
  );
}
