/**
 * Cross-platform secure storage adapter
 * Uses expo-secure-store on native platforms
 */

import * as ExpoSecureStore from 'expo-secure-store';

export const SecureStore = ExpoSecureStore;
