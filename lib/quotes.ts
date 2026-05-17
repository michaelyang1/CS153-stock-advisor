export type InvestorQuote = {
  author: string;
  role: string;
  quote: string;
  source: string;
};

export const INVESTOR_QUOTES: InvestorQuote[] = [
  // --- Public growth investors ---
  {
    author: "Ron Baron",
    role: "Founder, Baron Capital",
    quote: "Growth stocks are the best way to make money over time.",
    source: "CNBC op-ed, 2022",
  },
  {
    author: "Ron Baron",
    role: "Founder, Baron Capital",
    quote:
      "It was more profitable to find great companies and hold their stock for the long term, rather than try to predict what the market will do in the short term.",
    source: "Baron Funds annual letter",
  },
  {
    author: "Ron Baron",
    role: "Founder, Baron Capital",
    quote:
      "Historically, the stock market has doubled every 10 to 12 years. We strive to do better.",
    source: "Baron Funds shareholder meeting",
  },
  {
    author: "Peter Lynch",
    role: "Magellan Fund (Fidelity)",
    quote: "Know what you own, and know why you own it.",
    source: "One Up On Wall Street",
  },
  {
    author: "Peter Lynch",
    role: "Magellan Fund (Fidelity)",
    quote:
      "The best stock to buy may be the one you already own.",
    source: "One Up On Wall Street",
  },
  {
    author: "Philip Fisher",
    role: "Father of growth investing",
    quote: "I don't want a lot of good investments; I want a few outstanding ones.",
    source: "Common Stocks and Uncommon Profits",
  },
  {
    author: "Philip Fisher",
    role: "Father of growth investing",
    quote: "What are you doing that your competitors are not doing yet?",
    source: "Scuttlebutt interview question",
  },
  {
    author: "Bill Miller",
    role: "Miller Value Partners",
    quote:
      "Best investment decision I ever made? Buying Amazon in the IPO. Worst? Selling a share of Amazon.",
    source: "We Study Billionaires podcast",
  },
  {
    author: "Bill Miller",
    role: "Miller Value Partners",
    quote: "I consider bitcoin an insurance policy against financial catastrophe.",
    source: "Miller Value 4Q letter",
  },

  // --- Concentration & conviction ---
  {
    author: "Stan Druckenmiller",
    role: "Duquesne Family Office",
    quote:
      "The greatest investors make large concentrated bets where they have a lot of conviction. They're not buying 35 or 40 names and diversifying.",
    source: "Sohn Conference interview",
  },
  {
    author: "Stan Druckenmiller",
    role: "Duquesne Family Office",
    quote:
      "Soros taught me that when you have tremendous conviction on a trade, you have to go for the jugular. It takes courage to be a pig.",
    source: "Lost Tree Club speech, 2015",
  },
  {
    author: "Charlie Munger",
    role: "Berkshire Hathaway",
    quote:
      "The big money is not in the buying or selling, but in the waiting.",
    source: "Daily Journal annual meeting",
  },
  {
    author: "Charlie Munger",
    role: "Berkshire Hathaway",
    quote:
      "The first rule of compounding: never interrupt it unnecessarily.",
    source: "Poor Charlie's Almanack",
  },
  {
    author: "Charlie Munger",
    role: "Berkshire Hathaway",
    quote:
      "The goal of investments is to find situations where it is safe not to diversify.",
    source: "USC Law School speech, 1994",
  },

  // --- Asymmetric / second-level ---
  {
    author: "Howard Marks",
    role: "Oaktree Capital",
    quote:
      "The goal is to achieve an asymmetry between risk and return — more upside than downside.",
    source: "The Most Important Thing",
  },
  {
    author: "Howard Marks",
    role: "Oaktree Capital",
    quote:
      "First-level thinking is simplistic and superficial. Second-level thinking is deep, complex, and convoluted.",
    source: "The Most Important Thing",
  },
  {
    author: "Naval Ravikant",
    role: "AngelList founder",
    quote:
      "All the returns in life, whether in wealth, relationships, or knowledge, come from compound interest.",
    source: "The Almanack of Naval Ravikant",
  },
  {
    author: "Naval Ravikant",
    role: "AngelList founder",
    quote:
      "To get rich, you need leverage. Leverage comes in labor, capital, code, or media.",
    source: "How to Get Rich (without getting lucky)",
  },
  {
    author: "Peter Thiel",
    role: "Founders Fund / PayPal",
    quote: "Monopoly is the condition of every successful business.",
    source: "Zero to One (2014)",
  },
  {
    author: "Peter Thiel",
    role: "Founders Fund / PayPal",
    quote: "What important truth do very few people agree with you on?",
    source: "Zero to One (2014)",
  },

  // --- Modern tech growth ---
  {
    author: "James Anderson",
    role: "ex-Scottish Mortgage, Baillie Gifford",
    quote:
      "Over half of the excess return from equities came from just 90 companies in the last ninety years. The median stock pays you nothing for the risk.",
    source: "Scottish Mortgage shareholder letter",
  },
  {
    author: "James Anderson",
    role: "ex-Scottish Mortgage, Baillie Gifford",
    quote:
      "We need to remain unconventional. Not only that, we need to become more radical and prepare to be even more so.",
    source: "Final SMT letter, 2022",
  },
  {
    author: "Tom Slater",
    role: "Baillie Gifford, US Equities",
    quote:
      "Your most successful holding will become a big part of the portfolio. Chipping it away in the name of risk control goes against the structure of returns — it's the small number of big winners that matter.",
    source: "Motley Fool interview, 2025",
  },
  {
    author: "Marc Andreessen",
    role: "a16z co-founder",
    quote: "Software is eating the world.",
    source: "Wall Street Journal essay, 2011",
  },
  {
    author: "Marc Andreessen",
    role: "a16z co-founder",
    quote:
      "In a startup, absolutely nothing happens unless you make it happen.",
    source: "a16z blog",
  },
];
