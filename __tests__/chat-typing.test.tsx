import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// A configurable useChat mock so each test can drive a different chat status
// and message set, then assert how the composer + "thinking" indicator react.
// (page.test.tsx uses a fixed `ready` stub for the landing experience; this
// file exercises the in-flight conversation states.)
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

const userMsg = {
  id: "u1",
  role: "user" as const,
  parts: [{ type: "text", text: "Pitch me NVDA" }],
};

beforeEach(() => {
  chatState.messages = [];
  chatState.status = "ready";
  chatState.error = undefined;
  chatState.sendMessage = vi.fn();
  chatState.setMessages = vi.fn();
  chatState.clearError = vi.fn();
});

describe("chat — typing / thinking indicator", () => {
  it("shows the typing indicator right after the user sends (status: submitted)", () => {
    chatState.status = "submitted";
    chatState.messages = [userMsg];
    render(<Home />);
    expect(
      screen.getByRole("status", { name: /atlas is thinking/i }),
    ).toBeInTheDocument();
  });

  it("keeps the indicator while streaming before any assistant text arrives", () => {
    chatState.status = "streaming";
    chatState.messages = [userMsg, { id: "a1", role: "assistant", parts: [] }];
    render(<Home />);
    expect(
      screen.getByRole("status", { name: /atlas is thinking/i }),
    ).toBeInTheDocument();
  });

  it("hides the indicator once assistant text begins streaming", () => {
    chatState.status = "streaming";
    chatState.messages = [
      userMsg,
      { id: "a1", role: "assistant", parts: [{ type: "text", text: "NVDA is" }] },
    ];
    render(<Home />);
    expect(
      screen.queryByRole("status", { name: /atlas is thinking/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/NVDA is/)).toBeInTheDocument();
  });

  it("hides the indicator while a tool is running (the tool badge conveys activity)", () => {
    chatState.status = "streaming";
    chatState.messages = [
      userMsg,
      {
        id: "a1",
        role: "assistant",
        parts: [
          { type: "tool-getQuote", state: "input-available", input: { ticker: "NVDA" } },
        ],
      },
    ];
    render(<Home />);
    expect(
      screen.queryByRole("status", { name: /atlas is thinking/i }),
    ).not.toBeInTheDocument();
    // the tool badge stands in for the generic dots
    expect(screen.getByText(/Pulling quote/i)).toBeInTheDocument();
  });

  it("shows no indicator when idle (status: ready)", () => {
    chatState.status = "ready";
    chatState.messages = [
      userMsg,
      { id: "a1", role: "assistant", parts: [{ type: "text", text: "Here is the thesis." }] },
    ];
    render(<Home />);
    expect(
      screen.queryByRole("status", { name: /atlas is thinking/i }),
    ).not.toBeInTheDocument();
  });
});

describe("chat — composer behavior while in flight", () => {
  it("disables Send while a response is in flight", () => {
    chatState.status = "submitted";
    chatState.messages = [userMsg];
    render(<Home />);
    expect(screen.getByRole("button", { name: /send message/i })).toBeDisabled();
  });

  it("disables Send when idle with an empty composer", () => {
    chatState.status = "ready";
    render(<Home />);
    expect(screen.getByRole("button", { name: /send message/i })).toBeDisabled();
  });

  it("surfaces a streaming error to the user", () => {
    chatState.status = "error";
    chatState.error = { message: "Anthropic API key is missing." };
    chatState.messages = [userMsg];
    render(<Home />);
    expect(screen.getByText(/API key is missing/i)).toBeInTheDocument();
  });
});
