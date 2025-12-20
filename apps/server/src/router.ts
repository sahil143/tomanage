import { aiRouter } from './routers/ai';
import { contextRouter } from './routers/context';
import { storageRouter } from './routers/storage';
import { ticktickRouter } from './routers/ticktick';
import { router } from './trpc';

// Main app router combining all sub-routers
export const appRouter = router({
  ai: aiRouter,
  storage: storageRouter,
  context: contextRouter,
  ticktick: ticktickRouter,
});

// Export type for use in frontend
export type AppRouter = typeof appRouter;
