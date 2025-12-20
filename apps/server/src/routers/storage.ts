import { router, publicProcedure } from '../trpc';
import { storageService } from '../services/storage';
import {
  savePatternInputSchema,
  getPatternInputSchema,
  savePreferencesInputSchema,
  saveAnalyticsInputSchema,
  patternTypeSchema,
  userPreferencesSchema,
} from '../schemas';
import { z } from 'zod';

export const storageRouter = router({
  // Save a learned pattern (callable by AI)
  savePattern: publicProcedure
    .input(savePatternInputSchema)
    .mutation(({ input, ctx }) => {
      const userId = input.userId || ctx.userId;
      storageService.savePattern(userId, input.patternType, input.data);

      return {
        success: true,
        message: `Pattern '${input.patternType}' saved successfully`,
      };
    }),

  // Get a saved pattern (callable by AI)
  getPattern: publicProcedure
    .input(getPatternInputSchema)
    .query(({ input, ctx }) => {
      const userId = input.userId || ctx.userId;
      const pattern = storageService.getPattern(userId, input.patternType);

      return {
        patternType: input.patternType,
        data: pattern,
        found: pattern !== null,
      };
    }),

  // Get all patterns for a user
  getAllPatterns: publicProcedure
    .input(z.object({ userId: z.string().optional() }))
    .query(({ input, ctx }) => {
      const userId = input.userId || ctx.userId;
      const patterns = storageService.getAllPatterns(userId);

      return {
        userId,
        patterns,
      };
    }),

  // Save user preferences
  savePreferences: publicProcedure
    .input(savePreferencesInputSchema)
    .mutation(({ input, ctx }) => {
      const userId = input.userId || ctx.userId;
      storageService.savePreferences(userId, input.preferences);

      return {
        success: true,
        message: 'Preferences saved successfully',
      };
    }),

  // Get user preferences
  getPreferences: publicProcedure
    .input(z.object({ userId: z.string().optional() }))
    .query(({ ctx, input }) => {
      const userId = input.userId || ctx.userId;
      const preferences = storageService.getOrCreateDefaultPreferences(userId);

      return {
        userId,
        preferences,
      };
    }),

  // Save analytics entry (callable by AI)
  saveAnalytics: publicProcedure
    .input(saveAnalyticsInputSchema)
    .mutation(({ input, ctx }) => {
      const userId = input.userId || ctx.userId;
      storageService.saveAnalytics(userId, input.entry);

      return {
        success: true,
        message: 'Analytics entry saved successfully',
      };
    }),

  // Get analytics data
  getAnalytics: publicProcedure
    .input(z.object({
      userId: z.string().optional(),
      limit: z.number().optional(),
    }))
    .query(({ input, ctx }) => {
      const userId = input.userId || ctx.userId;
      const analytics = storageService.getAnalytics(userId, input.limit);

      return {
        userId,
        entries: analytics,
        count: analytics.length,
      };
    }),

  // Clear user data (utility)
  clearUserData: publicProcedure
    .input(z.object({ userId: z.string().optional() }))
    .mutation(({ input, ctx }) => {
      const userId = input.userId || ctx.userId;
      storageService.clear(userId);

      return {
        success: true,
        message: `All data cleared for user ${userId}`,
      };
    }),
});
