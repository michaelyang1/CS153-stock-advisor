import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// jsdom does not implement Element.scrollTo; <Home> auto-scrolls the chat pane
// in a useEffect, so provide a no-op to keep render() from throwing.
if (!Element.prototype.scrollTo) {
  Element.prototype.scrollTo = () => {};
}

// Default fetch: return an empty quote list so client components that poll
// /api/quotes on mount (TickerTape) stay on their baked-snapshot seed instead
// of hitting the network. Tests that exercise fetch directly (the quotes route)
// override this with vi.stubGlobal("fetch", ...).
globalThis.fetch = vi.fn(
  async () =>
    new Response(JSON.stringify({ quotes: [] }), {
      status: 200,
      headers: { "content-type": "application/json" },
    }),
) as unknown as typeof fetch;

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
