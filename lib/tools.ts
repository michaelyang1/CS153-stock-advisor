import { tool } from "ai";
import { z } from "zod";

const YF_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
  Accept: "application/json,text/plain,*/*",
};

async function yfFetch<T>(url: string): Promise<T | null> {
  try {
    const r = await fetch(url, { headers: YF_HEADERS, cache: "no-store" });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  }
}

export const getQuote = tool({
  description:
    "Get real-time price, day change, market cap, and 52-week range for a public ticker.",
  inputSchema: z.object({
    ticker: z
      .string()
      .describe("Ticker symbol, e.g. NVDA, TSLA, PLTR, COIN."),
  }),
  execute: async ({ ticker }) => {
    const sym = ticker.toUpperCase();
    const data = await yfFetch<{
      chart: {
        result?: Array<{
          meta: {
            regularMarketPrice: number;
            previousClose: number;
            fiftyTwoWeekHigh: number;
            fiftyTwoWeekLow: number;
            currency: string;
            longName?: string;
            shortName?: string;
            exchangeName: string;
          };
        }>;
      };
    }>(`https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=1d`);

    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta) {
      return {
        ticker: sym,
        error: "Quote unavailable. Treat as private/illiquid or check the symbol.",
      };
    }
    const price = meta.regularMarketPrice;
    const prev = meta.previousClose;
    const changePct = prev ? ((price - prev) / prev) * 100 : 0;
    return {
      ticker: sym,
      name: meta.longName ?? meta.shortName ?? sym,
      exchange: meta.exchangeName,
      currency: meta.currency,
      price: Number(price.toFixed(2)),
      previousClose: prev,
      changePct: Number(changePct.toFixed(2)),
      fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: meta.fiftyTwoWeekLow,
    };
  },
});

export const getFundamentals = tool({
  description:
    "Get key fundamentals for a public ticker: market cap, P/E, revenue growth, gross margin, profit margin.",
  inputSchema: z.object({
    ticker: z.string().describe("Ticker symbol."),
  }),
  execute: async ({ ticker }) => {
    const sym = ticker.toUpperCase();
    const data = await yfFetch<{
      quoteSummary?: {
        result?: Array<{
          summaryDetail?: {
            marketCap?: { raw: number };
            trailingPE?: { raw: number };
            forwardPE?: { raw: number };
          };
          financialData?: {
            revenueGrowth?: { raw: number };
            grossMargins?: { raw: number };
            profitMargins?: { raw: number };
            operatingMargins?: { raw: number };
            returnOnEquity?: { raw: number };
            totalRevenue?: { raw: number };
          };
          defaultKeyStatistics?: {
            enterpriseValue?: { raw: number };
            priceToSalesTrailing12Months?: { raw: number };
          };
        }>;
      };
    }>(
      `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${sym}?modules=summaryDetail,financialData,defaultKeyStatistics`,
    );

    const r = data?.quoteSummary?.result?.[0];
    if (!r) {
      return {
        ticker: sym,
        error: "Fundamentals unavailable. Likely private or non-US listing.",
      };
    }
    const pct = (v?: { raw: number }) =>
      v?.raw !== undefined ? Number((v.raw * 100).toFixed(2)) : null;
    return {
      ticker: sym,
      marketCapUSD: r.summaryDetail?.marketCap?.raw ?? null,
      enterpriseValueUSD: r.defaultKeyStatistics?.enterpriseValue?.raw ?? null,
      trailingPE: r.summaryDetail?.trailingPE?.raw ?? null,
      forwardPE: r.summaryDetail?.forwardPE?.raw ?? null,
      priceToSalesTTM: r.defaultKeyStatistics?.priceToSalesTrailing12Months?.raw ?? null,
      totalRevenueUSD: r.financialData?.totalRevenue?.raw ?? null,
      revenueGrowthPct: pct(r.financialData?.revenueGrowth),
      grossMarginPct: pct(r.financialData?.grossMargins),
      operatingMarginPct: pct(r.financialData?.operatingMargins),
      profitMarginPct: pct(r.financialData?.profitMargins),
      returnOnEquityPct: pct(r.financialData?.returnOnEquity),
    };
  },
});

