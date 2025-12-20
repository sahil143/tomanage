import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { z } from "zod";
import type {
  getPatternInputSchema,
  saveAnalyticsInputSchema,
  savePatternInputSchema,
} from "./schemas";

export type SavePatternInput = z.infer<typeof savePatternInputSchema>;
export type GetPatternInput = z.infer<typeof getPatternInputSchema>;
export type SaveAnalyticsInput = z.infer<typeof saveAnalyticsInputSchema>;

export type GetUserProfileInput = { userId?: string };

export interface TrpcCaller {
  storage: {
    savePattern(input: SavePatternInput): Promise<unknown>;
    getPattern(input: GetPatternInput): Promise<unknown>;
    saveAnalytics(input: SaveAnalyticsInput): Promise<unknown>;
    getAnalytics(input: { userId?: string; limit?: number }): Promise<unknown>;
  };
  context: {
    getUserProfile(input: GetUserProfileInput): Promise<unknown>;
  };
}

export type Context = {
  userId: string;
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  /**
   * Per-request tRPC caller (appRouter.createCaller(ctx)) injected in `src/index.ts`.
   * Optional to avoid circular typing during caller creation.
   */
  caller?: TrpcCaller;
};

// Context for tRPC - includes userId and request info
export function createContext({ req, res }: CreateExpressContextOptions): Omit<Context, "caller"> {
  // In a real app, extract userId from auth token/session
  // For now, we'll use a default user or from headers
  const userId = (req.headers["x-user-id"] as string) || "user-1";

  return {
    userId,
    req,
    res,
  };
}


