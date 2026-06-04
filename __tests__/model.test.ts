import { describe, it, expect } from "vitest";
import {
  resolveAdvisorModel,
  DEFAULT_OPENROUTER_MODEL,
  DEFAULT_ANTHROPIC_MODEL,
} from "@/lib/model";

describe("lib/model — advisor provider/model resolution", () => {
  it("prefers OpenRouter with the Claude Sonnet 4.6 slug when the course key is set", () => {
    expect(
      resolveAdvisorModel({ OPENROUTER_CS153_API_KEY: "sk-or-v1-test" }),
    ).toEqual({
      provider: "openrouter",
      modelId: DEFAULT_OPENROUTER_MODEL,
    });
    expect(DEFAULT_OPENROUTER_MODEL).toBe("anthropic/claude-sonnet-4.6");
  });

  it("respects an ADVISOR_MODEL override on OpenRouter", () => {
    expect(
      resolveAdvisorModel({
        OPENROUTER_CS153_API_KEY: "sk-or-v1-test",
        ADVISOR_MODEL: "openai/gpt-5.1",
      }),
    ).toEqual({ provider: "openrouter", modelId: "openai/gpt-5.1" });
  });

  it("falls back to direct Anthropic when no OpenRouter key is configured", () => {
    expect(
      resolveAdvisorModel({ ANTHROPIC_API_KEY: "sk-ant-test" }),
    ).toEqual({
      provider: "anthropic",
      modelId: DEFAULT_ANTHROPIC_MODEL,
    });
  });

  it("respects an ADVISOR_MODEL override on the Anthropic fallback", () => {
    expect(
      resolveAdvisorModel({ ADVISOR_MODEL: "claude-opus-4-5" }),
    ).toEqual({ provider: "anthropic", modelId: "claude-opus-4-5" });
  });

  it("ignores an empty-string OpenRouter key (unset env vars in CI)", () => {
    expect(
      resolveAdvisorModel({ OPENROUTER_CS153_API_KEY: "" }).provider,
    ).toBe("anthropic");
  });
});
