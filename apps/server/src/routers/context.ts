import { router, publicProcedure } from '../trpc';
import { getCurrentContext, getUserProfile } from '../utils/contextBuilder';
import { z } from 'zod';

export const contextRouter = router({
  // Get current time-based context
  getCurrentContext: publicProcedure
    .input(z.object({ userId: z.string().optional() }))
    .query(({ input, ctx }) => {
      const userId = input.userId || ctx.userId;
      const context = getCurrentContext(userId);

      return {
        userId,
        context,
      };
    }),

  // Get full user profile (callable by AI)
  getUserProfile: publicProcedure
    .input(z.object({ userId: z.string().optional() }))
    .query(({ input, ctx }) => {
      const userId = input.userId || ctx.userId;
      const profile = getUserProfile(userId);

      return profile;
    }),
});
