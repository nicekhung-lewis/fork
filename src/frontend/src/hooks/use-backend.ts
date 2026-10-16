import { createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";

/**
 * Returns the typed backend actor plus its loading flag.
 * Call at the top level of a component or hook — never inside a query callback.
 */
export function useBackend() {
  const { actor, isFetching } = useActor(createActor);
  return { actor, isFetching, isReady: !!actor && !isFetching };
}
