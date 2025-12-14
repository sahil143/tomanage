import * as Linking from 'expo-linking';
import { SecureStore } from './storage';

export const DEEP_LINK_SCHEME = 'tomanage';

export const DeepLinkPaths = {
  OAUTH_TICKTICK: 'oauth/ticktick',
} as const;

const OAUTH_STATE_KEY = 'oauth-state';

/**
 * Creates a deep link URL for the app
 * @param path - The path within the app (e.g., 'oauth/ticktick')
 * @param params - Optional query parameters
 * @returns The complete deep link URL
 */
export function createDeepLink(
  path: string,
  params?: Record<string, string>
): string {
  const url = Linking.createURL(path, {
    scheme: DEEP_LINK_SCHEME,
    queryParams: params,
  });
  return url;
}

/**
 * Gets the OAuth redirect URI for TickTick
 * This is the URL that TickTick will redirect to after authentication
 */
export function getTickTickRedirectUri(): string {
  // Use explicit format to ensure consistency with TickTick OAuth app settings
  // Format: scheme://path (e.g., tomanage://oauth/ticktick)
  return `${DEEP_LINK_SCHEME}://${DeepLinkPaths.OAUTH_TICKTICK}`;
}

/**
 * Constructs the TickTick OAuth authorization URL
 * @param clientId - The TickTick OAuth client ID
 * @returns Object containing the authorization URL and the state parameter
 */
export async function getTickTickAuthUrl(clientId: string): Promise<{ url: string; state: string }> {
  const redirectUri = getTickTickRedirectUri();
  const scope = 'tasks:read tasks:write';
  const state = generateRandomState();

  // Store state for validation when OAuth callback returns
  await SecureStore.setItemAsync(OAUTH_STATE_KEY, state);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope,
    state,
    response_type: 'code',
  });

  return {
    url: `https://ticktick.com/oauth/authorize?${params.toString()}`,
    state,
  };
}

/**
 * Validates the OAuth state parameter returned from TickTick
 * @param state - The state parameter from the OAuth callback
 * @returns True if the state matches the stored state, false otherwise
 */
export async function validateOAuthState(state: string): Promise<boolean> {
  try {
    const storedState = await SecureStore.getItemAsync(OAUTH_STATE_KEY);
    if (!storedState) {
      return false;
    }
    return storedState === state;
  } catch (error) {
    console.error('Failed to validate OAuth state:', error);
    return false;
  }
}

/**
 * Clears the stored OAuth state
 */
export async function clearOAuthState(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(OAUTH_STATE_KEY);
  } catch (error) {
    console.error('Failed to clear OAuth state:', error);
  }
}

/**
 * Generates a random state parameter for OAuth security
 */
function generateRandomState(): string {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
}

/**
 * Parses deep link URL and extracts relevant data
 */
export function parseDeepLink(url: string): {
  hostname: string | null;
  path: string | null;
  queryParams: Record<string, any>;
} {
  const { hostname, path, queryParams } = Linking.parse(url);
  return {
    hostname: hostname || null,
    path: path || null,
    queryParams: queryParams || {},
  };
}
