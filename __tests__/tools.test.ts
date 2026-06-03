import { afterEach, describe, it, expect, vi } from "vitest";
import {
  advisorTools,
  getQuote,
  scoreThesis,
  addToWatchlist,
} from "@/lib/tools";

// The AI SDK's tool().execute is typed to receive a second "options" arg
// (toolCallId, messages). These tools ignore it, so a stub keeps calls simple.
const run = (tool: { execute?: (...a: unknown[]) => unknown }, input: unknown) =>
  (tool.execute as (...a: unknown[]) => Promise<unknown>)(input, {
    toolCallId: "test",
    messages: [],
  });

const allScores = (v: number) => ({
  founder: v, market: v, moat: v, unitEconomics: v,
  narrative: v, asymmetry: v, timing: v,
});

describe("lib/tools — advisorTools registry", () => {
  it("exposes exactly the five tools the chat route + persona expect", () => {
    expect(Object.keys(advisorTools).sort()).toEqual(
      ["addToWatchlist", "getFundamentals", "getQuote", "scoreThesis", "searchNews"],
    );
  });

  it("gives every tool a description and an input schema", () => {
    for (const [name, tool] of Object.entries(advisorTools)) {
      expect(typeof tool.description, `${name} description`).toBe("string");
      expect(tool.description.length).toBeGreaterThan(0);
      expect(tool.inputSchema, `${name} inputSchema`).toBeDefined();
    }
  });
});

describe("lib/tools — scoreThesis rubric math", () => {
  it("uses 7 weighted axes whose weights sum to 1.0", async () => {
    const out = (await run(scoreThesis, {
      asset: "NVIDIA (NVDA)",
      analog: "Nvidia 2022",
      scores: allScores(8),
      rationale: "test",
    })) as { breakdown: Array<{ weight: number }> };
    expect(out.breakdown).toHaveLength(7);
    const sum = out.breakdown.reduce((a, b) => a + b.weight, 0);
    expect(sum).toBeCloseTo(1.0, 5);
  });

  it("computes the weighted total as a dot product of scores and weights", async () => {
    // Only the founder axis (weight 0.20) scores 10 → weighted = 2.0.
    const out = (await run(scoreThesis, {
      asset: "X",
      analog: "Y",
      scores: { ...allScores(0), founder: 10 },
      rationale: "r",
    })) as { weighted: number; band: string };
    expect(out.weighted).toBeCloseTo(2.0, 5);
    expect(out.band).toBe("PASS");
  });

  it.each([
    [10, "HIGH_CONVICTION"],
    [7.5, "HIGH_CONVICTION"], // boundary: >= 7.5
    [7, "WATCHLIST"], //          6.0–7.4
    [6, "WATCHLIST"], //          boundary: >= 6.0
    [5.9, "PASS"], //            < 6.0
    [0, "PASS"],
  ])("maps a uniform score of %s to band %s", async (score, band) => {
    const out = (await run(scoreThesis, {
      asset: "X",
      analog: "Y",
      scores: allScores(score),
      rationale: "r",
    })) as { weighted: number; band: string };
    // Uniform scores → weighted equals the score (weights sum to 1).
    expect(out.weighted).toBeCloseTo(score, 5);
    expect(out.band).toBe(band);
  });
});

describe("lib/tools — addToWatchlist", () => {
  it("echoes the entry and stamps an ISO addedAt", async () => {
    const out = (await run(addToWatchlist, {
      asset: "NVIDIA (NVDA)",
      band: "HIGH_CONVICTION",
      thesis: "AI compute chokepoint",
      catalyst: "Blackwell ramp",
    })) as { asset: string; band: string; addedAt: string };
    expect(out.asset).toBe("NVIDIA (NVDA)");
    expect(out.band).toBe("HIGH_CONVICTION");
    expect(Number.isNaN(Date.parse(out.addedAt))).toBe(false);
  });
});

describe("lib/tools — getQuote (Yahoo parsing)", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("parses price, name, and day-change from a Yahoo chart payload", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          chart: {
            result: [
              {
                meta: {
                  regularMarketPrice: 100,
                  previousClose: 80,
                  fiftyTwoWeekHigh: 120,
                  fiftyTwoWeekLow: 50,
                  currency: "USD",
                  longName: "NVIDIA Corporation",
                  exchangeName: "NMS",
                },
              },
            ],
          },
        }),
      })),
    );
    const out = (await run(getQuote, { ticker: "nvda" })) as {
      ticker: string; name: string; price: number; changePct: number;
    };
    expect(out.ticker).toBe("NVDA"); // upper-cased
    expect(out.name).toBe("NVIDIA Corporation");
    expect(out.price).toBe(100);
    expect(out.changePct).toBeCloseTo(25, 5); // (100-80)/80*100
  });

  it("returns a graceful error object when Yahoo has no data", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, json: async () => ({}) })));
    const out = (await run(getQuote, { ticker: "ZZZZ" })) as {
      ticker: string; error?: string;
    };
    expect(out.ticker).toBe("ZZZZ");
    expect(out.error).toBeDefined();
  });
});
