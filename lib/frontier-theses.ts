export type FrontierThesis = {
  id: string;
  asset: string;
  era: string;
  multiple: string;
  trigger: string;
  setup: string;
  lesson: string;
};

export const FRONTIER_THESES: FrontierThesis[] = [
  {
    id: "nvda-2022",
    asset: "NVIDIA (NVDA)",
    era: "Oct 2022",
    multiple: "~10x in 24 months",
    trigger: "ChatGPT launch → H100 became the single chokepoint of the AI economy.",
    setup:
      "Stock down 60% YTD on crypto-GPU bust. Street modeled data-center as a sleepy ~20% grower. Founder-led, 25+ years of CUDA compounding — a moat nobody priced.",
    lesson:
      "When a platform's primary use case flips from 'nice-to-have' to 'civilization-defining,' the re-rate is non-linear. Buy the picks-and-shovels before consensus names the gold rush.",
  },
  {
    id: "tsla-2019",
    asset: "Tesla (TSLA)",
    era: "Jun 2019",
    multiple: "~20x in 18 months",
    trigger: "Model 3 unit economics inflected to positive gross margin at scale.",
    setup:
      "Bears modeled bankruptcy. Shorts at record highs. But Wright's Law said costs would fall ~28% per doubling. Founder controlled the cap table and the narrative.",
    lesson:
      "Margin-inflection moments in capex-heavy companies are wildly mispriced — the market extrapolates the past, not the cost curve.",
  },
  {
    id: "aapl-2007",
    asset: "Apple (AAPL)",
    era: "Jan 2007",
    multiple: "~10x in 5 years (split-adjusted), ~50x in 15",
    trigger: "iPhone launch — first computer in every pocket.",
    setup:
      "Already an 'expensive' growth name post-iPod. Consensus saw a phone; Jobs saw a platform with a 30% take-rate on the future of software.",
    lesson:
      "Platform shifts compound. The thesis isn't 'will it sell?' — it's 'how much of the next decade's software value does this capture?'",
  },
  {
    id: "btc-2012",
    asset: "Bitcoin (BTC)",
    era: "2012",
    multiple: "~6,000x to 2021 peak",
    trigger: "First halving + Coinbase founding → on-ramps for non-cypherpunks.",
    setup:
      "$10/coin. Treated as a joke or a felony. Pure asymmetric: bounded downside (zero), uncapped upside if it became the reserve asset of the internet.",
    lesson:
      "Genuinely new monetary primitives only happen once a century. Position sizing is everything: a 1% allocation that goes 100x changes your life; a 50% allocation that goes to zero ends it.",
  },
  {
    id: "anthropic-2023",
    asset: "Anthropic (private)",
    era: "Early 2023, ~$4B Series C",
    multiple: "~15x mark by 2025",
    trigger: "Constitutional AI thesis + Claude scaling laws holding through 100B+ params.",
    setup:
      "OpenAI dominated narrative. Anthropic was the safety-focused 'second option' that enterprise eventually demanded for redundancy. Founder team had built GPT-3 itself.",
    lesson:
      "In a duopoly forming around a generational technology, the #2 player is almost always under-priced relative to its terminal share.",
  },
  {
    id: "amzn-2002",
    asset: "Amazon (AMZN)",
    era: "Oct 2002",
    multiple: "~100x to 2021",
    trigger: "Survived dotcom bust. AWS skunkworks already underway internally.",
    setup:
      "$6 stock. Negative free cash flow. Bezos relentlessly reinvested. The world saw an e-commerce site; Bezos was building infrastructure for the next 30 years of computing.",
    lesson:
      "Optical un-profitability that funds compounding infrastructure investment is the single most under-priced pattern in public markets.",
  },
];
