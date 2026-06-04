# Atlas Frontier — Growth Stock AI Advisor

A chat-first AI portfolio manager that hunts **10x–100x** asymmetric tech bets.
Composite voice of Brad Gerstner, Ron Baron, Peter Thiel, Bill Miller, and Stan
Druckenmiller — investors with durable, decade-plus compounding track records.

Built for **CS153 — The One-Person Frontier Lab**. Track: _Application / Product
(agentic system)_.

**Live demo:** <https://cs153-stock-advisor.vercel.app> · **Demo video:** _add link at submission_

> ⚠️ **Not financial advice.** Atlas runs a deliberately ultra-aggressive,
> growth-at-all-costs strategy engineered for asymmetric upside, with a high
> probability of deep drawdowns. It is a research/demo artifact — if your goal is
> capital preservation, own a diversified, low-cost index ETF instead.

---

## Problem & Motivation

Retail "AI investing" tools overwhelmingly optimize for _safety_ — robo-advisors,
index funds, diversification. There is almost nothing that does the opposite:
think like the concentrated growth investors who actually captured the largest
winners of the last two decades. Academic work (e.g. Bessembinder) shows the
median stock barely beats T-bills while a tiny handful of names produce nearly
all of the market's excess return — yet consumer tools are built around the median.

Atlas is an experiment in encoding that **concentrated, conviction-driven mental
model** as an agentic system: a persona distilled from named growth investors, a
repeatable 7-axis scoring rubric, and live market tools — so a single user can
pressure-test "is this the next 10x?" with structure instead of vibes.

---

## What it does

- **Chat** with Atlas, a frontier-opportunity persona that scores every idea on a
  7-axis rubric (founder, market S-curve, moat, unit economics, narrative
  velocity, asymmetric payoff, timing catalyst).
- **Signature response formats** — every reply follows a branded, recurring shape
  for its question type, rendered as rich markdown in the chat:
  - **VERDICT** (one name): scored header (`TICKER — BAND · x/10`) → The Call →
    Why → The Analog → Catalyst Watch → Kill Switch
  - **HEAD-TO-HEAD** (comparisons): rubric-axis table, one column per name,
    closed by The Winner
  - **FRONTIER SCAN** (themes): S-curve framing → ranked 3–5 list → Deepest Edge
  - **MACRO READ**: Bottom Line first → evidence bullets → How to Play It
  - **QUICK TAKE** (follow-ups): ≤3 sentences, no scaffolding
- **On-topic scope guard** — off-topic or prompt-injection messages get a
  one-sentence decline with zero tool calls, so spam can't burn inference
  credits or repurpose the advisor.
- **Live market tools** (Yahoo Finance) the model calls mid-conversation:
  real-time quotes, fundamentals, and news search.
- **Conviction Scorecard** that auto-populates whenever Atlas scores a name —
  weighted total + `HIGH_CONVICTION` / `WATCHLIST` / `PASS` band.
- **Frontier Watchlist** capturing every name Atlas surfaces with conviction
  (session-scoped, in memory).
- **Live ticker tapes** down both edges, fed by a resilient quotes endpoint.
- **Historical Analog Library**: one-click prompts seeded with NVDA '22,
  TSLA '19, AAPL '07, BTC '12, Anthropic '23, AMZN '02 — pattern fuel for the model.
- **Risk-disclosure footer** making the aggressive mandate explicit.

---

## How it works (architecture)

```
app/page.tsx              ← 3-pane terminal (analog library / chat / scorecard+watchlist)
                            + ticker tapes + risk-disclosure footer
app/api/chat/route.ts     ← streamText + LLM + 5 tools, multi-step loop (stopWhen 6 steps)
app/api/quotes/route.ts   ← Stooq batch CSV → live quotes, with a fallback chain
lib/persona.ts            ← system prompt (persona + rubric + the five response
                            formats + on-topic scope guard)
lib/tools.ts              ← getQuote, getFundamentals, searchNews (Yahoo Finance),
                            scoreThesis (pure rubric math), addToWatchlist (pure)
lib/frontier-theses.ts    ← curated 10x/100x historical analogs (sidebar)
lib/quotes.ts             ← static investor-quote wall content
lib/tickerSnapshot.ts     ← baked quote snapshot (last-resort tape fallback)
components/                ← Scorecard, Watchlist, ThesisLibrary, QuoteWall,
                            TickerTape, ToolBadge
__tests__/                 ← Vitest + React Testing Library suite (see Testing)
```

