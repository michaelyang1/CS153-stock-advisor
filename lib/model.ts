// Resolves which LLM powers the Atlas advisor. Prefers OpenRouter (course
// inference credits) whenever its key is configured; falls back to a direct
// Anthropic connection otherwise. Kept as a pure function over an env object
// so the selection logic is unit-testable without stubbing process.env.

export const DEFAULT_OPENROUTER_MODEL = "anthropic/claude-sonnet-4.6";
export const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-5";

export type AdvisorModelConfig = {
  provider: "openrouter" | "anthropic";
  modelId: string;
};

export function resolveAdvisorModel(
  env: Record<string, string | undefined> = process.env,
): AdvisorModelConfig {
  if (env.OPENROUTER_CS153_API_KEY) {
    return {
      provider: "openrouter",
      modelId: env.ADVISOR_MODEL ?? DEFAULT_OPENROUTER_MODEL,
    };
  }
  return {
    provider: "anthropic",
    modelId: env.ADVISOR_MODEL ?? DEFAULT_ANTHROPIC_MODEL,
  };
}
