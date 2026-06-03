import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// Configurable useChat mock (same pattern as chat-typing.test.tsx) so each
// test can drive the message set / status and assert the Clear chat wiring.
const chatState = vi.hoisted(() => ({
  messages: [] as Array<{
    id: string;
    role: "user" | "assistant" | "system";
    parts: Array<{
      type: string;
      text?: string;
      state?: string;
      input?: unknown;
      output?: unknown;
    }>;
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

const userMsg = {
  id: "u1",
  role: "user" as const,
  parts: [{ type: "text", text: "Pitch me NVDA" }],
};
const assistantMsg = {
  id: "a1",
  role: "assistant" as const,
  parts: [{ type: "text", text: "Here is the thesis." }],
};

beforeEach(() => {
  chatState.messages = [];
  chatState.status = "ready";
  chatState.error = undefined;
  chatState.sendMessage = vi.fn();
  chatState.setMessages = vi.fn();
  chatState.clearError = vi.fn();
});

describe("chat — Clear chat button", () => {
  it("is hidden while the conversation is empty", () => {
    render(<Home />);
    expect(
      screen.queryByRole("button", { name: /clear chat/i }),
    ).not.toBeInTheDocument();
  });

  it("appears once there are messages and resets the conversation in place", () => {
    chatState.messages = [userMsg, assistantMsg];
    render(<Home />);
    const btn = screen.getByRole("button", { name: /clear chat/i });
    expect(btn).toBeEnabled();
    fireEvent.click(btn);
    expect(chatState.setMessages).toHaveBeenCalledWith([]);
    expect(chatState.clearError).toHaveBeenCalledTimes(1);
  });

  it("also clears after a stream error (the no-refresh recovery path)", () => {
    chatState.status = "error";
    chatState.error = { message: "Anthropic API key is missing." };
    chatState.messages = [userMsg];
    render(<Home />);
    fireEvent.click(screen.getByRole("button", { name: /clear chat/i }));
    expect(chatState.setMessages).toHaveBeenCalledWith([]);
    expect(chatState.clearError).toHaveBeenCalledTimes(1);
  });

  it("is disabled while a response is in flight", () => {
    chatState.status = "streaming";
    chatState.messages = [userMsg, { id: "a1", role: "assistant" as const, parts: [] }];
    render(<Home />);
    const btn = screen.getByRole("button", { name: /clear chat/i });
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(chatState.setMessages).not.toHaveBeenCalled();
  });
});

describe("watchlist — Clear uses the same in-place reset (no page reload)", () => {
  it("clicking the watchlist Clear calls setMessages([]) instead of reloading", () => {
    chatState.messages = [
      userMsg,
      {
        id: "a1",
        role: "assistant" as const,
        parts: [
          {
            type: "tool-addToWatchlist",
            state: "output-available",
            output: {
              asset: "CoreWeave (CRWV)",
              band: "HIGH_CONVICTION",
              thesis: "Sovereign-scale GPU cloud.",
              catalyst: "Hyperscaler capacity crunch.",
              addedAt: "2026-06-03T00:00:00.000Z",
            },
          },
        ],
      },
    ];
    render(<Home />);
    // the watchlist rendered the entry, so its Clear button is visible
    expect(screen.getByText("CoreWeave (CRWV)")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /^clear$/i }));
    expect(chatState.setMessages).toHaveBeenCalledWith([]);
  });
});
