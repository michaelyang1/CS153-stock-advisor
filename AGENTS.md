<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Testing — REQUIRED for every change

**Every feature added or bug fixed MUST ship with tests in the same change.** This is non-negotiable: tests lock in existing behavior so future work can't silently regress it. Do not open a PR that adds or changes behavior without corresponding tests.

- Stack: **Vitest + React Testing Library + jsdom**, set up per the official Next.js guide (`node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md`).
- Tests live in `__tests__/` (`*.test.ts` / `*.test.tsx`).
- Commands: `npm test` (single run), `npm run test:watch` (watch mode).
- What to cover when you touch each area:
  - **Pure logic** (`app/api/quotes/route.ts`, `lib/tools.ts` `scoreThesis`/`addToWatchlist`, `lib/tickerSnapshot.ts`): unit-test the behavior directly; mock `fetch` for network calls.
  - **Data libs** (`lib/frontier-theses.ts`, `lib/quotes.ts`, `lib/persona.ts`): assert structural invariants and key copy contracts.
  - **Client components / the page**: render with Testing Library; mock `useChat` from `@ai-sdk/react` when rendering `app/page.tsx`. Async Server Components are NOT unit-testable under Vitest (use the running app to verify those).
- CI (`.github/workflows/test.yml`) runs lint + test + build on every PR. Keep it green.
- Build hygiene: test files are excluded from `tsconfig.json` and ESLint so `next build` does not type-check/lint them. If you add a new test directory, mirror those excludes.
