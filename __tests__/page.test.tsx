import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { INVESTOR_QUOTES } from "@/lib/quotes";

// <Home> calls useChat() from @ai-sdk/react, which opens a streaming
// connection. Stub it so the page renders deterministically with no backend.
vi.mock("@ai-sdk/react", () => ({
  useChat: () => ({
    messages: [],
    sendMessage: vi.fn(),
    status: "ready",
    error: undefined,
    setMessages: vi.fn(),
    clearError: vi.fn(),
  }),
}));

import Home from "@/app/page";

describe("app/page <Home> — landing experience", () => {
  it("renders the Atlas Frontier header and 10x–100x mandate", () => {
    render(<Home />);
    expect(screen.getByText("ATLAS FRONTIER")).toBeInTheDocument();
    expect(screen.getByText(/10x.100x bets only/i)).toBeInTheDocument();
  });

  it("shows the reframed briefing headline (not the old 'Nvidia 22' copy)", () => {
    render(<Home />);
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading.textContent).toMatch(/hunt the next 10x.100x breakout/i);
    expect(heading.textContent).not.toMatch(/nvidia/i);
  });

  it("renders the risk-disclosure footer with all required warnings", () => {
    render(<Home />);
    const footer = screen.getByRole("contentinfo");
    const text = footer.textContent ?? "";
    expect(text).toMatch(/not financial advice/i);
    expect(text).toMatch(/ultra-aggressive/i);
    expect(text).toMatch(/drawdowns/i);
    expect(text).toMatch(/capital preservation/i);
    expect(text).toMatch(/ETF/);
  });

  it("renders the sample prompt buttons", () => {
    render(<Home />);
    expect(
      screen.getByRole("button", { name: /100x case for nuclear SMRs/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /under-priced AI infrastructure/i }),
    ).toBeInTheDocument();
  });

  it("shows the empty-state scorecard and watchlist prompts", () => {
    render(<Home />);
    expect(screen.getByText(/Once Atlas scores a name/i)).toBeInTheDocument();
    expect(screen.getByText(/No positions tracked/i)).toBeInTheDocument();
  });

  it("renders the investor quote wall with the live entry count", () => {
    render(<Home />);
    expect(
      screen.getByText(`${INVESTOR_QUOTES.length} entries`),
    ).toBeInTheDocument();
  });

  it("renders the chat composer (textarea + Send)", () => {
    render(<Home />);
    expect(screen.getByPlaceholderText(/Pitch me a ticker/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
  });
});
