/**
 * Cross-platform secure storage utility.
 *
 * - Native (iOS/Android): uses expo-secure-store (encrypted keychain/keystore)
 * - Web: falls back to localStorage (prefixed, not encrypted — web is dev/testing only)
 *
 * This shim prevents crashes when running in a browser via `npx expo start --web`.
 */
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const WEB_PREFIX = 'cora_secure_';

export const secureStorage = {
  /**
   * Save a value by key.
   */
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(WEB_PREFIX + key, value);
      } catch {
        // localStorage may be unavailable in some contexts
      }
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },

  /**
   * Get a value by key. Returns null if not found.
   */
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      try {
        return localStorage.getItem(WEB_PREFIX + key);
      } catch {
        return null;
      }
    }
    return await SecureStore.getItemAsync(key);
  },

  /**
   * Delete a value by key.
   */
  async deleteItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        localStorage.removeItem(WEB_PREFIX + key);
      } catch {
        // Ignore
      }
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};
