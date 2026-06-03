import { describe, it, expect } from "vitest";
import { FRONTIER_THESES } from "@/lib/frontier-theses";

describe("lib/frontier-theses — FRONTIER_THESES", () => {
  it("is a non-empty list", () => {
    expect(FRONTIER_THESES.length).toBeGreaterThan(0);
  });

  it("has unique ids", () => {
    const ids = FRONTIER_THESES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("fills every required field with non-empty text", () => {
    for (const t of FRONTIER_THESES) {
      for (const field of [
        "id", "asset", "era", "multiple", "trigger", "setup", "lesson",
      ] as const) {
        expect(typeof t[field], `${t.id}.${field} should be a string`).toBe(
          "string",
        );
        expect(t[field].trim().length, `${t.id}.${field} is empty`).toBeGreaterThan(0);
      }
    }
  });

  it("includes the canonical analogs the UI advertises", () => {
    const ids = FRONTIER_THESES.map((t) => t.id);
    for (const id of [
      "nvda-2022", "tsla-2019", "aapl-2007", "btc-2012", "amzn-2002",
    ]) {
      expect(ids).toContain(id);
    }
  });

  it("keeps NVDA's multiple grounded at ~10x (matches the home headline copy)", () => {
    const nvda = FRONTIER_THESES.find((t) => t.id === "nvda-2022");
    expect(nvda?.multiple).toMatch(/10x/);
  });
});
