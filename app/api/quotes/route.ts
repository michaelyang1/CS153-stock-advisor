import { NextResponse } from "next/server";

export const revalidate = 30;

export type TickerQuote = {
  symbol: string;
  price: number;
  changePct: number;
};

const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

async function fetchBatch(symbols: string[]): Promise<TickerQuote[]> {
  // Stooq batches symbols with a literal `+` separator; do NOT URL-encode the
  // separator or stooq treats it as one big symbol and returns N/D rows.
  const list = symbols
    .map((s) => `${encodeURIComponent(s.toLowerCase())}.us`)
    .join("+");
  const r = await fetch(
    `https://stooq.com/q/l/?s=${list}&f=sd2t2cp&h&e=csv`,
    {
      headers: { "User-Agent": BROWSER_UA, Accept: "text/csv,*/*" },
      next: { revalidate: 30 },
    },
  );
  if (!r.ok) return [];
  const text = await r.text();
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  const out: TickerQuote[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    // cols: Symbol, Date, Time, Close, Prev
    const rawSymbol = cols[0]?.trim();
    if (!rawSymbol) continue;
    const symbol = rawSymbol.replace(/\.US$/i, "").toUpperCase();
    const close = Number(cols[3]);
    const prev = Number(cols[4]);
    if (!isFinite(close) || !isFinite(prev) || prev === 0) continue;
    const changePct = ((close - prev) / prev) * 100;
    out.push({
      symbol,
      price: Number(close.toFixed(2)),
      changePct: Number(changePct.toFixed(2)),
    });
  }
  return out;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const symbolsParam = url.searchParams.get("symbols") ?? "";
  const symbols = symbolsParam
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean)
    .slice(0, 30);

  if (symbols.length === 0) {
    return NextResponse.json({ quotes: [] });
  }

  let quotes: TickerQuote[] = [];
  try {
    quotes = await fetchBatch(symbols);
  } catch {
    quotes = [];
  }

  return NextResponse.json(
    { quotes, fetchedAt: new Date().toISOString() },
    {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    },
  );
}
