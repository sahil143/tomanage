import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';

/**
 * OAuth callback route for TickTick
 * Handles: tomanage://oauth/ticktick?code=xxx&state=yyy
 */
export default function TickTickOAuthCallback() {
  const params = useLocalSearchParams<{
    code?: string;
    state?: string;
    error?: string;
    error_description?: string;
  }>();

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    const { code, state, error, error_description } = params;

    if (error) {
      console.error('OAuth error:', error_description || error);
      // TODO: Show error to user
      // Navigate back to settings after 2 seconds
      setTimeout(() => {
        router.replace('/(tabs)/settings');
      }, 2000);
      return;
    }

    if (code && state) {
      try {
        console.log('OAuth code received, processing...');

        // Import dynamically to avoid circular dependencies
        const { validateOAuthState, clearOAuthState, getTickTickRedirectUri } =
          await import('../../src/utils/deepLinking');
        const { ticktickService } = await import('../../src/services/ticktickService');

        // Validate state parameter
        const isValidState = await validateOAuthState(state);
        if (!isValidState) {
          console.error('Invalid OAuth state');
          // TODO: Show error
          router.replace('/(tabs)/settings');
          return;
        }

        // Exchange code for token
        const redirectUri = getTickTickRedirectUri();
        await ticktickService.exchangeCodeForToken(code, redirectUri);

        // Clear stored state
        await clearOAuthState();

        console.log('Successfully authenticated with TickTick!');

        // Navigate to settings with success message
        router.replace('/(tabs)/settings');
      } catch (err) {
        console.error('Error processing OAuth callback:', err);
        // TODO: Show error
        router.replace('/(tabs)/settings');
      }
    } else {
      // Missing required parameters
      console.error('Missing OAuth parameters');
      router.replace('/(tabs)/settings');
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#3b82f6" />
      <Text style={styles.text}>
        {params.error ? 'Authentication failed' : 'Completing authentication...'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
});
