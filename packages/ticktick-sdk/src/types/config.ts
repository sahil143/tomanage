import { StorageAdapter } from './storage';

/**
 * Configuration options for TickTickService
 */
export interface TickTickConfig {
  /**
   * TickTick OAuth Client ID
   */
  clientId: string;

  /**
   * TickTick OAuth Client Secret
   */
  clientSecret: string;

  /**
   * Storage adapter for token persistence
   */
  storage: StorageAdapter;

  /**
   * Optional base URL for TickTick API
   * Default: https://api.ticktick.com/open/v1
   */
  baseUrl?: string;

  /**
   * Optional OAuth URL for TickTick
   * Default: https://ticktick.com/oauth
   */
  oauthUrl?: string;

  /**
   * Optional request timeout in milliseconds
   * Default: 30000 (30 seconds)
   */
  timeout?: number;
}
