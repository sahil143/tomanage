/**
 * Web-compatible storage implementation
 * Fallback for expo-secure-store which doesn't work on web
 */

const STORAGE_PREFIX = 'tomanage_';

export const SecureStore = {
  async getItemAsync(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(STORAGE_PREFIX + key);
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },

  async setItemAsync(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, value);
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      throw error;
    }
  },

  async deleteItemAsync(key: string): Promise<void> {
    try {
      localStorage.removeItem(STORAGE_PREFIX + key);
    } catch (error) {
      console.error('Error deleting from localStorage:', error);
      throw error;
    }
  },
};
