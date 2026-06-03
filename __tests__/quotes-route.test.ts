import { afterEach, describe, it, expect, vi } from "vitest";
import { SNAPSHOT } from "@/lib/tickerSnapshot";

// Fresh import each call so the route's module-level `lastGood` cache starts
// empty (tests that want to exercise the cache load GET once and reuse it).
async function loadGet() {
  vi.resetModules();
  const mod = await import("@/app/api/quotes/route");
  return mod.GET;
}

type Body = {
  quotes: Array<{ symbol: string; price: number; changePct: number }>;
  source?: "live" | "mixed" | "snapshot";
  fetchedAt?: string;
};

async function call(
  GET: (req: Request) => Promise<Response>,
  symbols: string,
): Promise<Body> {
  const res = await GET(
    new Request(`http://localhost/api/quotes?symbols=${symbols}`),
  );
  return (await res.json()) as Body;
}

// Stooq CSV is `Symbol,Date,Time,Close,Prev` rows under a header line.
const csv = (rows: string[]) =>
  ["Symbol,Date,Time,Close,Prev", ...rows].join("\n");

function stubStooq(text: string, ok = true) {
  const mock = vi.fn(async () => ({ ok, text: async () => text }));
  vi.stubGlobal("fetch", mock);
  return mock;
}

afterEach(() => vi.unstubAllGlobals());

describe("GET /api/quotes — input handling", () => {
  it("returns an empty list (and skips fetch) when no symbols are given", async () => {
    const mock = stubStooq("");
    const GET = await loadGet();
    const body = await call(GET, "");
    expect(body.quotes).toEqual([]);
    expect(mock).not.toHaveBeenCalled();
  });

  it("caps the request at 30 symbols", async () => {
    const mock = stubStooq(csv([]));
    const GET = await loadGet();
    const many = Array.from({ length: 35 }, (_, i) => `SYM${i}`).join(",");
    await call(GET, many);
    const url = String(mock.mock.calls[0][0]);
    // 30 `.us`-suffixed symbols made it into the Stooq batch URL, not 35.
    expect(url.match(/\.us/g)).toHaveLength(30);
  });
});

describe("GET /api/quotes — Stooq URL formatting (regression)", () => {
  it("joins symbols with a literal + and never URL-encodes the separator", async () => {
    const mock = stubStooq(csv([]));
    const GET = await loadGet();
    await call(GET, "NVDA,AAPL");
    const url = String(mock.mock.calls[0][0]);
    expect(url).toContain("s=nvda.us+aapl.us");
    expect(url.toLowerCase()).not.toContain("%2b"); // would break Stooq batching
  });
});

describe("GET /api/quotes — CSV parsing", () => {
  it("parses close/prev into price + day-change %, strips .US, upper-cases", async () => {
    const GET = await loadGet();
    stubStooq(csv(["NVDA.US,2026-06-02,22:00:00,100.00,80.00"]));
    const body = await call(GET, "NVDA");
    expect(body.quotes).toEqual([{ symbol: "NVDA", price: 100, changePct: 25 }]);
    expect(body.source).toBe("live");
    expect(body.fetchedAt).toBeDefined();
  });

  it("skips rows with non-numeric (N/D) prices", async () => {
    const GET = await loadGet();
    // AAPL row is N/D → dropped from live → falls back to snapshot.
    stubStooq(
      csv([
        "NVDA.US,2026-06-02,22:00:00,100.00,80.00",
        "AAPL.US,N/D,N/D,N/D,N/D",
      ]),
    );
    const body = await call(GET, "NVDA,AAPL");
    const aapl = body.quotes.find((q) => q.symbol === "AAPL");
    expect(aapl).toEqual(SNAPSHOT.AAPL); // snapshot fallback, not a NaN row
    expect(body.source).toBe("mixed");
  });
});

describe("GET /api/quotes — fallback chain (live → cache → snapshot)", () => {
  it('tags an all-live response as "live"', async () => {
    const GET = await loadGet();
    stubStooq(
      csv([
        "NVDA.US,2026-06-02,22:00:00,100.00,80.00",
        "AAPL.US,2026-06-02,22:00:00,50.00,50.00",
      ]),
    );
    const body = await call(GET, "NVDA,AAPL");
    expect(body.source).toBe("live");
    expect(body.quotes).toHaveLength(2);
  });

  it('fills missing symbols from the baked snapshot and tags "mixed"', async () => {
    const GET = await loadGet();
    stubStooq(csv(["NVDA.US,2026-06-02,22:00:00,100.00,80.00"]));
    const body = await call(GET, "NVDA,AAPL");
    expect(body.source).toBe("mixed");
    expect(body.quotes.find((q) => q.symbol === "AAPL")).toEqual(SNAPSHOT.AAPL);
  });

  it('falls back entirely to the snapshot and tags "snapshot" when Stooq fails', async () => {
    const GET = await loadGet();
    stubStooq("", false); // r.ok === false → live = []
    const body = await call(GET, "NVDA,AAPL");
    expect(body.source).toBe("snapshot");
    expect(body.quotes).toEqual([SNAPSHOT.NVDA, SNAPSHOT.AAPL]);
  });

  it("survives a thrown fetch by serving the snapshot", async () => {
    const GET = await loadGet();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      }),
    );
    const body = await call(GET, "NVDA");
    expect(body.source).toBe("snapshot");
    expect(body.quotes).toEqual([SNAPSHOT.NVDA]);
  });

  it("serves the in-memory last-good cache on a later failed revalidation", async () => {
    const GET = await loadGet(); // single instance → shared lastGood
    // 1st call: live succeeds and warms the cache with a non-snapshot price.
    stubStooq(csv(["NVDA.US,2026-06-02,22:00:00,100.00,80.00"]));
    const first = await call(GET, "NVDA");
    expect(first.quotes[0].price).toBe(100);

    // 2nd call: Stooq fails — should serve the cached 100, not snapshot 222.32.
    vi.unstubAllGlobals();
    stubStooq("", false);
    const second = await call(GET, "NVDA");
    expect(second.quotes[0].price).toBe(100);
    expect(second.quotes[0].price).not.toBe(SNAPSHOT.NVDA.price);
  });
});
