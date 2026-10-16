import { fileURLToPath, URL } from "url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/**
 * Vitest configuration for the frontend suite.
 *
 * Mirrors the Vite `@` alias so tests import production modules by the same
 * specifier the app does, runs in jsdom, and registers the jest-dom matchers.
 *
 * `maxWorkers`/`minWorkers` are pinned to 1 because the build environment
 * exports conflicting thread-count variables that otherwise make Tinypool
 * throw `options.minThreads and options.maxThreads must not conflict`.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: "declarations",
        replacement: fileURLToPath(new URL("../declarations", import.meta.url)),
      },
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
    ],
    dedupe: ["@icp-sdk/core"],
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    pool: "forks",
    maxWorkers: 1,
    minWorkers: 1,
  },
});
