import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { ticktickService } from '../services/ticktickService';
import { getTickTickAuthUrl } from '../utils/deepLinking';
import { API_CONFIG } from '../utils/constants';

// This is required for expo-web-browser to work properly
WebBrowser.maybeCompleteAuthSession();

interface TickTickAuthButtonProps {
  onAuthSuccess?: () => void;
  onAuthError?: (error: Error) => void;
}

export function TickTickAuthButton({ onAuthSuccess, onAuthError }: TickTickAuthButtonProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

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

  async function handleConnect() {
    try {
      setIsLoading(true);

      if (!API_CONFIG.TICKTICK_CLIENT_ID) {
        throw new Error('TickTick Client ID not configured. Please check your .env file.');
      }

      // Debug: Log the redirect URI being used
      const { getTickTickRedirectUri } = await import('../utils/deepLinking');
      const redirectUri = getTickTickRedirectUri();
      console.log('📍 Using Redirect URI:', redirectUri);
      console.log('📍 Expected Format:    tomanage://oauth/ticktick');
      console.log('📍 Client ID:', API_CONFIG.TICKTICK_CLIENT_ID);

      // Get the authorization URL
      const { url } = await getTickTickAuthUrl(API_CONFIG.TICKTICK_CLIENT_ID);
      console.log('📍 Authorization URL:', url);

      // Open the TickTick authorization page
      const result = await WebBrowser.openAuthSessionAsync(
        url,
        'tomanage://oauth/ticktick'
      );

      if (result.type === 'success') {
        // The OAuth callback will be handled by deep linking in the root layout
        // We'll check auth status after a short delay
        setTimeout(async () => {
          await checkAuthStatus();
          if (isAuthenticated) {
            onAuthSuccess?.();
          }
        }, 1000);
      } else if (result.type === 'cancel') {
        console.log('User cancelled authorization');
      }
    } catch (error) {
      console.error('Failed to initiate OAuth:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect to TickTick';
      Alert.alert('Connection Failed', errorMessage);
      onAuthError?.(error instanceof Error ? error : new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
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
              setIsLoading(true);
              await ticktickService.auth.logout();
              setIsAuthenticated(false);
              Alert.alert('Success', 'Disconnected from TickTick');
            } catch (error) {
              console.error('Failed to disconnect:', error);
              Alert.alert('Error', 'Failed to disconnect from TickTick');
            } finally {
              setIsLoading(false);
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
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          isAuthenticated ? styles.disconnectButton : styles.connectButton,
        ]}
        onPress={isAuthenticated ? handleDisconnect : handleConnect}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {isAuthenticated ? 'Disconnect' : 'Connect TickTick'}
          </Text>
        )}
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
