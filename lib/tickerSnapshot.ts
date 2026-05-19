// Build-time snapshot of ticker quotes. Shared between the /api/quotes route
// (last-resort fallback when Stooq rate-limits Vercel's datacenter IPs) and
// the client TickerTape component (so the tapes always have something to
// render even before the first /api/quotes response lands or if the request
// fails). Values captured from Stooq on SNAPSHOT_DATE and rounded to two
// decimals — they are decorative fallback only.

export type TickerSnapshotQuote = {
  symbol: string;
  price: number;
  changePct: number;
};

export const SNAPSHOT_DATE = "2026-05-18";

export const SNAPSHOT: Record<string, TickerSnapshotQuote> = {
  NVDA: { symbol: "NVDA", price: 222.32, changePct: -1.33 },
  AAPL: { symbol: "AAPL", price: 297.84, changePct: -0.8 },
  MSFT: { symbol: "MSFT", price: 423.54, changePct: 0.38 },
  GOOGL: { symbol: "GOOGL", price: 396.94, changePct: 0.04 },
  META: { symbol: "META", price: 611.21, changePct: -0.49 },
  AMZN: { symbol: "AMZN", price: 264.86, changePct: 0.27 },
  TSLA: { symbol: "TSLA", price: 409.99, changePct: -2.9 },
  AVGO: { symbol: "AVGO", price: 420.71, changePct: -1.05 },
  AMD: { symbol: "AMD", price: 420.99, changePct: -0.73 },
  ORCL: { symbol: "ORCL", price: 186.61, changePct: -3.29 },
  PLTR: { symbol: "PLTR", price: 135.14, changePct: 0.86 },
  COIN: { symbol: "COIN", price: 189.44, changePct: -3.06 },
  TSM: { symbol: "TSM", price: 395.95, changePct: -2.08 },
  ASML: { symbol: "ASML", price: 1472.39, changePct: -1.96 },
  ANET: { symbol: "ANET", price: 141.71, changePct: -0.18 },
  NFLX: { symbol: "NFLX", price: 89.65, changePct: 3.02 },
  MU: { symbol: "MU", price: 681.54, changePct: -5.95 },
  SMCI: { symbol: "SMCI", price: 30.85, changePct: -0.61 },
  ARM: { symbol: "ARM", price: 215.12, changePct: 2.85 },
  CRWV: { symbol: "CRWV", price: 103.77, changePct: -3.29 },
};

export function snapshotFor(symbols: string[]): TickerSnapshotQuote[] {
  const out: TickerSnapshotQuote[] = [];
  for (const s of symbols) {
    const q = SNAPSHOT[s.toUpperCase()];
    if (q) out.push(q);
  }
  return out;
}
