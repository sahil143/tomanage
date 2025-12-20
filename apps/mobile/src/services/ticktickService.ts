import { TickTickService } from '@tomanage/ticktick-sdk';
import { createTickTickStorageAdapter } from '../utils/storage';
import { API_CONFIG } from '../utils/constants';

/**
 * TickTick SDK instance configured for the app
 * Uses the chainable API:
 * - ticktickService.auth.exchangeCodeForToken(code, redirectUri)
 * - ticktickService.tasks.getAll()
 * - ticktickService.projects.get(id)
 */
export const ticktickService = new TickTickService({
  clientId: API_CONFIG.TICKTICK_CLIENT_ID,
  clientSecret: API_CONFIG.TICKTICK_CLIENT_SECRET,
  storage: createTickTickStorageAdapter(),
});
