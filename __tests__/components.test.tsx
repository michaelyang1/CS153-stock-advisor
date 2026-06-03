import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Scorecard, type ScorecardData } from "@/components/Scorecard";
import { Watchlist, type WatchlistEntry } from "@/components/Watchlist";
import { ThesisLibrary } from "@/components/ThesisLibrary";
import { QuoteWall } from "@/components/QuoteWall";
import { TickerTape } from "@/components/TickerTape";
import { ToolBadge } from "@/components/ToolBadge";
import { FRONTIER_THESES } from "@/lib/frontier-theses";
import { INVESTOR_QUOTES } from "@/lib/quotes";
import { SNAPSHOT } from "@/lib/tickerSnapshot";

describe("<Scorecard>", () => {
  const data: ScorecardData = {
    asset: "NVIDIA (NVDA)",
    analog: "Nvidia 2022 pre-LLM unlock",
    rationale: "The single chokepoint of the AI economy.",
    weighted: 8.5,
    band: "HIGH_CONVICTION",
    breakdown: [
      { label: "Founder & Team", score: 9, weight: 0.2 },
      { label: "Market Size & S-curve", score: 9, weight: 0.2 },
      { label: "Moat / Monopoly Power", score: 8, weight: 0.15 },
      { label: "Unit Economics", score: 8, weight: 0.15 },
      { label: "Narrative Velocity", score: 9, weight: 0.1 },
      { label: "Asymmetric Payoff", score: 7, weight: 0.1 },
      { label: "Timing Catalyst", score: 8, weight: 0.1 },
    ],
  };

  it("renders the asset, conviction band, weighted score, analog, and rationale", () => {
    render(<Scorecard data={data} />);
    expect(screen.getByText("NVIDIA (NVDA)")).toBeInTheDocument();
    expect(screen.getByText(/HIGH CONVICTION/).textContent).toContain("8.50");
    expect(screen.getByText(/Nvidia 2022 pre-LLM unlock/)).toBeInTheDocument();
    expect(screen.getByText(/chokepoint of the AI economy/)).toBeInTheDocument();
  });

  it("renders all seven rubric axes", () => {
    render(<Scorecard data={data} />);
    for (const axis of data.breakdown) {
      expect(screen.getByText(axis.label)).toBeInTheDocument();
    }
  });
});

describe("<Watchlist>", () => {
  it("shows the empty state and hides Clear when there are no entries", () => {
    render(<Watchlist entries={[]} onClear={() => {}} />);
    expect(screen.getByText(/No positions tracked/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /clear/i })).toBeNull();
  });

  it("renders an entry and fires onClear", () => {
    const onClear = vi.fn();
    const entry: WatchlistEntry = {
      asset: "CoreWeave (CRWV)",
      band: "HIGH_CONVICTION",
      thesis: "Sovereign-scale GPU cloud.",
      catalyst: "Hyperscaler capacity crunch.",
      addedAt: "2026-06-02T00:00:00.000Z",
    };
    render(<Watchlist entries={[entry]} onClear={onClear} />);
    expect(screen.getByText("CoreWeave (CRWV)")).toBeInTheDocument();
    expect(screen.getByText("HIGH")).toBeInTheDocument(); // HIGH_CONVICTION badge
    expect(screen.getByText(/Sovereign-scale GPU cloud/)).toBeInTheDocument();
    expect(screen.getByText(/Hyperscaler capacity crunch/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /clear/i }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});

describe("<ThesisLibrary>", () => {
  it("renders every historical analog and its multiple", () => {
    render(<ThesisLibrary onPick={() => {}} />);
    for (const t of FRONTIER_THESES) {
      expect(screen.getByText(t.asset)).toBeInTheDocument();
      expect(screen.getByText(t.multiple)).toBeInTheDocument();
    }
  });

  it("calls onPick with a prompt referencing the chosen analog", () => {
    const onPick = vi.fn();
    render(<ThesisLibrary onPick={onPick} />);
    const first = FRONTIER_THESES[0];
    fireEvent.click(screen.getByText(first.asset).closest("button")!);
    expect(onPick).toHaveBeenCalledTimes(1);
    const prompt = onPick.mock.calls[0][0] as string;
    expect(prompt).toContain(first.asset);
    expect(prompt).toContain(first.era);
  });
});

describe("<QuoteWall>", () => {
  it("renders the investor quotes with a live entry count", () => {
    render(<QuoteWall />);
    expect(screen.getByText("Growth Investor Quotes")).toBeInTheDocument();
    expect(screen.getByText(`${INVESTOR_QUOTES.length} entries`)).toBeInTheDocument();
    expect(
      screen.getAllByText(new RegExp(INVESTOR_QUOTES[0].author)).length,
    ).toBeGreaterThan(0);
  });
});

describe("<TickerTape>", () => {
  it("renders the baked snapshot seed (symbol + formatted price), duplicated for the marquee loop", () => {
    render(<TickerTape side="left" symbols={["NVDA"]} />);
    // The component duplicates quotes ([...quotes, ...quotes]) for a seamless loop.
    expect(screen.getAllByText("NVDA")).toHaveLength(2);
    expect(screen.getAllByText("222.32").length).toBeGreaterThan(0);
  });

  it("renders a down arrow + negative change for a falling name", () => {
    render(<TickerTape side="left" symbols={["NVDA"]} />); // snapshot -1.33%
    expect(screen.getAllByText(/-1\.33%/).length).toBeGreaterThan(0);
    expect(screen.getAllByText("▼").length).toBeGreaterThan(0);
  });

  it("renders an up arrow + positive change for a rising name", () => {
    render(<TickerTape side="right" symbols={["NFLX"]} />); // snapshot +3.02%
    expect(SNAPSHOT.NFLX.changePct).toBeGreaterThan(0); // guards the fixture
    expect(screen.getAllByText(/\+3\.02%/).length).toBeGreaterThan(0);
    expect(screen.getAllByText("▲").length).toBeGreaterThan(0);
  });
});

describe("<ToolBadge>", () => {
  it("maps a known tool type to its human label and shows the ticker detail", () => {
    render(
      <ToolBadge
        part={{ type: "tool-getQuote", state: "output-available", input: { ticker: "NVDA" } }}
      />,
    );
    expect(screen.getByText("Pulling quote")).toBeInTheDocument();
    expect(screen.getByText(/NVDA/)).toBeInTheDocument();
  });

  it("falls back to the de-prefixed type for unknown tools", () => {
    render(<ToolBadge part={{ type: "tool-mystery" }} />);
    expect(screen.getByText("mystery")).toBeInTheDocument();
  });
});
