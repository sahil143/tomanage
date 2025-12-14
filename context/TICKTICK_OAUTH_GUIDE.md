# TickTick OAuth Integration Guide

This guide explains how to implement TickTick OAuth2 authentication in your ToManage app.

## Overview

The OAuth flow consists of three main steps:

1. **Authorization Request**: Redirect user to TickTick to grant permissions
2. **Authorization Callback**: TickTick redirects back with an authorization code
3. **Token Exchange**: Exchange the code for an access token

## Implementation Steps

### Step 1: Initiate OAuth Flow

When the user wants to connect their TickTick account (e.g., from Settings screen):

```typescript
import * as WebBrowser from 'expo-web-browser';
import { API_CONFIG } from '../utils/constants';
import { getTickTickAuthUrl } from '../utils/deepLinking';

async function handleConnectTickTick() {
  try {
    // Get the authorization URL with state parameter
    const { url } = await getTickTickAuthUrl(API_CONFIG.TICKTICK_CLIENT_ID);

    // Open the TickTick authorization page in browser
    const result = await WebBrowser.openAuthSessionAsync(
      url,
      'tomanage://oauth/ticktick'
    );

    if (result.type === 'success') {
      // The callback will be handled by deep linking
      console.log('OAuth flow initiated');
    } else {
      console.log('User cancelled authorization');
    }
  } catch (error) {
    console.error('Failed to initiate OAuth:', error);
  }
}
```

### Step 2: Handle OAuth Callback

Set up deep link handling in your app's root component (e.g., `app/_layout.tsx`):

```typescript
import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { ticktickService } from '../services/ticktickService';
import {
  parseDeepLink,
  validateOAuthState,
  clearOAuthState,
  getTickTickRedirectUri
} from '../utils/deepLinking';

function RootLayout() {
  useEffect(() => {
    // Handle initial URL if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Listen for deep link events while app is running
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  async function handleDeepLink(url: string) {
    const { path, queryParams } = parseDeepLink(url);

    // Check if this is a TickTick OAuth callback
    if (path === 'oauth/ticktick') {
      await handleTickTickCallback(queryParams);
    }
  }

  async function handleTickTickCallback(params: Record<string, any>) {
    try {
      const { code, state, error, error_description } = params;

      // Check for OAuth errors
      if (error) {
        console.error('OAuth error:', error_description || error);
        // Show error to user
        return;
      }

      if (!code || !state) {
        console.error('Missing code or state in OAuth callback');
        return;
      }

      // Validate state parameter to prevent CSRF attacks
      const isValidState = await validateOAuthState(state);
      if (!isValidState) {
        console.error('Invalid OAuth state - possible CSRF attack');
        return;
      }

      // Exchange code for access token
      const redirectUri = getTickTickRedirectUri();
      await ticktickService.exchangeCodeForToken(code, redirectUri);

      // Clear the stored state
      await clearOAuthState();

      console.log('Successfully authenticated with TickTick!');
      // Navigate to success screen or refresh data

    } catch (error) {
      console.error('Failed to complete OAuth flow:', error);
      // Show error to user
    }
  }

  // ... rest of your layout
}
```

### Step 3: Use the Access Token

Once authenticated, the access token is automatically included in all TickTick API requests:

```typescript
import { ticktickService } from '../services/ticktickService';

async function syncWithTickTick() {
  try {
    // Check if user is authenticated
    const isAuthenticated = await ticktickService.isAuthenticated();

    if (!isAuthenticated) {
      // Prompt user to connect TickTick account
      return;
    }

    // Fetch all tasks - token is automatically included
    const tasks = await ticktickService.getTasks();
    console.log('Synced tasks:', tasks);

    // Create a new task
    const newTask = await ticktickService.createTask({
      title: 'New task from ToManage',
      description: 'Created via OAuth',
      priority: 'high',
    });

  } catch (error) {
    console.error('Failed to sync with TickTick:', error);
  }
}
```

