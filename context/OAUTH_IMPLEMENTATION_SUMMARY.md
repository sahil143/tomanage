# TickTick OAuth Implementation Summary

## What Was Implemented

I've implemented a complete OAuth2 authentication flow for TickTick integration in your ToManage app. Here's what was added:

### 1. OAuth Service Methods ([src/services/ticktickService.ts](src/services/ticktickService.ts))

Added three key methods to the TickTickService class:

- **`exchangeCodeForToken(code: string, redirectUri: string): Promise<string>`**
  - Implements Step 3 of OAuth flow
  - Exchanges authorization code for access token
  - Uses Basic Auth with client ID and secret
  - Stores token securely in device keychain/encrypted storage
  - Returns the access token

- **`isAuthenticated(): Promise<boolean>`**
  - Checks if user has a valid access token
  - Used to show connected/disconnected state in UI

- **`logout(): Promise<void>`**
  - Clears the stored access token
  - Disconnects the TickTick account

### 2. Deep Linking Utilities ([src/utils/deepLinking.ts](src/utils/deepLinking.ts))

Enhanced the deep linking module with OAuth security features:

- **`getTickTickAuthUrl(clientId: string)`**
  - Now async and returns `{ url, state }`
  - Generates and stores a random state parameter for CSRF protection
  - Constructs the OAuth authorization URL with all required parameters

- **`validateOAuthState(state: string): Promise<boolean>`**
  - Validates the state parameter from OAuth callback
  - Prevents CSRF attacks by comparing with stored state

- **`clearOAuthState(): Promise<void>`**
  - Cleans up the stored state after successful authentication

### 3. UI Component ([src/components/TickTickAuthButton.tsx](src/components/TickTickAuthButton.tsx))

Created a ready-to-use authentication button component:

- Shows current connection status (Connected/Not connected)
- "Connect TickTick" button when not authenticated
- "Disconnect" button when authenticated
- Loading states during authentication
- Error handling with alerts
- Uses `expo-web-browser` for OAuth flow
- Callbacks for success/error handling

### 4. Settings Screen Integration ([src/screens/SettingsScreen.tsx](src/screens/SettingsScreen.tsx))

Integrated the TickTickAuthButton into the Settings screen:

- Replaced the placeholder TickTick setting with the actual auth button
- Added callbacks to log success/error events

### 5. OAuth Callback Handling ([app/_layout.tsx](app/_layout.tsx))

Implemented complete OAuth callback handling in the root layout:

- Listens for deep link events
- Parses OAuth callback parameters (code, state, error)
- Validates state parameter for security
- Exchanges code for access token
- Handles errors gracefully
- Cleans up stored state after completion

### 6. App Configuration ([app.config.js](app.config.js))

Created an app config file to:

- Load environment variables from .env file
- Expose TickTick credentials to the app
- Configure deep linking scheme
- Set bundle identifiers for iOS and Android

### 7. Dependencies

Added required package:
- `base-64` - For base64 encoding (React Native compatible)
- `@types/base-64` - TypeScript types for base-64

## How the OAuth Flow Works

### Step 1: User Initiates Connection
1. User opens Settings screen
2. Taps "Connect TickTick" button
3. App generates authorization URL with:
   - Client ID
   - Redirect URI (`tomanage://oauth/ticktick`)
   - Scope (`tasks:read tasks:write`)
   - Random state parameter (stored securely)
4. Opens TickTick authorization page in browser

### Step 2: User Grants Access
1. User logs into TickTick (if not already)
2. Reviews requested permissions
3. Clicks "Authorize"
4. TickTick redirects back to app with:
   - Authorization code
   - State parameter

### Step 3: Token Exchange
1. App receives deep link callback
2. Validates state parameter (CSRF protection)
3. Exchanges authorization code for access token using:
   - Basic Auth (client ID + secret)
   - Form-encoded POST request
4. Stores access token securely
5. Cleans up state parameter

