import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

/**
 * Mirror the app entry point's global BigInt serialization.
 *
 * `src/main.tsx` installs `BigInt.prototype.toJSON` before rendering, so
 * `JSON.stringify` works on the bigint ids and timestamps the backend returns.
 * Tests render pages directly and never import `main.tsx`, so without this the
 * query-key hashing inside TanStack Query throws
 * "Do not know how to serialize a BigInt" — a failure that cannot happen in the
 * deployed app. Keep this in sync with `main.tsx`.
 */
BigInt.prototype.toJSON = function () {
  return this.toString();
};

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

/**
 * The platform module is mocked globally, before any test file imports a
 * production module, so `useActor` and `useInternetIdentity` never touch a real
 * agent or Internet Identity. Tests drive the shared state in
 * `src/__tests__/mock-state.ts`.
 */
vi.mock("@caffeineai/core-infrastructure", async () => {
  const state = await import("./src/__tests__/mock-state");
  return {
    useActor: () => ({
      actor: state.actorState.actor,
      isFetching: state.actorState.isFetching,
    }),
    useInternetIdentity: () => ({
      identity: state.authState.principal
        ? { getPrincipal: () => ({ toText: () => state.authState.principal }) }
        : undefined,
      login: state.authState.login,
      clear: state.authState.logout,
      loginStatus: "idle",
      isInitializing: state.authState.isInitializing,
      isLoginIdle: !state.authState.isLoggingIn,
      isLoggingIn: state.authState.isLoggingIn,
      isLoginSuccess: false,
      isLoginError: false,
      isSessionExpired: false,
      isAuthenticated: state.authState.isAuthenticated,
      loginError: undefined,
    }),
    InternetIdentityProvider: ({ children }: { children: unknown }) => children,
  };
});

// React Testing Library does not auto-clean when Vitest globals are disabled.
afterEach(() => {
  cleanup();
});
