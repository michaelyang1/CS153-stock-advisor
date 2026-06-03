"use client";

import { useChat } from "@ai-sdk/react";
import { useMemo, useRef, useState, useEffect } from "react";
import { Scorecard, type ScorecardData } from "@/components/Scorecard";
import { Watchlist, type WatchlistEntry } from "@/components/Watchlist";
import { ThesisLibrary } from "@/components/ThesisLibrary";
import { ToolBadge } from "@/components/ToolBadge";
import { QuoteWall } from "@/components/QuoteWall";
import { ScoringRubric } from "@/components/ScoringRubric";
import { TickerTape } from "@/components/TickerTape";

const LEFT_TICKERS = [
  "NVDA", "AAPL", "MSFT", "GOOGL", "META",
  "AMZN", "TSLA", "AVGO", "AMD", "ORCL",
];
const RIGHT_TICKERS = [
  "PLTR", "COIN", "TSM", "ASML", "ANET",
  "NFLX", "MU", "SMCI", "ARM", "CRWV",
];

const SAMPLE_PROMPTS = [
  "What's today's most under-priced AI infrastructure name?",
  "Build me the 100x case for nuclear SMRs.",
  "Score Palantir (PLTR) — is it Nvidia 2022 for the defense stack?",
  "Frontier picks-and-shovels two layers beneath the GPU trade.",
];

type PartLike = {
  type: string;
  text?: string;
  state?: string;
  input?: unknown;
  output?: unknown;
};

