import { initTRPC } from '@trpc/server';
import type { Context } from './context';

// Initialize tRPC
const t = initTRPC.context<Context>().create();

// Export router and procedure helpers
export const router = t.router;
export const publicProcedure = t.procedure;
