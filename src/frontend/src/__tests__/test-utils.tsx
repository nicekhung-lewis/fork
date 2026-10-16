import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { type RenderResult, render } from "@testing-library/react";
import type { ReactNode } from "react";

export * from "./mock-state";

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

/**
 * Render a single component inside a fresh QueryClient. Use for components that
 * do not need routing (forms, lists).
 */
export function renderWithProviders(ui: ReactNode): RenderResult {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

/**
 * The slice of the router that tests inspect: the current location. Typed
 * structurally so the concrete `RouterCore` generic does not have to be named.
 */
export interface TestRouter {
  state: {
    location: {
      pathname: string;
      search: Record<string, unknown>;
    };
  };
}

/**
 * Render a page at a real route through a memory-history router, so
 * `useParams` / `useSearch` / `Link` behave as they do in the app.
 */
export function renderRoute(
  path: string,
  component: () => ReactNode,
  options: { initialEntries?: string[] } = {},
): { result: RenderResult; router: TestRouter } {
  const queryClient = createTestQueryClient();
  const rootRoute = createRootRoute({ component: () => <Outlet /> });
  const route = createRoute({
    getParentRoute: () => rootRoute,
    path,
    component: component as never,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([route]),
    history: createMemoryHistory({
      initialEntries: options.initialEntries ?? [path],
    }),
  });
  const result = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router as never} />
    </QueryClientProvider>,
  );
  return { result, router: router as unknown as TestRouter };
}
