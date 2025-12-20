import { router } from './trpc';
import { aiRouter } from './routers/ai';
import { storageRouter } from './routers/storage';
import { contextRouter } from './routers/context';

// Main app router combining all sub-routers
export const appRouter = router({
  ai: aiRouter,
  storage: storageRouter,
  context: contextRouter,
});

// Export type for use in frontend
export type AppRouter = typeof appRouter;
