import { NextResponse } from "next/server";

export const revalidate = 30;

export type TickerQuote = {
  symbol: string;
  price: number;
  changePct: number;
};

type YahooChartResponse = {
  chart?: {
    result?: Array<{
      meta?: {
        regularMarketPrice?: number;
        chartPreviousClose?: number;
        previousClose?: number;
      };
    }> | null;
  };
};

async function fetchOne(symbol: string): Promise<TickerQuote | null> {
  try {
    const r = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Accept: "application/json,text/plain,*/*",
        },
        next: { revalidate: 30 },
      },
    );
    if (!r.ok) return null;
    const json = (await r.json()) as YahooChartResponse;
    const meta = json.chart?.result?.[0]?.meta;
    if (!meta) return null;
    const close = meta.regularMarketPrice;
    const prev = meta.chartPreviousClose ?? meta.previousClose;
    if (
      typeof close !== "number" ||
      typeof prev !== "number" ||
      !isFinite(close) ||
      !isFinite(prev) ||
      prev === 0
    ) {
      return null;
    }
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
