import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

// Vitest setup follows the official Next.js App Router testing guide
// (node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md): jsdom +
// @testing-library/react. The `@/*` path alias is wired explicitly here rather
// than via vite-tsconfig-paths because the test files are excluded from
// tsconfig (to keep them out of `next build`'s type-check), and the tsconfig
// plugin only resolves aliases for files within the tsconfig scope.
const root = fileURLToPath(new URL(".", import.meta.url)).replace(/\/$/, "");

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": root,
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["__tests__/**/*.test.{ts,tsx}"],
  },
});