**Two independent data paths (deliberate):**

1. **Ticker tapes** call `/api/quotes`, which fetches a batched **Stooq** CSV and
   degrades gracefully: `live → in-memory last-good cache → baked snapshot`. The
   response is tagged `source: "live" | "mixed" | "snapshot"` so a Stooq rate-limit
   (common from datacenter IPs) never blanks the UI.
2. **Chat tools** call **Yahoo Finance** on demand when the model looks up a quote,
   fundamentals, or news during a conversation.

**Conversation state** is intentionally ephemeral: `useChat` holds it in browser
memory and the `/api/chat` route is stateless. No accounts, no database, no
login — appropriate for a single-session demo (see Limitations).

---

## Tech stack

- **Next.js 16** (App Router) + **TypeScript**, deployed on **Vercel**
- **Vercel AI SDK v6** (`streamText`, `useChat`) with multi-step tool calling
- **LLM provider:** **OpenRouter** (`@openrouter/ai-sdk-provider`) running
  **Claude Sonnet 4.6** (`anthropic/claude-sonnet-4.6`) by default — chosen for
  frontier-grade multi-step tool calling and persona quality at Sonnet pricing.
  Falls back to direct Anthropic (`@ai-sdk/anthropic`, `claude-sonnet-4-5`) when
  only `ANTHROPIC_API_KEY` is set; override either default via `ADVISOR_MODEL`.
- **streamdown** — streaming-tolerant GitHub-flavored markdown rendering for
  Atlas's replies (headings, tables, ranked lists), so the signature formats
  display correctly even mid-stream
- **Stooq** (ticker tapes) + **Yahoo Finance** (chat tools) — public endpoints,
  no key required
- **Tailwind v4** for the dark terminal UI
- **Vitest + React Testing Library + jsdom** for tests; **GitHub Actions** CI

---

## Setup & reproduce

Requires **Node 22+** and npm.

```bash
cp .env.example .env.local      # add your OPENROUTER_CS153_API_KEY
npm install
npm run dev                     # http://localhost:3000
```

Other commands:

```bash
npm test          # run the Vitest suite once
npm run test:watch
npm run lint
npm run build     # production build (type-check + compile)
```

Environment variables (`.env.example`):

| Var | Required | Purpose |
|---|---|---|
| `OPENROUTER_CS153_API_KEY` | yes (preferred) | LLM inference via OpenRouter — Claude Sonnet 4.6 default |
| `ANTHROPIC_API_KEY` | fallback only | Direct Anthropic; used when no OpenRouter key is set |
| `ADVISOR_MODEL` | no | Override the model id for whichever provider is active |

The ticker tapes and historical-analog UI work with **no key at all** (Stooq +
baked snapshot fallback); only the Atlas chat requires an LLM key.

---

## Evaluation & evidence

Validation ran along three tracks: an automated test suite, live behavioral
probes against the real model, and failure analysis of actual incidents hit
during development.

### 1. Automated test suite — 109 tests, CI-enforced

Vitest + React Testing Library, set up per the official Next.js App Router
testing guide. CI (`.github/workflows/test.yml`) runs **lint → test → build**
on every PR and push. Coverage highlights:

- **Quotes API** (`app/api/quotes/route.ts`): CSV parsing, the literal-`+` Stooq
  separator regression, the `live → cache → snapshot` fallback chain, `source`
  tagging, the 30-symbol cap, and `N/D`-row skipping (network mocked).
- **Rubric logic** (`lib/tools.ts`): `scoreThesis` weighting (7 axes summing to
  1.0) and conviction-band thresholds; `addToWatchlist` shape; `getQuote` Yahoo
  parsing.
- **Data + persona invariants** (`lib/tickerSnapshot.ts`, `lib/frontier-theses.ts`,
  `lib/quotes.ts`, `lib/persona.ts`) — including the response-format and
  scope-guard prompt contracts.
- **UI** (`app/page.tsx` + components): the headline, risk-disclosure footer,
  sample prompts, empty states, every sidebar component, mobile-layout
  regressions, and markdown rendering (assistant markdown becomes real
  headings/tables/lists; user-typed markdown stays literal) — `useChat` mocked.

**Policy:** every feature or bug fix must ship with tests in the same change — see
`AGENTS.md`. Run `npm test` to reproduce.

