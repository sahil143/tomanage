import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AnyRouter } from '@trpc/server';
import { createTRPCContext } from '@trpc/tanstack-react-query';
import React, { useState } from 'react';

export type TrpcHeaders =
  | Record<string, string>
  | (() => Record<string, string> | Promise<Record<string, string>>);

export type TrpcProviderProps = {
  url: string;
  headers?: TrpcHeaders;
  children: React.ReactNode;
  /**
   * Optional data transformer (e.g. superjson).
   * If omitted, we default to an identity transformer.
   */
  transformer?: unknown;
  /**
   * Default 60s. Tune per app.
   */
  staleTimeMs?: number;
  /**
   * Default 1. Tune per app.
   */
  retry?: number;
};

/**
 * Shared tRPC + TanStack React Query setup.
 *
 * Use this for SPA / Expo (no SSR) across web/mobile/desktop.
 *
 * Usage:
 *   const { TRPCProvider, useTRPC, useTRPCClient } = createTrpcReactQuery<AppRouter>();
 *   const trpc = useTRPC();
 *   // useQuery(trpc.someRoute.someProc.queryOptions(...))
 */
export function createTrpcReactQuery<TRouter extends AnyRouter>() {
  const { TRPCProvider: BaseTRPCProvider, useTRPC, useTRPCClient } =
    createTRPCContext<TRouter>();

  const defaultTransformer = {
    input: {
      serialize: (data: unknown) => data,
      deserialize: (data: unknown) => data,
    },
    output: {
      serialize: (data: unknown) => data,
      deserialize: (data: unknown) => data,
    },
  };

  function TRPCProvider({
    url,
    headers,
    transformer,
    staleTimeMs = 60_000,
    retry = 1,
    children,
  }: TrpcProviderProps) {
    const [queryClient] = useState(
      () =>
        new QueryClient({
          defaultOptions: {
            queries: {
              staleTime: staleTimeMs,
              retry,
            },
          },
        })
    );

    const [trpcClient] = useState(() =>
      createTRPCClient<TRouter>({
        links: [
          httpBatchLink({
            url,
            transformer: (transformer ?? defaultTransformer) as any,
            headers: typeof headers === 'function' ? headers : () => headers ?? {},
          } as any),
        ],
      })
    );

    return (
      <BaseTRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </BaseTRPCProvider>
    );
  }

  return { TRPCProvider, useTRPC, useTRPCClient };
}


