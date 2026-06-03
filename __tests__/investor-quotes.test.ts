import { describe, it, expect } from "vitest";
import { INVESTOR_QUOTES } from "@/lib/quotes";

describe("lib/quotes — INVESTOR_QUOTES", () => {
  it("is a non-empty list", () => {
    expect(INVESTOR_QUOTES.length).toBeGreaterThan(0);
  });

  it("fills author, role, quote, and source for every entry", () => {
    for (const [i, q] of INVESTOR_QUOTES.entries()) {
      for (const field of ["author", "role", "quote", "source"] as const) {
        expect(typeof q[field], `entry ${i} ${field} should be a string`).toBe(
          "string",
        );
        expect(q[field].trim().length, `entry ${i} ${field} is empty`).toBeGreaterThan(0);
      }
    }
  });
});
