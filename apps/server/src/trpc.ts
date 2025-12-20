import { initTRPC } from '@trpc/server';
import { CreateExpressContextOptions } from '@trpc/server/adapters/express';

// Context for tRPC - includes userId and request info
export const createContext = ({ req, res }: CreateExpressContextOptions) => {
  // In a real app, extract userId from auth token/session
  // For now, we'll use a default user or from headers
  const userId = (req.headers['x-user-id'] as string) || 'user-1';

  return {
    userId,
    req,
    res,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

// Initialize tRPC
const t = initTRPC.context<Context>().create();

// Export router and procedure helpers
export const router = t.router;
export const publicProcedure = t.procedure;
