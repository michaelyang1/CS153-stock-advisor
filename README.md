# Atlas Frontier — Growth Stock AI Advisor

A chat-first AI portfolio manager that hunts **10x–100x** asymmetric tech bets.
Composite voice of Brad Gerstner, Ron Baron, Peter Thiel, Bill Miller, and Stan
Druckenmiller — investors with durable, decade-plus compounding track records.
Built for CS153 — frontier-opportunity investing as an agentic system.

## What it does

- **Chat** with Atlas, a frontier-opportunity persona trained on a 7-axis rubric
  (founder, market S-curve, moat, unit economics, narrative velocity, asymmetric
  payoff, timing catalyst).
- **Live market tools** via Yahoo Finance: real-time quotes, fundamentals, news.
- **Conviction Scorecard** panel that auto-populates whenever Atlas scores a
  name — weighted total + HIGH_CONVICTION / WATCHLIST / PASS band.
- **Frontier Watchlist** that captures every name Atlas surfaces with conviction.
- **Historical Analog Library**: one-click prompts seeded with Nvidia '22,
  Tesla '19, Apple '07, Bitcoin '12, Anthropic '23, Amazon '02 — pattern fuel
  for the model.

## Stack

- **Next.js 16** App Router + TypeScript (deployed on Vercel)
- **Vercel AI SDK v6** (`streamText`, `useChat`) with multi-step tool calling
- **Anthropic Claude** (`claude-sonnet-4-5` default; switch to `claude-opus-4-7`
  for top-shelf reasoning by setting `ADVISOR_MODEL`)
- **Yahoo Finance** public endpoints (no key required) for quotes, fundamentals,
  news
- **Tailwind v4** for the dark terminal UI

## Setup

```bash
cp .env.example .env.local      # add your ANTHROPIC_API_KEY
npm install
npm run dev
```

Open <http://localhost:3000>.

## Architecture

```
app/api/chat/route.ts   ← streamText + Anthropic + 5 tools, multi-step loop
lib/persona.ts          ← system prompt (the "fund manager" persona)
lib/tools.ts            ← getQuote, getFundamentals, searchNews,
                          scoreThesis, addToWatchlist
lib/frontier-theses.ts  ← curated 10x/100x historical analogs
components/             ← Scorecard, Watchlist, ThesisLibrary, ToolBadge
app/page.tsx            ← 3-pane terminal (library / chat / scorecard+watchlist)
```

## Compute

Inference happens on Anthropic's API (no local GPU needed). Vercel's serverless
functions host the chat route. Token cost is the only meaningful spend.

## Roadmap

- Persist watchlist + chat to Vercel KV per user
- Pre-IPO/private-company mode (VC scratchpad) using Crunchbase / PitchBook RAG
- Backtest module: replay the rubric against historical 10-baggers to calibrate
- MCP variant so Atlas runs inside Claude Desktop / Cursor
