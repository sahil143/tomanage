import { StorageAdapter } from '../types/storage';
import { OAuthTokenRequest, OAuthTokenResponse } from '../types/api';
import { TickTickAuthError } from '../types/errors';
import { STORAGE_KEYS, TICKTICK_API } from '../utils/constants';

export class AuthService {
  private storage: StorageAdapter;
  private clientId: string;
  private clientSecret: string;
  private oauthUrl: string;
  private timeout: number;

  constructor(
    storage: StorageAdapter,
    clientId: string,
    clientSecret: string,
    oauthUrl: string = TICKTICK_API.OAUTH_URL,
    timeout: number = TICKTICK_API.DEFAULT_TIMEOUT
  ) {
    this.storage = storage;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.oauthUrl = oauthUrl;
    this.timeout = timeout;
  }

  /**
   * Store access token in storage
   */
  async setAccessToken(token: string): Promise<void> {
    try {
      await this.storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    } catch (error) {
      throw new TickTickAuthError(
        `Failed to store access token: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Retrieve access token from storage
   */
  async getAccessToken(): Promise<string | null> {
    try {
      return await this.storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Failed to retrieve access token:', error);
      return null;
    }
  }

  /**
   * Exchange authorization code for access token
   * This is Step 3 of the OAuth flow
   * @param code - The authorization code received from TickTick
   * @param redirectUri - The same redirect URI used in the authorization request
   * @returns The access token
   */
  async exchangeCodeForToken(code: string, redirectUri: string): Promise<string> {
    try {
      if (!this.clientId || !this.clientSecret) {
        throw new TickTickAuthError('TickTick client ID or secret not configured');
      }

      // Create Basic Auth header
      const credentials = `${this.clientId}:${this.clientSecret}`;
      const base64Credentials = this.base64Encode(credentials);

      // Prepare form data
      const formBody: OAuthTokenRequest = {
        client_id: this.clientId,
        code,
        grant_type: 'authorization_code',
        scope: 'tasks:read tasks:write',
        redirect_uri: redirectUri,
      };

      const formData = new URLSearchParams(formBody as any);

      // Make request using fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      try {
        const response = await fetch(`${this.oauthUrl}/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${base64Credentials}`,
          },
          body: formData.toString(),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data = await response.json() as OAuthTokenResponse;

        if (!response.ok) {
          const errorData = data as any;
          throw new TickTickAuthError(
            errorData.error_description || errorData.error || `HTTP ${response.status}`
          );
        }

        if (!data.access_token) {
          throw new TickTickAuthError('No access token received from TickTick');
        }

        // Store the token
        await this.setAccessToken(data.access_token);

        return data.access_token;
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      if (error instanceof TickTickAuthError) {
        throw error;
      }
      throw new TickTickAuthError(
        `Failed to exchange code for token: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Check if user is authenticated (has a valid token)
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    return !!token;
  }

  /**
   * Logout and clear the access token
   */
  async logout(): Promise<void> {
    try {
      await this.storage.deleteItem(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Failed to clear access token:', error);
    }
  }

  /**
   * Base64 encode a string (cross-platform)
   */
  private base64Encode(str: string): string {
    if (typeof Buffer !== 'undefined') {
      // Node.js
      return Buffer.from(str).toString('base64');
    } else if (typeof btoa !== 'undefined') {
      // Browser
      return btoa(str);
    } else {
      // Fallback: manual base64 encoding
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      let result = '';
      let i = 0;

      while (i < str.length) {
        const a = str.charCodeAt(i++);
        const b = i < str.length ? str.charCodeAt(i++) : 0;
        const c = i < str.length ? str.charCodeAt(i++) : 0;

        const bitmap = (a << 16) | (b << 8) | c;

        result += chars.charAt((bitmap >> 18) & 63);
        result += chars.charAt((bitmap >> 12) & 63);
        result += i - 2 < str.length ? chars.charAt((bitmap >> 6) & 63) : '=';
        result += i - 1 < str.length ? chars.charAt(bitmap & 63) : '=';
      }

      return result;
    }
  }
}