export default function Home() {
  const { messages, sendMessage, status, error, setMessages, clearError } =
    useChat();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, status]);

  const { latestScorecard, watchlistEntries } = useMemo(() => {
    let latest: ScorecardData | null = null;
    const entries: WatchlistEntry[] = [];
    const seen = new Set<string>();

    for (const m of messages) {
      const parts = (m.parts ?? []) as PartLike[];
      for (const p of parts) {
        if (
          p.type === "tool-scoreThesis" &&
          p.state === "output-available" &&
          p.output
        ) {
          latest = p.output as ScorecardData;
        }
        if (
          p.type === "tool-addToWatchlist" &&
          p.state === "output-available" &&
          p.output
        ) {
          const w = p.output as WatchlistEntry;
          const key = w.asset;
          if (!seen.has(key)) {
            seen.add(key);
            entries.push(w);
          }
        }
      }
    }
    return { latestScorecard: latest, watchlistEntries: entries.reverse() };
  }, [messages]);

  const submit = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || status === "streaming" || status === "submitted") return;
    sendMessage({ text: trimmed });
    setInput("");
  };

  const busy = status === "streaming" || status === "submitted";

  // Familiar typing indicator: show it only while we're genuinely waiting for
  // Atlas to start writing prose. Once text streams in (or a tool badge is
  // actively running), that UI conveys the activity instead — so the dots
  // don't double up with visible output, the way ChatGPT/Claude/Gemini behave.
  const lastMessage = messages[messages.length - 1];
  const lastAssistantParts =
    lastMessage?.role === "assistant"
      ? (lastMessage.parts as PartLike[])
      : null;
  const assistantHasText =
    lastAssistantParts?.some(
      (p) => p.type === "text" && (p.text ?? "").trim().length > 0,
    ) ?? false;
  const toolRunning =
    lastAssistantParts?.some(
      (p) =>
        p.type.startsWith("tool-") &&
        (p.state === "input-streaming" || p.state === "input-available"),
    ) ?? false;
  const showTyping = busy && !assistantHasText && !toolRunning;

  // Reset the conversation in place — no page refresh. Clearing messages also
  // empties the derived scorecard/watchlist, and clearError dismisses any
  // stream error banner.
  const clearChat = () => {
    if (busy) return;
    setMessages([]);
    clearError();
  };

  return (
    <div className="grid-bg min-h-screen">
      <TickerTape side="left" symbols={LEFT_TICKERS} durationSec={80} />
      <TickerTape side="right" symbols={RIGHT_TICKERS} durationSec={80} />
      <header className="border-b border-white/10 bg-black/40 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md bg-gradient-to-br from-amber-400 to-rose-500 font-mono text-base font-black text-black">
              A
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight text-neutral-50">
                ATLAS FRONTIER
              </div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-neutral-500">
                Growth Stock AI Advisor · 10x–100x bets only
              </div>
            </div>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <span className="ticker-pulse size-1.5 rounded-full bg-emerald-400" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
              live · Yahoo Finance feed
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-4 px-4 py-6 lg:grid-cols-[260px_1fr_300px]">
        <aside className="space-y-4">
          <ThesisLibrary onPick={submit} />
        </aside>

        <section className="flex flex-col self-start rounded-lg border border-white/10 bg-neutral-900/40 backdrop-blur lg:sticky lg:top-6">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-600">
              Terminal Session
            </span>
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                disabled={busy}
                className="text-[10px] uppercase tracking-wider text-neutral-500 transition hover:text-neutral-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Clear chat
              </button>
            )}
          </div>
          <div
            ref={scrollRef}
            className="flex-1 space-y-5 overflow-y-auto p-5"
            style={{ maxHeight: "calc(100vh - 250px)", minHeight: 480 }}
          >
            {messages.length === 0 && <Greeting onPick={submit} />}

            {messages.map((m, idx) => (
              <MessageBubble
                key={m.id}
                role={m.role}
                parts={m.parts as PartLike[]}
                streaming={
                  status === "streaming" &&
                  idx === messages.length - 1 &&
                  m.role === "assistant"
                }
              />
            ))}

            {showTyping && <TypingIndicator />}

            {error && (
              <div className="rounded-md border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200">
                {error.message}
              </div>
            )}
          </div>

          <div className="border-t border-white/10 p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit(input);
              }}
              className="flex items-center gap-2"
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit(input);
                  }
                }}
                placeholder="Pitch me a ticker, a theme, or an analog… (e.g., 'Is CRWV the next NVDA?')"
                rows={2}
                className="flex-1 resize-none rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-amber-500/40 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
              />
              <button
                type="submit"
                aria-label="Send message"
                disabled={busy || input.trim().length === 0}
                className="rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-500"
              >
                {busy ? "…" : "Send"}
              </button>
            </form>
          </div>
        </section>

        <aside className="space-y-4">
          {latestScorecard ? (
            <Scorecard data={latestScorecard} />
          ) : (
            <div className="rounded-lg border border-dashed border-white/10 bg-neutral-900/30 p-4 text-xs text-neutral-500">
              <div className="mb-1 text-[10px] uppercase tracking-[0.18em] text-neutral-600">
                Conviction Scorecard
              </div>
              Once Atlas scores a name, the rubric breakdown shows here.
            </div>
          )}
          <ScoringRubric />
          <Watchlist entries={watchlistEntries} onClear={clearChat} />
          <QuoteWall />
        </aside>
      </main>

      <footer className="mx-auto max-w-7xl px-4 pb-10">
        <div className="relative overflow-hidden rounded-lg border border-rose-500/25 bg-gradient-to-br from-rose-500/[0.07] via-neutral-900/40 to-amber-500/[0.05] p-5 backdrop-blur">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-1.5"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, rgba(244,63,94,0.55) 0 6px, transparent 6px 12px)",
            }}
          />
          <div className="flex items-start gap-3 pl-2">
            <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-rose-500 to-amber-400 font-mono text-sm font-black text-black">
              !
            </div>
            <div>
              <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-rose-300/90">
                Risk Disclosure · Not Financial Advice
              </div>
              <p className="max-w-3xl text-xs leading-relaxed text-neutral-400">
                Atlas runs a deliberately{" "}
                <span className="font-medium text-neutral-200">
                  ultra-aggressive, growth-at-all-costs
                </span>{" "}
                strategy — every idea is engineered for asymmetric{" "}
                <span className="font-medium text-amber-200/90">10x–100x</span>{" "}
                upside, never for safety. That ambition carries{" "}
                <span className="font-medium text-neutral-200">
                  extreme volatility and a high probability of deep drawdowns
                </span>
                ; you can lose a large portion of your invested capital. Nothing
                Atlas outputs is financial, investment, or tax advice. If your
                goal is capital preservation, this is the wrong terminal — own a
                diversified, low-cost index ETF and hold.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Greeting({ onPick }: { onPick: (q: string) => void }) {
  return (
    <div className="rounded-lg border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-rose-500/5 p-5">
      <div className="text-[10px] uppercase tracking-[0.22em] text-amber-300">
        Briefing
      </div>
      <h2 className="mt-1 text-xl font-semibold text-neutral-50">
        I&apos;m Atlas. I hunt the next 10x–100x breakout.
      </h2>
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-neutral-300">
        Composite voice of Brad Gerstner, Ron Baron, Peter Thiel, Bill Miller,
        and Stan Druckenmiller. I score every idea on a 7-axis frontier rubric
        and only flag names with a path to 10x. Bonds and dividends are not in
        this terminal.
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {SAMPLE_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => onPick(p)}
            className="rounded-md border border-white/10 bg-black/30 p-3 text-left text-xs text-neutral-300 transition hover:border-amber-500/40 hover:bg-amber-500/5"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="rounded-lg border border-white/10 bg-black/40 px-4 py-3">
        <div className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-amber-300/80">
          Atlas Frontier
        </div>
        <div
          role="status"
          aria-label="Atlas is thinking"
          className="flex items-center gap-1.5"
        >
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </div>
      </div>
    </div>
  );
}

function MessageBubble({
  role,
  parts,
  streaming = false,
}: {
  role: "user" | "assistant" | "system";
  parts: PartLike[];
  streaming?: boolean;
}) {
  const isUser = role === "user";
  let lastTextIdx = -1;
  parts.forEach((p, i) => {
    if (p.type === "text") lastTextIdx = i;
  });
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[88%] rounded-lg px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "border border-amber-500/30 bg-amber-500/10 text-neutral-100"
            : "border border-white/10 bg-black/40 text-neutral-100"
        }`}
      >
        {!isUser && (
          <div className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-amber-300/80">
            Atlas Frontier
          </div>
        )}
        <div className="space-y-2">
          {parts.map((p, i) => {
            if (p.type === "text") {
              return (
                <p key={i} className="whitespace-pre-wrap">
                  {p.text}
                  {streaming && i === lastTextIdx && (
                    <span className="stream-caret" aria-hidden="true" />
                  )}
                </p>
              );
            }
            if (p.type.startsWith("tool-")) {
              return <ToolBadge key={i} part={p} />;
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
}