### Step 4: Making API Requests
1. All subsequent TickTick API calls automatically include:
   - `Authorization: Bearer <access_token>` header
2. Users can now sync tasks, create tasks, etc.

## Security Features

1. **State Parameter Validation**
   - Prevents CSRF attacks
   - Random state generated for each auth flow
   - Validated before token exchange

2. **Secure Token Storage**
   - Uses `expo-secure-store`
   - iOS: Keychain
   - Android: EncryptedSharedPreferences

3. **HTTPS Only**
   - All API requests use HTTPS
   - Token transmitted securely

## Configuration Required

### 1. Environment Variables (.env)

```bash
EXPO_PUBLIC_TICKTICK_CLIENT_ID=your_client_id
EXPO_PUBLIC_TICKTICK_CLIENT_SECRET=your_client_secret
EXPO_PUBLIC_ANTHROPIC_API_KEY=your_anthropic_key
```

### 2. TickTick OAuth App Settings

In your TickTick developer console, configure:

**Redirect URI:**
```
tomanage://oauth/ticktick
```

**Scopes:**
- `tasks:read`
- `tasks:write`

## Testing the Implementation

1. **Create .env file:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual credentials
   ```

2. **Start the app:**
   ```bash
   yarn start
   ```

3. **Test the OAuth flow:**
   - Navigate to Settings screen
   - Tap "Connect TickTick"
   - Complete authorization in browser
   - App should redirect back and show "Connected" status

4. **Test API calls:**
   ```typescript
   import { ticktickService } from './src/services/ticktickService';

   // Check if authenticated
   const isAuth = await ticktickService.isAuthenticated();

   // Fetch tasks
   const tasks = await ticktickService.getTasks();

   // Create task
   const newTask = await ticktickService.createTask({
     title: 'Test task',
     priority: 'high',
   });
   ```

## Files Modified/Created

### Created:
- [src/components/TickTickAuthButton.tsx](src/components/TickTickAuthButton.tsx) - OAuth button component
- [app.config.js](app.config.js) - App configuration with env vars
- [TICKTICK_OAUTH_GUIDE.md](TICKTICK_OAUTH_GUIDE.md) - Detailed implementation guide
- [OAUTH_IMPLEMENTATION_SUMMARY.md](OAUTH_IMPLEMENTATION_SUMMARY.md) - This file

### Modified:
- [src/services/ticktickService.ts](src/services/ticktickService.ts:63-131) - Added OAuth methods
- [src/utils/deepLinking.ts](src/utils/deepLinking.ts:42-91) - Enhanced with OAuth security
- [src/screens/SettingsScreen.tsx](src/screens/SettingsScreen.tsx:68-75) - Integrated auth button
- [app/_layout.tsx](app/_layout.tsx:40-108) - Added OAuth callback handling

### Updated:
- [package.json](package.json) - Added `base-64` dependency

## Next Steps

1. **Test the complete flow** with your TickTick credentials
2. **Add visual feedback** - Show toast notifications for success/error
3. **Add refresh token support** if TickTick provides it
4. **Implement token refresh** logic before expiration
5. **Add sync functionality** - Auto-sync tasks when connected
6. **Error recovery** - Handle expired tokens gracefully

## Troubleshooting

### Common Issues:

1. **"Invalid redirect_uri"**
   - Ensure redirect URI in TickTick app matches: `tomanage://oauth/ticktick`
   - Check deep link scheme in app.json: `"scheme": "tomanage"`

2. **"Invalid client"**
   - Verify client ID and secret in .env file
   - Ensure environment variables are loaded in app.config.js

3. **State validation fails**
   - This can happen if app restarts between auth and callback
   - Clear app data and try again

4. **Token not included in requests**
   - Check SecureStore permissions
   - Verify token was stored successfully
   - Check axios interceptor in ticktickService.ts:19-30

## API Reference

For detailed API usage, see [TICKTICK_OAUTH_GUIDE.md](TICKTICK_OAUTH_GUIDE.md).