### 2. Live behavioral probes (real model, deployed app)

- **Full agent loop**: "Score Palantir (PLTR)" fired all five tools in sequence
  (quote → fundamentals → news → scoreThesis → addToWatchlist), streamed a
  grounded thesis, populated the scorecard (HIGH CONVICTION) and watchlist.
- **Format adherence**: "Head to head: NVDA vs AMD" produced the signature
  comparison shape — 7-axis rubric table with weighted totals and a one-line
  *The Winner* verdict; a macro prompt produced *Bottom Line → evidence → How
  to Play It*. Both pixel-verified in the browser, desktop and mobile.
- **Abuse resistance**: "How is the weather today?" and an "ignore all previous
  instructions" prompt-injection both returned the one-sentence on-topic
  refusal with **zero tool calls** — spam cannot burn inference credits or
  repurpose the advisor.
- **Cost envelope**: ~$0.03 per full tool-loop conversation turn ≈ 600+
  conversations on the $20 course inference budget.

### 3. Failure analysis (real incidents → design changes)

- **Stooq rate-limits datacenter IPs**: the production ticker tape went blank;
  root-caused and redesigned into the `live → in-memory cache → baked snapshot`
  fallback chain with `source` tagging (PRs #6–#8).
- **Yahoo Finance 429s mid-conversation**: the advisor now states that live
  data is unavailable and reasons from fundamentals knowledge instead of
  fabricating numbers — observed live and kept as designed behavior.
- **Known limits** are documented honestly in
  [Limitations & major decisions](#limitations--major-decisions).

---

## Limitations & major decisions

- **It is opinionated by design, and not financial advice.** The persona is built
  to make aggressive, concentrated calls; outputs can be wrong, and large
  drawdowns are expected. This is a research/demo artifact, not an advisory product.
- **LLM hallucination / numeric risk.** Atlas is prompted to call tools for hard
  numbers, but model output can still misstate facts. Treat figures as starting
  points, not ground truth.
- **Ephemeral conversation (intentional).** No persistence/auth — a refresh resets
  state. This keeps the demo dependency-free and reproducible; persistence
  (localStorage or a managed store) is on the roadmap if it graduates past a demo.
- **Market data caveats.** Free Stooq/Yahoo endpoints rate-limit and occasionally
  return stale or missing rows; the tape transparently falls back to a baked
  snapshot, so prices on the tape may not be live in every environment.
- **Single user.** One deployment = one shared, anonymous session.

---

## AI tools disclosure

Per the CS153 AI policy, here is how and where AI tools were used.

- **This product *is* an AI application.** Its core feature is an LLM (Claude via
  the Vercel AI SDK) acting as an agent with five tools — that is the artifact, not
  a development shortcut.
- **Development was AI-assisted.** The codebase was built with **Claude Code**
  (Anthropic's agentic CLI, Claude Opus) under human direction. AI assistance was
  used for: scaffolding the Next.js app, implementing the UI and API routes,
  authoring the persona/rubric and tool definitions, fixing data-fetch bugs (the
  Stooq batching/snapshot fallback), copywriting, and writing the **entire test
  suite** and this documentation.
- **Human ownership.** The student defined the concept, product requirements, and
  design direction, and reviewed/approved every change. All work landed through
  pull requests on `main` — the commit history (21 merged PRs, commits co-authored
  by Claude) is the transparent record of AI-assisted development over time.
- **Sources.** No code was forked or borrowed from existing repositories — the app
  was scaffolded with `create-next-app` and built from there. Market data comes
  from public Stooq and Yahoo Finance endpoints; academic motivation cites
  Bessembinder's *Do Stocks Outperform Treasury Bills?* (see Problem & Motivation).

---

## Compute

Inference runs on a hosted LLM API via **OpenRouter** (course inference
credits) — no local GPU required. Vercel serverless functions host the API
routes. Course DigitalOcean / Cloudflare compute credits are **optional** and
unused: this app needs neither a VPS nor self-hosted infra.

---

## Roadmap

- Persist watchlist + chat (localStorage, or a Vercel Marketplace store such as
  Upstash Redis) so sessions survive refresh
- Pre-IPO / private-company mode (VC scratchpad) via Crunchbase / PitchBook RAG
- Backtest module: replay the rubric against historical 10-baggers to calibrate it
- MCP variant so Atlas runs inside Claude Desktop / Cursor
