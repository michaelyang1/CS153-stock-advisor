import { describe, it, expect } from "vitest";
import {
  SNAPSHOT,
  SNAPSHOT_DATE,
  snapshotFor,
} from "@/lib/tickerSnapshot";

describe("lib/tickerSnapshot — SNAPSHOT integrity", () => {
  const entries = Object.entries(SNAPSHOT);

  it("has a non-empty baked snapshot", () => {
    expect(entries.length).toBeGreaterThan(0);
  });

  it("keys each entry by its own (uppercase) symbol", () => {
    for (const [key, quote] of entries) {
      expect(quote.symbol).toBe(key);
      expect(key).toBe(key.toUpperCase());
    }
  });

  it("stores finite, positive prices and finite change percentages", () => {
    for (const [, quote] of entries) {
      expect(Number.isFinite(quote.price)).toBe(true);
      expect(quote.price).toBeGreaterThan(0);
      expect(Number.isFinite(quote.changePct)).toBe(true);
    }
  });

  it("covers the symbols the home page tapes render", () => {
    // Mirrors LEFT_TICKERS + RIGHT_TICKERS in app/page.tsx so the tapes always
    // have a seed even before /api/quotes responds.
    const required = [
      "NVDA", "AAPL", "MSFT", "GOOGL", "META", "AMZN", "TSLA", "AVGO",
      "AMD", "ORCL", "PLTR", "COIN", "TSM", "ASML", "ANET", "NFLX",
      "MU", "SMCI", "ARM", "CRWV",
    ];
    for (const sym of required) {
      expect(SNAPSHOT[sym], `missing snapshot for ${sym}`).toBeDefined();
    }
  });

  it("exposes SNAPSHOT_DATE as an ISO date", () => {
    expect(SNAPSHOT_DATE).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("lib/tickerSnapshot — snapshotFor()", () => {
  it("returns quotes for known symbols, preserving order", () => {
    const out = snapshotFor(["NVDA", "AAPL"]);
    expect(out.map((q) => q.symbol)).toEqual(["NVDA", "AAPL"]);
  });

  it("is case-insensitive on the input symbols", () => {
    expect(snapshotFor(["nvda"])).toEqual([SNAPSHOT.NVDA]);
  });

  it("silently drops unknown symbols", () => {
    expect(snapshotFor(["NVDA", "NOPE", "ZZZZ"])).toEqual([SNAPSHOT.NVDA]);
  });

  it("returns an empty array when nothing matches", () => {
    expect(snapshotFor(["NOPE"])).toEqual([]);
    expect(snapshotFor([])).toEqual([]);
  });
});
