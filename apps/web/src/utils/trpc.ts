import { createTrpcReactQuery } from '@tomanage/shared';
import type { AppRouter } from '@tomanage/server/src/router';

/**
 * tRPC client setup for the web app
 *
 * Usage:
 *   const trpc = useTRPC();
 *   const { data } = trpc.ticktick.getTasks.useQuery();
 */
export const { TRPCProvider, useTRPC, useTRPCClient } = createTrpcReactQuery<AppRouter>();
