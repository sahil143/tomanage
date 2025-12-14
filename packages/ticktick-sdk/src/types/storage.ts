/**
 * Storage adapter interface for platform-agnostic storage
 * This allows the SDK to work with different storage mechanisms
 * (Expo SecureStore, localStorage, Node.js fs, etc.)
 */
export interface StorageAdapter {
  /**
   * Get an item from storage
   * @param key - The storage key
   * @returns The stored value or null if not found
   */
  getItem(key: string): Promise<string | null>;

  /**
   * Set an item in storage
   * @param key - The storage key
   * @param value - The value to store
   */
  setItem(key: string, value: string): Promise<void>;

  /**
   * Delete an item from storage
   * @param key - The storage key
   */
  deleteItem(key: string): Promise<void>;
}
