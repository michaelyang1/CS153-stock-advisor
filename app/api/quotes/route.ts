import { NextResponse } from "next/server";

export const revalidate = 30;

export type TickerQuote = {
  symbol: string;
  price: number;
  changePct: number;
};

async function fetchOne(symbol: string): Promise<TickerQuote | null> {
  try {
    const r = await fetch(
      `https://stooq.com/q/l/?s=${symbol.toLowerCase()}.us&f=sd2t2cp&h&e=csv`,
      { next: { revalidate: 30 } },
    );
    if (!r.ok) return null;
    const text = await r.text();
    const lines = text.trim().split("\n");
    if (lines.length < 2) return null;
    const cols = lines[1].split(",");
    // cols: Symbol, Date, Time, Close, Prev
    const close = Number(cols[3]);
    const prev = Number(cols[4]);
    if (!isFinite(close) || !isFinite(prev) || prev === 0) return null;
    const changePct = ((close - prev) / prev) * 100;
    return {
      symbol: symbol.toUpperCase(),
      price: Number(close.toFixed(2)),
      changePct: Number(changePct.toFixed(2)),
    };
  } catch {
    return null;
  }
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

  const settled = await Promise.all(symbols.map(fetchOne));
  const quotes = settled.filter((q): q is TickerQuote => q !== null);

  return NextResponse.json(
    { quotes, fetchedAt: new Date().toISOString() },
    {
      headers: {
        "Cache-Control":
          "public, s-maxage=30, stale-while-revalidate=60",
      },
    },
  );
}
