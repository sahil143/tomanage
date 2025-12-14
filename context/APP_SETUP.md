# ToManage App Setup Documentation

## Overview

ToManage is an AI-powered task management React Native application built with Expo. It integrates with TickTick for task synchronization and uses Anthropic's Claude AI for intelligent task recommendations.

## App Architecture

### Entry Point: `app/_layout.tsx`

The app layout provides the following features:

1. **Error Boundary**: Catches and displays errors gracefully
2. **Splash Screen**: Shows while the app initializes
3. **Deep Linking**: Handles OAuth callbacks from TickTick
4. **State Initialization**: Loads cached todos from secure storage
5. **Provider Wrapping**: Sets up GestureHandler, SafeArea, and Navigation

### Key Providers

```tsx
<ErrorBoundary>
  <GestureHandlerRootView>
    <SafeAreaProvider>
      <StatusBar />
      <AppNavigator />
    </SafeAreaProvider>
  </GestureHandlerRootView>
</ErrorBoundary>
```

## Deep Linking & OAuth Flow

### Configuration

**app.json**:
- Scheme: `tomanage`
- iOS Bundle ID: `com.tomanageorg.tomanage`
- Android Package: `com.tomanageorg.tomanage`

### OAuth Redirect URI

The app is configured to handle deep links at:
```
tomanage://oauth/ticktick
```

### TickTick OAuth Flow

1. **User initiates OAuth** (from Settings screen):
   ```tsx
   import { getTickTickAuthUrl } from '../utils/deepLinking';

   const authUrl = getTickTickAuthUrl(TICKTICK_CLIENT_ID);
   await WebBrowser.openAuthSessionAsync(authUrl);
   ```

2. **TickTick redirects** to `tomanage://oauth/ticktick?code=XXX`

3. **App handles callback** (in `_layout.tsx`):
   ```tsx
   if (hostname === 'oauth' && path === 'ticktick') {
     const { code } = queryParams;
     // Exchange code for access token
     await ticktickService.exchangeCodeForToken(code);
   }
   ```

4. **Access token saved** to secure storage via `ticktickService`

### Deep Link Utilities

Located in `src/utils/deepLinking.ts`:

- `createDeepLink(path, params)`: Creates app deep link URLs
- `getTickTickRedirectUri()`: Gets OAuth redirect URI
- `getTickTickAuthUrl(clientId)`: Constructs TickTick auth URL
- `parseDeepLink(url)`: Parses incoming deep links

## Initialization Sequence

1. **Splash Screen Prevention**: `SplashScreen.preventAutoHideAsync()`
2. **Load Todos**: Fetch cached todos from SecureStore via Zustand
3. **Optional Initialization**:
   - Load custom fonts (commented out)
   - Check authentication status (commented out)
4. **Delay**: Brief artificial delay for UX
5. **Set Ready**: `setAppIsReady(true)`
6. **Hide Splash**: `SplashScreen.hideAsync()` on layout

## Error Handling

### ErrorBoundary Component

Located in `src/components/ErrorBoundary.tsx`:

- Catches React errors in component tree
- Displays user-friendly error screen
- Shows debug info in development mode
- Provides "Try Again" button to reset state

### Deep Link Error Handling

```tsx
try {
  const { hostname, path, queryParams } = Linking.parse(url);
  // Handle OAuth callback
} catch (err) {
  console.error('Error handling deep link:', err);
}
```

## StatusBar Configuration

- **Style**: Dark content (dark text on light background)
- **Background**: White (#ffffff)
- **Translucent**: Android only
- **Safe Area**: Handled by SafeAreaProvider

## State Management

### Initial Load

The app loads todos on mount via Zustand store:

```tsx
const loadTodos = useTodoStore((state) => state.loadTodos);

useEffect(() => {
  async function prepare() {
    await loadTodos();
    // ...
  }
  prepare();
}, [loadTodos]);
```

### Persisted State

Using Zustand persist middleware with SecureStore:
- Todos are cached locally
- Last sync timestamp stored
- Access tokens securely stored

## Navigation Setup

### Responsive Design

- **Mobile (< 768px)**: Bottom tab navigation
  - Home (Tasks)
  - Chat (AI Assistant)
  - Settings

- **Tablet (≥ 768px)**: Split view
  - Left pane: HomeScreen
  - Right pane: ChatScreen

### Navigation Types

```tsx
export type RootStackParamList = {
  Main: undefined;
  TodoDetail: { todoId: string };
};

export type TabParamList = {
  Home: undefined;
  Chat: undefined;
  Settings: undefined;
};
```

## Development vs Production

### Development Mode

- Error boundary shows stack traces
- Console logs for deep linking
- TODO comments for unimplemented features

### Production Checklist

- [ ] Replace placeholder API keys with environment variables
- [ ] Implement TickTick OAuth token exchange
- [ ] Add error alerts for OAuth failures
- [ ] Implement clipboard functionality (expo-clipboard)
- [ ] Add state parameter verification for OAuth security
- [ ] Configure actual TickTick OAuth client ID/secret
- [ ] Set up proper error tracking (Sentry, etc.)
- [ ] Add analytics tracking

## Environment Variables

Create `.env` file (not tracked in git):

```env
ANTHROPIC_API_KEY=your_api_key_here
TICKTICK_CLIENT_ID=your_client_id_here
TICKTICK_CLIENT_SECRET=your_client_secret_here
```

## Testing Deep Links

### iOS Simulator

```bash
xcrun simctl openurl booted "tomanage://oauth/ticktick?code=test123"
```

### Android Emulator

```bash
adb shell am start -W -a android.intent.action.VIEW -d "tomanage://oauth/ticktick?code=test123"
```

### Physical Device

Use a tool like [ngrok](https://ngrok.com/) to test OAuth flow:
1. Set up ngrok tunnel
2. Configure TickTick OAuth redirect to ngrok URL
3. Ngrok redirects to `tomanage://` scheme

## Troubleshooting

### Splash Screen Won't Hide

- Ensure `appIsReady` is set to `true`
- Check for errors in initialization
- Verify `onLayoutRootView` is called

### Deep Links Not Working

- Verify scheme in `app.json`
- Check iOS Bundle ID / Android Package
- Test with simulator/emulator commands
- Review deep link handler logs

### Todos Not Loading

- Check SecureStore permissions
- Verify Zustand persist configuration
- Look for errors in `loadTodos` function
- Clear app data and reinstall

### Navigation Issues

- Ensure all screens are properly exported
- Check navigation types match usage
- Verify SafeAreaProvider wraps navigator
- Test on different screen sizes

## Platform-Specific Notes

### iOS

- Requires `associatedDomains` for universal links
- Bundle identifier must match app.json
- Test on both iPhone and iPad for responsive design

### Android

- Intent filters configured for deep linking
- Package name must match app.json
- Edge-to-edge enabled for modern Android
- Test with different Android versions

## Next Steps

1. Implement TickTick OAuth token exchange
2. Add user alerts for OAuth success/failure
3. Create Settings screen OAuth flow
4. Add loading states during authentication
5. Implement secure token storage
6. Add token refresh logic
7. Create logout functionality
