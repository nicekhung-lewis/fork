/**
 * Register the jest-dom matcher types (`toBeInTheDocument`, `toHaveTextContent`,
 * …) with the TypeScript program.
 *
 * `vitest.setup.ts` imports `@testing-library/jest-dom/vitest` at runtime, but
 * that file lives outside the `src` directory that `tsconfig.json` includes, so
 * `tsc --noEmit` never sees the module augmentation. Importing it here — inside
 * `src` — makes the matchers visible to the type checker.
 */
import "@testing-library/jest-dom/vitest";