export const searchNews = tool({
  description:
    "Search recent news headlines for a company, ticker, or theme. Returns up to 6 articles.",
  inputSchema: z.object({
    query: z.string().describe("Search query, e.g. 'NVDA earnings' or 'humanoid robotics'."),
  }),
  execute: async ({ query }) => {
    const data = await yfFetch<{
      news?: Array<{
        title: string;
        publisher: string;
        link: string;
        providerPublishTime: number;
      }>;
    }>(`https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&newsCount=6&quotesCount=0`);

    const items = (data?.news ?? []).slice(0, 6).map((n) => ({
      title: n.title,
      publisher: n.publisher,
      url: n.link,
      publishedAt: n.providerPublishTime
        ? new Date(n.providerPublishTime * 1000).toISOString()
        : null,
    }));
    return { query, count: items.length, items };
  },
});

const RUBRIC_AXES = [
  { key: "founder", label: "Founder & Team", weight: 0.20 },
  { key: "market", label: "Market Size & S-curve", weight: 0.20 },
  { key: "moat", label: "Moat / Monopoly Power", weight: 0.15 },
  { key: "unitEconomics", label: "Unit Economics", weight: 0.15 },
  { key: "narrative", label: "Narrative Velocity", weight: 0.10 },
  { key: "asymmetry", label: "Asymmetric Payoff", weight: 0.10 },
  { key: "timing", label: "Timing Catalyst", weight: 0.10 },
] as const;

export const scoreThesis = tool({
  description:
    "Score an investment thesis on the 7-axis frontier rubric. Returns the weighted total and a conviction band. The UI renders this as a scorecard, so call this whenever you've formed a view on a name.",
  inputSchema: z.object({
    asset: z.string().describe("Company name + ticker if public, e.g. 'NVIDIA (NVDA)'."),
    analog: z
      .string()
      .describe("Historical analog this rhymes with, e.g. 'Nvidia 2022 pre-LLM unlock'."),
    scores: z.object({
      founder: z.number().min(0).max(10),
      market: z.number().min(0).max(10),
      moat: z.number().min(0).max(10),
      unitEconomics: z.number().min(0).max(10),
      narrative: z.number().min(0).max(10),
      asymmetry: z.number().min(0).max(10),
      timing: z.number().min(0).max(10),
    }),
    rationale: z
      .string()
      .describe("2-3 sentence punchy thesis statement in the advisor's voice."),
  }),
  execute: async ({ asset, analog, scores, rationale }) => {
    const total = RUBRIC_AXES.reduce(
      (acc, a) => acc + (scores as Record<string, number>)[a.key] * a.weight,
      0,
    );
    const weighted = Number(total.toFixed(2));
    const band =
      weighted >= 7.5
        ? "HIGH_CONVICTION"
        : weighted >= 6.0
          ? "WATCHLIST"
          : "PASS";
    return {
      asset,
      analog,
      rationale,
      scores,
      weighted,
      band,
      breakdown: RUBRIC_AXES.map((a) => ({
        label: a.label,
        score: (scores as Record<string, number>)[a.key],
        weight: a.weight,
      })),
    };
  },
});

export const addToWatchlist = tool({
  description:
    "Add a name to the user's frontier watchlist. Use this whenever conviction is HIGH_CONVICTION or WATCHLIST. The UI persists these client-side.",
  inputSchema: z.object({
    asset: z.string().describe("Company name + ticker, e.g. 'NVIDIA (NVDA)'."),
    band: z.enum(["HIGH_CONVICTION", "WATCHLIST"]),
    thesis: z.string().describe("One-sentence pitch."),
    catalyst: z.string().describe("The specific near-term catalyst to monitor."),
  }),
  execute: async ({ asset, band, thesis, catalyst }) => {
    return { asset, band, thesis, catalyst, addedAt: new Date().toISOString() };
  },
});

export const advisorTools = {
  getQuote,
  getFundamentals,
  searchNews,
  scoreThesis,
  addToWatchlist,
};
