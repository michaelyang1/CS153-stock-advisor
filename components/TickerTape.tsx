"use client";

import { useEffect, useState } from "react";

type TickerQuote = {
  symbol: string;
  price: number;
  changePct: number;
};

type Props = {
  side: "left" | "right";
  symbols: string[];
  /** Seconds for one full loop. Default 70. */
  durationSec?: number;
};

export function TickerTape({ side, symbols, durationSec = 70 }: Props) {
  const [quotes, setQuotes] = useState<TickerQuote[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const r = await fetch(
          `/api/quotes?symbols=${encodeURIComponent(symbols.join(","))}`,
          { cache: "no-store" },
        );
        if (!r.ok) return;
        const json = (await r.json()) as { quotes: TickerQuote[] };
        if (!cancelled) setQuotes(json.quotes);
      } catch {
        /* swallow */
      }
    };
    load();
    const id = setInterval(load, 45_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [symbols]);

  if (quotes.length === 0) return null;

  const loop = [...quotes, ...quotes];

  return (
    <aside
      className="pointer-events-none fixed top-16 bottom-0 hidden w-[88px] lg:block"
      style={
        side === "left"
          ? { left: "max(0px, calc(50vw - 640px - 96px))" }
          : { right: "max(0px, calc(50vw - 640px - 96px))" }
      }
      aria-hidden="true"
    >
      <div className="tape-fade absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-x-2 top-0 flex flex-col gap-2 will-change-transform"
          style={{
            animationName: "tape-scroll",
            animationDuration: `${durationSec}s`,
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
          }}
        >
          {loop.map((q, i) => (
            <TickerCard key={`${q.symbol}-${i}`} q={q} />
          ))}
        </div>
      </div>
    </aside>
  );
}

function TickerCard({ q }: { q: TickerQuote }) {
  const up = q.changePct >= 0;
  return (
    <div className="rounded-md border border-white/5 bg-black/40 px-2 py-2 backdrop-blur">
      <div className="font-mono text-[11px] font-semibold tracking-tight text-neutral-100">
        {q.symbol}
      </div>
      <div className="mt-0.5 font-mono text-[10px] tabular-nums text-neutral-300">
        {q.price.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </div>
      <div
        className={`mt-0.5 flex items-center gap-0.5 font-mono text-[9px] tabular-nums ${
          up ? "text-emerald-400" : "text-rose-400"
        }`}
      >
        <span>{up ? "▲" : "▼"}</span>
        <span>
          {up ? "+" : ""}
          {q.changePct.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}