### Step 4: Logout

To disconnect the TickTick account:

```typescript
async function handleDisconnectTickTick() {
  try {
    await ticktickService.logout();
    console.log('Disconnected from TickTick');
  } catch (error) {
    console.error('Failed to disconnect:', error);
  }
}
```

## Configuration

### 1. Environment Variables

Create a `.env` file based on `.env.example`:

```bash
EXPO_PUBLIC_TICKTICK_CLIENT_ID=your_client_id_here
EXPO_PUBLIC_TICKTICK_CLIENT_SECRET=your_client_secret_here
```

### 2. App Configuration (app.json)

Ensure your `app.json` includes the deep linking scheme:

```json
{
  "expo": {
    "scheme": "tomanage",
    "ios": {
      "bundleIdentifier": "com.yourcompany.tomanage"
    },
    "android": {
      "package": "com.yourcompany.tomanage"
    }
  }
}
```

### 3. TickTick OAuth App Settings

In your TickTick OAuth app configuration, set the redirect URI to:

```
tomanage://oauth/ticktick
```

## Security Considerations

1. **State Parameter**: The implementation uses a random state parameter to prevent CSRF attacks. This is automatically validated when the callback is received.

2. **Secure Storage**: Access tokens are stored securely using `expo-secure-store`, which uses the device's keychain on iOS and EncryptedSharedPreferences on Android.

3. **Client Secret**: In production, consider moving the token exchange to a backend server to protect your client secret. The current implementation includes it in the app for simplicity.

## Testing

1. **Redirect URI**: Make sure the redirect URI in your code matches exactly what's configured in TickTick OAuth app settings.

2. **Logging**: Enable detailed logging to debug OAuth flow:
   ```typescript
   console.log('Auth URL:', authUrl);
   console.log('Redirect URI:', redirectUri);
   console.log('Callback params:', params);
   ```

3. **Error Handling**: Check the `error` and `error_description` parameters in the callback for OAuth errors.

## Common Issues

1. **"Invalid redirect_uri"**: Make sure the redirect URI matches exactly in:
   - Your code (`getTickTickRedirectUri()`)
   - TickTick OAuth app settings
   - The token exchange request

2. **"Invalid client"**: Check that your client ID and secret are correct.

3. **State validation fails**: This could happen if the app was restarted between authorization and callback. Consider handling this gracefully.

## API Reference

### TickTickService Methods

- `exchangeCodeForToken(code: string, redirectUri: string): Promise<string>` - Exchange authorization code for access token
- `isAuthenticated(): Promise<boolean>` - Check if user has a valid token
- `logout(): Promise<void>` - Clear the stored access token
- `getTasks(): Promise<Todo[]>` - Fetch all tasks from TickTick
- `createTask(todo: Partial<Todo>): Promise<Todo>` - Create a new task
- `updateTask(ticktickId: string, todo: Partial<Todo>): Promise<Todo>` - Update a task
- `deleteTask(ticktickId: string): Promise<void>` - Delete a task
- `completeTask(ticktickId: string): Promise<void>` - Mark task as completed

### Deep Linking Utilities

- `getTickTickAuthUrl(clientId: string): Promise<{ url: string; state: string }>` - Generate OAuth authorization URL
- `getTickTickRedirectUri(): string` - Get the OAuth redirect URI
- `validateOAuthState(state: string): Promise<boolean>` - Validate OAuth state parameter
- `clearOAuthState(): Promise<void>` - Clear stored OAuth state
- `parseDeepLink(url: string): { hostname, path, queryParams }` - Parse deep link URL

## Next Steps

1. Install required dependencies:
   ```bash
   yarn add expo-web-browser
   ```

2. Implement the OAuth flow in your Settings screen

3. Set up deep link handling in your root layout

4. Test the complete flow with your TickTick credentials

5. Add error handling and user feedback (loading states, error messages, success notifications)
