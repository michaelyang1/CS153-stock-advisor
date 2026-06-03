import { describe, it, expect } from "vitest";
import { RUBRIC_AXES, CONVICTION_BANDS } from "@/lib/rubric";

describe("lib/rubric — shared rubric definition", () => {
  it("has exactly 7 axes with unique keys", () => {
    expect(RUBRIC_AXES).toHaveLength(7);
    const keys = RUBRIC_AXES.map((a) => a.key);
    expect(new Set(keys).size).toBe(7);
  });

  it("has weights that sum to 1.0 (each strictly between 0 and 1)", () => {
    const sum = RUBRIC_AXES.reduce((acc, a) => acc + a.weight, 0);
    expect(sum).toBeCloseTo(1.0, 5);
    for (const a of RUBRIC_AXES) {
      expect(a.weight).toBeGreaterThan(0);
      expect(a.weight).toBeLessThan(1);
    }
  });

  it("gives every axis a non-empty human label", () => {
    for (const a of RUBRIC_AXES) {
      expect(typeof a.label).toBe("string");
      expect(a.label.length).toBeGreaterThan(0);
    }
  });

  it("exposes the exact axis keys scoreThesis scores against", () => {
    expect(RUBRIC_AXES.map((a) => a.key).sort()).toEqual(
      [
        "asymmetry",
        "founder",
        "market",
        "moat",
        "narrative",
        "timing",
        "unitEconomics",
      ].sort(),
    );
  });

  it("orders conviction bands HIGH_CONVICTION > WATCHLIST with the documented thresholds", () => {
    expect(CONVICTION_BANDS.HIGH_CONVICTION).toBe(7.5);
    expect(CONVICTION_BANDS.WATCHLIST).toBe(6.0);
    expect(CONVICTION_BANDS.HIGH_CONVICTION).toBeGreaterThan(
      CONVICTION_BANDS.WATCHLIST,
    );
  });
});
