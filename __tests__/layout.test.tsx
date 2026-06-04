import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";

// Fixed `ready` useChat stub — these tests only assert layout classes on the
// page shell, not conversation behavior.
vi.mock("@ai-sdk/react", () => ({
  useChat: () => ({
    messages: [],
    status: "ready",
    error: undefined,
    sendMessage: vi.fn(),
    setMessages: vi.fn(),
    clearError: vi.fn(),
  }),
}));

import Home from "@/app/page";

describe("page layout — mobile-safe grid", () => {
  it("gives every grid column min-w-0 so wide chat content can't blow out the viewport", () => {
    // Regression: grid items default to min-width:auto, so a whitespace-nowrap
    // table inside the chat forced horizontal scroll on small screens.
    const { container } = render(<Home />);
    const columns = container.querySelectorAll("main > aside, main > section");
    expect(columns.length).toBe(3);
    for (const col of columns) {
      expect(col.className).toContain("min-w-0");
    }
  });

  it("orders the chat first on mobile and restores the 3-pane order on lg", () => {
    const { container } = render(<Home />);
    const section = container.querySelector("main > section")!;
    expect(section.className).toContain("order-1");
    expect(section.className).toContain("lg:order-none");
    const asides = container.querySelectorAll("main > aside");
    expect(asides[0].className).toContain("order-2");
    expect(asides[1].className).toContain("order-3");
  });
});
