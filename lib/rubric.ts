// Single source of truth for the 7-axis conviction rubric. Shared by the
// `scoreThesis` tool (lib/tools.ts) and the Scoring Rubric panel
// (components/ScoringRubric.tsx) so the weights and band thresholds the model
// applies can never drift from what the UI advertises.

export const RUBRIC_AXES = [
  { key: "founder", label: "Founder & Team", weight: 0.2 },
  { key: "market", label: "Market Size & S-curve", weight: 0.2 },
  { key: "moat", label: "Moat / Monopoly Power", weight: 0.15 },
  { key: "unitEconomics", label: "Unit Economics", weight: 0.15 },
  { key: "narrative", label: "Narrative Velocity", weight: 0.1 },
  { key: "asymmetry", label: "Asymmetric Payoff", weight: 0.1 },
  { key: "timing", label: "Timing Catalyst", weight: 0.1 },
] as const;

export type RubricAxisKey = (typeof RUBRIC_AXES)[number]["key"];

// Thresholds applied to the weighted 0–10 score to assign a conviction band.
export const CONVICTION_BANDS = {
  HIGH_CONVICTION: 7.5,
  WATCHLIST: 6.0,
} as const;
