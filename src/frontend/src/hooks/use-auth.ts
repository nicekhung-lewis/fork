import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useMemo } from "react";

export interface AuthState {
  /** The caller's principal as a string, or null when signed out. */
  principal: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoggingIn: boolean;
  loginError?: Error;
  login: () => void;
  logout: () => void;
}

/**
 * Internet Identity session state for the app.
 * Wraps the platform identity provider so components never touch it directly.
 */
export function useAuth(): AuthState {
  const {
    identity,
    login,
    clear,
    isAuthenticated,
    isInitializing,
    isLoggingIn,
    loginError,
  } = useInternetIdentity();

  const principal = useMemo(
    () => (identity ? identity.getPrincipal().toText() : null),
    [identity],
  );

  return {
    principal,
    isAuthenticated,
    isInitializing,
    isLoggingIn,
    loginError,
    login: () => login(),
    logout: () => clear(),
  };
}
