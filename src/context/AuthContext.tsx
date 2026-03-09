/**
 * Authentication Context for Cora Cora Portal Mobile App.
 * Manages login, logout, token persistence via SecureStore, and auto-login on mount.
 *
 * Improvements:
 * - Listens for 401 "unauthorized" events from api.ts to auto-logout
 * - Unregisters device push token on logout
 * - Prevents duplicate logout calls
 */
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { api, saveToken, getToken, deleteToken, onUnauthorized } from '../utils/api';
import { registerForPushNotificationsAsync, registerDeviceToken } from '../utils/notifications';
import type { User, AuthResponse, LoginCredentials } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  authenticateWithToken: (token: string, user: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Guard against multiple simultaneous logout calls
  const isLoggingOut = useRef(false);

  /**
   * Internal logout helper — clears token and state.
   * Optionally calls server logout (skipped for 401-triggered logouts).
   */
  const performLogout = useCallback(async (callServer: boolean = true) => {
    if (isLoggingOut.current) return;
    isLoggingOut.current = true;

    try {
      // Unregister device push token
      try {
        await api.delete('/device-token');
      } catch {
        // Ignore — token may already be invalid
      }

      // Call server logout if requested
      if (callServer) {
        try {
          await api.post('/auth/logout', {});
        } catch {
          // Ignore server errors on logout (token may already be expired)
        }
      }
    } finally {
      await deleteToken();
      setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
      isLoggingOut.current = false;
    }
  }, []);

  /**
   * Listen for 401 events from the API client — auto-logout on token expiry.
   */
  useEffect(() => {
    const unsubscribe = onUnauthorized(() => {
      performLogout(false); // Don't call server — token is already invalid
    });
    return unsubscribe;
  }, [performLogout]);

  /**
   * On mount: check SecureStore for an existing token and validate it.
   */
  useEffect(() => {
    (async () => {
      try {
        const storedToken = await getToken();
        if (storedToken) {
          // Validate the token by fetching the user profile
          const user = await api.get<User>('/auth/me');
          setState({
            user,
            token: storedToken,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch {
        // Token expired or invalid — clear it
        await deleteToken();
        setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
      }
    })();
  }, []);

  /**
   * Sign in with user_id and password.
   */
  const signIn = useCallback(async (credentials: LoginCredentials) => {
    const response = await api.post<AuthResponse>('/auth/login', credentials as unknown as Record<string, unknown>);
    await saveToken(response.token);

    // Register for push notifications (non-blocking)
    try {
      const pushToken = await registerForPushNotificationsAsync();
      if (pushToken) {
        await registerDeviceToken(pushToken);
      }
    } catch (e) {
      console.warn('Push notification registration failed:', e);
    }

    setState({
      user: response.user,
      token: response.token,
      isLoading: false,
      isAuthenticated: true,
    });
  }, []);

  /**
   * Directly authenticate with an existing token and user object
   * (e.g., after a password reset).
   */
  const authenticateWithToken = useCallback(async (token: string, user: User) => {
    await saveToken(token);

    // Register for push notifications (non-blocking)
    try {
      const pushToken = await registerForPushNotificationsAsync();
      if (pushToken) {
        await registerDeviceToken(pushToken);
      }
    } catch (e) {
      console.warn('Push notification registration failed:', e);
    }

    setState({
      user,
      token,
      isLoading: false,
      isAuthenticated: true,
    });
  }, []);

  /**
   * Sign out: unregister device token, revoke token on server, and clear local storage.
   */
  const signOut = useCallback(async () => {
    await performLogout(true);
  }, [performLogout]);

  return (
    <AuthContext.Provider value={{ ...state, signIn, signOut, authenticateWithToken }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access authentication state and actions.
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
