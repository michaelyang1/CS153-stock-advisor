import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScoringRubric } from "@/components/ScoringRubric";
import { RUBRIC_AXES, CONVICTION_BANDS } from "@/lib/rubric";

describe("<ScoringRubric>", () => {
  it("renders the panel header and axis count", () => {
    render(<ScoringRubric />);
    expect(screen.getByText("Scoring Rubric")).toBeInTheDocument();
    expect(
      screen.getByText(`${RUBRIC_AXES.length} axes · weighted`),
    ).toBeInTheDocument();
  });

  it("lists every rubric axis with its weight as a percentage", () => {
    render(<ScoringRubric />);
    for (const axis of RUBRIC_AXES) {
      expect(screen.getByText(axis.label)).toBeInTheDocument();
    }
    // weights are shown as whole percentages (0.20 -> "20%")
    expect(screen.getAllByText("20%").length).toBe(2); // founder + market
    expect(screen.getAllByText("15%").length).toBe(2); // moat + unit economics
    expect(screen.getAllByText("10%").length).toBe(3); // narrative + asymmetry + timing
  });

  it("renders the three conviction bands with their thresholds", () => {
    render(<ScoringRubric />);
    expect(screen.getByText("High Conviction")).toBeInTheDocument();
    expect(screen.getByText("Watchlist")).toBeInTheDocument();
    expect(screen.getByText("Pass")).toBeInTheDocument();
    expect(
      screen.getByText(`≥ ${CONVICTION_BANDS.HIGH_CONVICTION.toFixed(1)}`),
    ).toBeInTheDocument();
    // Watchlist "≥ 6.0" and Pass "< 6.0" share the same number but differ by operator
    expect(
      screen.getByText(`≥ ${CONVICTION_BANDS.WATCHLIST.toFixed(1)}`),
    ).toBeInTheDocument();
    expect(
      screen.getByText(`< ${CONVICTION_BANDS.WATCHLIST.toFixed(1)}`),
    ).toBeInTheDocument();
  });
});
