import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Tests run under Vitest (esbuild transpile, no tsc) and use test globals;
    // keep them out of the Next/TS lint pass so `next build` stays green.
    "__tests__/**",
    "vitest.config.mts",
    "vitest.setup.ts",
  ]),
]);

export default eslintConfig;
