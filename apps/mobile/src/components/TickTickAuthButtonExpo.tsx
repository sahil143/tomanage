import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { ticktickService } from '../services/ticktickService';
import { API_CONFIG } from '../utils/constants';

// This is required for expo-auth-session to work properly
WebBrowser.maybeCompleteAuthSession();

interface TickTickAuthButtonProps {
  onAuthSuccess?: () => void;
  onAuthError?: (error: Error) => void;
}

// TickTick OAuth endpoints
const discovery = {
  authorizationEndpoint: 'https://ticktick.com/oauth/authorize',
  tokenEndpoint: 'https://ticktick.com/oauth/token',
};

export function TickTickAuthButtonExpo({ onAuthSuccess, onAuthError }: TickTickAuthButtonProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Generate redirect URI that works with TickTick
  // Using native proxy parameter to force HTTPS URL
  const redirectUri = AuthSession.makeRedirectUri({
    native: 'https://auth.expo.io/@tomanageorg/tomanage',
    // This will use the HTTPS proxy URL that TickTick accepts
  });

  // Log the redirect URI for debugging
  useEffect(() => {
    console.log('=== TickTick OAuth Configuration ===');
    console.log('📍 Redirect URI:', redirectUri);
    console.log('📍 Format:', redirectUri.startsWith('https://') ? 'HTTPS ✅' : 'Custom Scheme (may not work)');
    console.log('📍 Register this EXACT URI in TickTick Developer Console');
    console.log('=====================================');
  }, [redirectUri]);

  // Create OAuth request
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: API_CONFIG.TICKTICK_CLIENT_ID,
      scopes: ['tasks:read', 'tasks:write'],
      redirectUri,
      usePKCE: false, // TickTick uses client_secret instead of PKCE
    },
    discovery
  );

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Handle OAuth response
  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
      handleAuthCode(code);
    } else if (response?.type === 'error') {
      console.error('OAuth error:', response.error);
      Alert.alert('Authentication Error', response.error?.message || 'Failed to authenticate');
      onAuthError?.(new Error(response.error?.message || 'OAuth failed'));
    }
  }, [response]);

  async function checkAuthStatus() {
    try {
      const authenticated = await ticktickService.auth.isAuthenticated();
      setIsAuthenticated(authenticated);
    } catch (error) {
      console.error('Failed to check auth status:', error);
    } finally {
      setIsChecking(false);
    }
  }

  async function handleAuthCode(code: string) {
    try {
      console.log('OAuth code received, exchanging for token...');

      // Exchange code for access token
      await ticktickService.auth.exchangeCodeForToken(code, redirectUri);

      console.log('Successfully authenticated with TickTick!');
      setIsAuthenticated(true);
      Alert.alert('Success', 'Successfully connected to TickTick!');
      onAuthSuccess?.();
    } catch (error) {
      console.error('Failed to exchange code for token:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete authentication';
      Alert.alert('Authentication Failed', errorMessage);
      onAuthError?.(error instanceof Error ? error : new Error(errorMessage));
    }
  }

  async function handleConnect() {
    if (!API_CONFIG.TICKTICK_CLIENT_ID) {
      Alert.alert('Configuration Error', 'TickTick Client ID not configured. Please check your .env file.');
      return;
    }

    if (!request) {
      Alert.alert('Error', 'OAuth request not ready. Please try again.');
      return;
    }

    // Initiate OAuth flow
    promptAsync();
  }

  async function handleDisconnect() {
    Alert.alert(
      'Disconnect TickTick',
      'Are you sure you want to disconnect your TickTick account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              await ticktickService.auth.logout();
              setIsAuthenticated(false);
              Alert.alert('Success', 'Disconnected from TickTick');
            } catch (error) {
              console.error('Failed to disconnect:', error);
              Alert.alert('Error', 'Failed to disconnect from TickTick');
            }
          },
        },
      ]
    );
  }

  if (isChecking) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <Text style={styles.title}>TickTick Integration</Text>
        <Text style={styles.description}>
          {isAuthenticated
            ? 'Your TickTick account is connected'
            : 'Connect your TickTick account to sync tasks'}
        </Text>
        {!isAuthenticated && (
          <Text style={styles.redirectUriHint}>
            Register this URI in TickTick:{'\n'}
            <Text style={styles.redirectUriText}>{redirectUri}</Text>
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          isAuthenticated ? styles.disconnectButton : styles.connectButton,
        ]}
        onPress={isAuthenticated ? handleDisconnect : handleConnect}
        disabled={!request && !isAuthenticated}
      >
        <Text style={styles.buttonText}>
          {isAuthenticated ? 'Disconnect' : 'Connect TickTick'}
        </Text>
      </TouchableOpacity>

      {isAuthenticated && (
        <View style={styles.statusContainer}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Connected</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  redirectUriHint: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 4,
  },
  redirectUriText: {
    fontFamily: 'monospace',
    color: '#3B82F6',
    fontSize: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  connectButton: {
    backgroundColor: '#3B82F6',
  },
  disconnectButton: {
    backgroundColor: '#EF4444',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    justifyContent: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
});
