import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/tanstack-react-query';
import type { AppRouter } from '../../server/src/router';
import { API_CONFIG } from './constants';

// Create React hooks for tRPC
export const trpc = createTRPCReact<AppRouter>();

// Vanilla tRPC client (for non-hook usage)
export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${API_CONFIG.PROXY_BASE_URL}/trpc`,
      headers() {
        return {
          'x-user-id': 'user-1', // TODO: Get from auth context
        };
      },
    }),
  ],
});
