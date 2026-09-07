import { QueryClient, isServer } from "@tanstack/react-query";

/**
 * Create a QueryClient with sensible defaults for an admin console: modest
 * staleness, no refetch-on-focus noise, and a single retry.
 */
function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/**
 * Return a stable QueryClient. On the server, always make a fresh one (never
 * share between requests). In the browser, reuse a singleton so React state
 * during suspense doesn't discard the cache.
 */
export function getQueryClient(): QueryClient {
  if (isServer) {
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}
