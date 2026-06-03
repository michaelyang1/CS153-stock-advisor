import { describe, it, expect } from "vitest";
import { ADVISOR_NAME, PERSONA_SYSTEM_PROMPT } from "@/lib/persona";
import { advisorTools } from "@/lib/tools";

describe("lib/persona — system prompt contract", () => {
  it("names the advisor Atlas Frontier", () => {
    expect(ADVISOR_NAME).toBe("Atlas Frontier");
    expect(PERSONA_SYSTEM_PROMPT).toContain(ADVISOR_NAME);
  });

  it("states the 10x–100x asymmetric mandate", () => {
    expect(PERSONA_SYSTEM_PROMPT).toMatch(/10x.100x/);
  });

  it("describes all seven rubric axes used by the scorecard", () => {
    for (const axis of [
      "Founder & Team",
      "Market Size & S-curve",
      "Moat / Monopoly Power",
      "Unit Economics",
      "Narrative Velocity",
      "Asymmetric Payoff",
      "Timing Catalyst",
    ]) {
      expect(PERSONA_SYSTEM_PROMPT).toContain(axis);
    }
  });

  it("references every tool the model is given", () => {
    for (const toolName of Object.keys(advisorTools)) {
      expect(PERSONA_SYSTEM_PROMPT).toContain(toolName);
    }
  });

  it("includes the per-conversation disclaimer line", () => {
    expect(PERSONA_SYSTEM_PROMPT).toContain("Not investment advice");
  });
});
