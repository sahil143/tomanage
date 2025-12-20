import crypto from 'node:crypto';
import {
  ticktickDisconnectInputSchema,
  ticktickExchangeCodeInputSchema,
  ticktickGetAuthUrlInputSchema,
  ticktickGetTasksInputSchema,
  ticktickSyncTasksInputSchema,
} from '../schemas';
import { storageService } from '../services/storage';
import { createTickTickClient } from '../services/ticktickService';
import { convertTickTickTaskToServerTodo } from '../services/ticktickTodoConverter';
import { publicProcedure, router } from '../trpc';

function buildAuthorizeUrl(params: {
  clientId: string;
  redirectUri: string;
  state: string;
}): string {
  const qp = new URLSearchParams({
    client_id: params.clientId,
    scope: 'tasks:read tasks:write',
    redirect_uri: params.redirectUri,
    response_type: 'code',
    state: params.state,
  });
  return `https://ticktick.com/oauth/authorize?${qp.toString()}`;
}

function isStale(fetchedAtIso: string, maxAgeSeconds: number): boolean {
  const fetchedAtMs = Date.parse(fetchedAtIso);
  if (!Number.isFinite(fetchedAtMs)) return true;
  return Date.now() - fetchedAtMs > maxAgeSeconds * 1000;
}

export const ticktickRouter = router({
  /**
   * Step 1: ask server for the auth URL.
   * Client should redirect the user to `url`.
   */
  getAuthUrl: publicProcedure
    .input(ticktickGetAuthUrlInputSchema)
    .query(({ input, ctx }) => {
      const userId = input.userId || ctx.userId;
      const clientId = process.env.TICKTICK_CLIENT_ID;
      if (!clientId) throw new Error('Missing env var: TICKTICK_CLIENT_ID');

      const state = crypto.randomUUID();
      storageService.setTickTickOAuthState(userId, state);

      return {
        url: buildAuthorizeUrl({
          clientId,
          redirectUri: input.redirectUri,
          state,
        }),
        state,
      };
    }),

  /**
   * Step 2: exchange code for an access token.
   * Client calls this after being redirected back with `?code=...&state=...`.
   */
  exchangeCode: publicProcedure
    .input(ticktickExchangeCodeInputSchema)
    .mutation(async ({ input, ctx }) => {
      const userId = input.userId || ctx.userId;

      const expected = storageService.getTickTickOAuthState(userId)?.state;
      if (!expected || expected !== input.state) {
        throw new Error('Invalid OAuth state. Restart TickTick connect flow.');
      }

      const ticktick = await createTickTickClient(userId);
      await ticktick.auth.exchangeCodeForToken(input.code, input.redirectUri);
      storageService.clearTickTickOAuthState(userId);

      return {
        success: true,
      };
    }),

  /**
   * Check if TickTick is connected for this user.
   */
  isConnected: publicProcedure
    .input(ticktickGetTasksInputSchema.pick({ userId: true }).optional())
    .query(({ input, ctx }) => {
      const userId = input?.userId || ctx.userId;
      const token = storageService.getTickTickAccessToken(userId);
      const cache = storageService.getTickTickTodosCache(userId);
      return {
        connected: !!token,
        lastSyncedAt: cache?.fetchedAt ?? null,
      };
    }),

  /**
   * Force a sync from TickTick and refresh cached tasks.
   */
  syncTasks: publicProcedure
    .input(ticktickSyncTasksInputSchema)
    .mutation(async ({ input, ctx }) => {
      const userId = input.userId || ctx.userId;
      const token = storageService.getTickTickAccessToken(userId);
      if (!token) throw new Error('TickTick not connected. Call ticktick.getAuthUrl first.');

      const ticktick = await createTickTickClient(userId);
      const tasks = await ticktick.tasks.getAll();
      const todos = tasks.map(convertTickTickTaskToServerTodo);

      storageService.setTickTickTodosCache(userId, todos);
      const cache = storageService.getTickTickTodosCache(userId);

      return {
        count: todos.length,
        fetchedAt: cache?.fetchedAt ?? new Date().toISOString(),
      };
    }),

  /**
   * Get tasks for the client. Uses cached tasks by default; refreshes if stale.
   */
  getTasks: publicProcedure
    .input(ticktickGetTasksInputSchema)
    .query(async ({ input, ctx }) => {
      const userId = input.userId || ctx.userId;
      const token = storageService.getTickTickAccessToken(userId);
      if (!token) throw new Error('TickTick not connected. Call ticktick.getAuthUrl first.');

      const maxAgeSeconds = input.maxAgeSeconds ?? 60;
      const cache = storageService.getTickTickTodosCache(userId);

      const shouldRefresh =
        input.refresh === true || !cache || isStale(cache.fetchedAt, maxAgeSeconds);

      if (shouldRefresh) {
        const ticktick = await createTickTickClient(userId);
        const tasks = await ticktick.tasks.getAll();
        const todos = tasks.map(convertTickTickTaskToServerTodo);
        storageService.setTickTickTodosCache(userId, todos);
      }

      const latest = storageService.getTickTickTodosCache(userId);
      return {
        fetchedAt: latest?.fetchedAt ?? null,
        todos: latest?.todos ?? [],
      };
    }),

  /**
   * Disconnect TickTick (clears server-side token + cached tasks).
   */
  disconnect: publicProcedure
    .input(ticktickDisconnectInputSchema)
    .mutation(({ input, ctx }) => {
      const userId = input.userId || ctx.userId;
      storageService.clearTickTickOAuthState(userId);
      storageService.clearTickTickAccessToken(userId);
      storageService.clearTickTickTodosCache(userId);
      return { success: true };
    }),
});


