import { storageService } from './storage';

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

/**
 * Create a per-user TickTick client (server-side).
 * Tokens are stored server-side via `storageService`.
 */
export async function createTickTickClient(userId: string) {
  // Dynamic import so server can stay CommonJS while consuming ESM ticktick-sdk
  const { default: TickTickService } = await import('@tomanage/ticktick-sdk');
  const clientId = requireEnv('TICKTICK_CLIENT_ID');
  const clientSecret = requireEnv('TICKTICK_CLIENT_SECRET');

  const storageAdapter = {
    async getItem(key: string) {
      if (key === 'ticktick-access-token') {
        return storageService.getTickTickAccessToken(userId);
      }
      return null;
    },
    async setItem(key: string, value: string) {
      if (key === 'ticktick-access-token') {
        storageService.setTickTickAccessToken(userId, value);
      }
    },
    async deleteItem(key: string) {
      if (key === 'ticktick-access-token') {
        storageService.clearTickTickAccessToken(userId);
      }
    },
  };

  return new TickTickService({
    clientId,
    clientSecret,
    storage: storageAdapter,
  });
}


