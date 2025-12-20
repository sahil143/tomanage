import React, { useEffect, useState, useCallback } from 'react';
import { StatusBar, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as Linking from 'expo-linking';
import { Slot } from 'expo-router';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { TRPCProvider } from '../src/providers/TRPCProvider';
import { useTodoStore } from '../src/store/todoStore';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const loadTodos = useTodoStore((state) => state.loadTodos);

  useEffect(() => {
    async function prepare() {
      try {
        // Load cached todos from storage
        await loadTodos();

        // Add any other initialization here (e.g., load fonts, check auth status)
        // await loadFonts();
        // await checkAuthStatus();

        // Artificial delay to ensure splash screen shows briefly
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Error during app initialization:', error);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, [loadTodos]);

  // Handle deep links (for OAuth callback)
  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      const { url } = event;
      console.log('Deep link received:', url);

      try {
        // Import dynamically to avoid circular dependencies
        const { parseDeepLink, validateOAuthState, clearOAuthState, getTickTickRedirectUri } = await import('../src/utils/deepLinking');
        const { ticktickService } = await import('../src/services/ticktickService');

        // Parse the URL to extract OAuth callback data
        const { path, queryParams } = parseDeepLink(url);

        // Handle TickTick OAuth callback
        if (path === 'oauth/ticktick') {
          const { code, state, error, error_description } = queryParams as {
            code?: string;
            state?: string;
            error?: string;
            error_description?: string;
          };

          if (error) {
            console.error('OAuth error:', error_description || error);
            // Note: Alert needs to be imported from react-native if you want to use it
            // Alert.alert('Authentication Error', `Failed to connect to TickTick: ${error_description || error}`);
          } else if (code && state) {
            console.log('OAuth code received, validating...');

            // Validate state parameter to prevent CSRF attacks
            const isValidState = await validateOAuthState(state);
            if (!isValidState) {
              console.error('Invalid OAuth state - possible CSRF attack');
              // Alert.alert('Security Error', 'Invalid authentication state. Please try again.');
              return;
            }

            // Exchange code for access token
            const redirectUri = getTickTickRedirectUri();
            await ticktickService.auth.exchangeCodeForToken(code, redirectUri);

            // Clear the stored state
            await clearOAuthState();

            console.log('Successfully authenticated with TickTick!');
            // Alert.alert('Success', 'Successfully connected to TickTick!');
          }
        }
      } catch (err) {
        console.error('Error handling deep link:', err);
        // Alert.alert('Error', 'Failed to complete authentication');
      }
    };

    // Get initial URL if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    // Listen for deep links while app is running
    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // Hide the splash screen
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  const handleReset = useCallback(() => {
    // Reset app state if needed
    setAppIsReady(false);
    setTimeout(() => setAppIsReady(true), 100);
  }, []);

  if (!appIsReady) {
    return null;
  }

  return (
    <ErrorBoundary onReset={handleReset}>
      <TRPCProvider>
        <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
          <SafeAreaProvider>
            <StatusBar
              barStyle="dark-content"
              backgroundColor="#ffffff"
              translucent={Platform.OS === 'android'}
            />
            <Slot />
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </TRPCProvider>
    </ErrorBoundary>
  );
}
