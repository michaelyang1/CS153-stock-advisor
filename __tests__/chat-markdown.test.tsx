import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// Configurable useChat mock (same pattern as chat-typing.test.tsx) so each
// test can inject a finished conversation and assert how assistant markdown
// is rendered vs. how user text is kept literal.
const chatState = vi.hoisted(() => ({
  messages: [] as Array<{
    id: string;
    role: "user" | "assistant" | "system";
    parts: Array<{ type: string; text?: string; state?: string; input?: unknown }>;
  }>,
  status: "ready" as "submitted" | "streaming" | "ready" | "error",
  error: undefined as undefined | { message: string },
  sendMessage: vi.fn(),
  setMessages: vi.fn(),
  clearError: vi.fn(),
}));

vi.mock("@ai-sdk/react", () => ({
  useChat: () => chatState,
}));

import Home from "@/app/page";

beforeEach(() => {
  chatState.messages = [];
  chatState.status = "ready";
  chatState.error = undefined;
  chatState.sendMessage = vi.fn();
  chatState.setMessages = vi.fn();
  chatState.clearError = vi.fn();
});

const assistant = (text: string) => ({
  id: "a1",
  role: "assistant" as const,
  parts: [{ type: "text", text }],
});

describe("chat — assistant markdown rendering (signature formats)", () => {
  it("renders a VERDICT header line as a real heading, not raw ## syntax", () => {
    chatState.messages = [
      assistant("## NVDA — HIGH CONVICTION · 8.4/10\n\nThe thesis."),
    ];
    render(<Home />);
    expect(
      screen.getByRole("heading", { name: /NVDA — HIGH CONVICTION · 8\.4\/10/ }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/##/)).not.toBeInTheDocument();
  });

  it("renders **bold** section labels as emphasized spans, with no literal asterisks", () => {
    chatState.messages = [
      assistant("**The Call** — own the compute layer.\n\n**Kill Switch** — hyperscaler capex rolls over."),
    ];
    const { container } = render(<Home />);
    // Streamdown renders markdown bold as span[data-streamdown="strong"]
    const strongs = Array.from(
      container.querySelectorAll('[data-streamdown="strong"]'),
    ).map((el) => el.textContent);
    expect(strongs).toContain("The Call");
    expect(strongs).toContain("Kill Switch");
    expect(container.textContent).not.toContain("**");
  });

  it("renders a GFM head-to-head table as a real <table>", () => {
    chatState.messages = [
      assistant(
        [
          "Two ways to own the same S-curve.",
          "",
          "| Axis | NVDA | AMD |",
          "| --- | --- | --- |",
          "| Moat | 9 | 6 |",
          "| **Weighted** | 8.4 | 6.9 |",
        ].join("\n"),
      ),
    ];
    render(<Home />);
    const table = screen.getByRole("table");
    expect(table).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "NVDA" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "8.4" })).toBeInTheDocument();
  });

  it("renders ranked frontier-scan lists as a real ordered list", () => {
    chatState.messages = [
      assistant("1. **VRT** — cooling bottleneck · Q3 backlog\n2. **ANET** — networking layer · 800G ramp"),
    ];
    // Scope to the rendered markdown — the page chrome (thesis library,
    // ticker tapes) contains its own lists.
    const { container } = render(<Home />);
    const ol = container.querySelector('[data-streamdown="ordered-list"]');
    expect(ol).not.toBeNull();
    expect(ol!.querySelectorAll("li")).toHaveLength(2);
  });

  it("keeps user-typed markdown literal — typing ** must not bold", () => {
    chatState.messages = [
      {
        id: "u1",
        role: "user" as const,
        parts: [{ type: "text", text: "Is **NVDA** still a buy?" }],
      },
    ];
    const { container } = render(<Home />);
    expect(screen.getByText("Is **NVDA** still a buy?")).toBeInTheDocument();
    expect(container.querySelector("strong")).not.toBeInTheDocument();
    expect(
      container.querySelector('[data-streamdown="strong"]'),
    ).not.toBeInTheDocument();
  });
});
