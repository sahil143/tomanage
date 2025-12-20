/**
 * Cross-platform secure storage adapter
 * Uses expo-secure-store on native platforms
 */

import * as ExpoSecureStore from 'expo-secure-store';
import { StorageAdapter } from '@tomanage/ticktick-sdk';

export const SecureStore = ExpoSecureStore;

/**
 * Create a storage adapter for the TickTick SDK
 * This wraps Expo SecureStore to implement the SDK's StorageAdapter interface
 */
export function createTickTickStorageAdapter(): StorageAdapter {
  return {
    async getItem(key: string): Promise<string | null> {
      return await ExpoSecureStore.getItemAsync(key);
    },
    async setItem(key: string, value: string): Promise<void> {
      await ExpoSecureStore.setItemAsync(key, value);
    },
    async deleteItem(key: string): Promise<void> {
      await ExpoSecureStore.deleteItemAsync(key);
    },
  };
}
