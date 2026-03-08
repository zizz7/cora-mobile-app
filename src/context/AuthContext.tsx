/**
 * Authentication Context for Cora Cora Portal Mobile App.
 * Manages login, logout, token persistence via SecureStore, and auto-login on mount.
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, saveToken, getToken, deleteToken } from '../utils/api';
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
   * Sign in with email and password.
   */
  const signIn = useCallback(async (credentials: LoginCredentials) => {
    const response = await api.post<AuthResponse>('/auth/login', credentials as unknown as Record<string, unknown>);
    await saveToken(response.token);

    // Register for push notifications
    try {
      const pushToken = await registerForPushNotificationsAsync();
      if (pushToken) {
        await registerDeviceToken(pushToken);
      }
    } catch (e) {
      console.error('Push notification registration failed', e);
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

    // Register for push notifications
    try {
      const pushToken = await registerForPushNotificationsAsync();
      if (pushToken) {
        await registerDeviceToken(pushToken);
      }
    } catch (e) {
      console.error('Push notification registration failed', e);
    }

    setState({
      user,
      token,
      isLoading: false,
      isAuthenticated: true,
    });
  }, []);

  /**
   * Sign out: revoke token on server and clear local storage.
   */
  const signOut = useCallback(async () => {
    try {
      await api.post('/auth/logout', {});
    } catch {
      // Ignore server errors on logout (token may already be expired)
    }
    await deleteToken();
    setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
  }, []);

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
