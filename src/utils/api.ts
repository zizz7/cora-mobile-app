/**
 * API Client for Cora Cora Portal.
 * Configured with Sanctum Bearer token auth from SecureStore.
 *
 * Improvements:
 * - API_BASE_URL read from app.json extra config (no more hardcoded)
 * - 401 auto-logout via event emitter
 * - PATCH method added
 * - Multipart/form-data support for file uploads
 */
import Constants from 'expo-constants';
import { secureStorage } from './secureStorage';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const extra = Constants.expoConfig?.extra ?? {};
export const API_BASE_URL: string =
  extra.apiBaseUrl || 'https://portal.coracoraresorts.com/api';

const TOKEN_KEY = 'auth_token';

// ---------------------------------------------------------------------------
// 401 Event Emitter — allows AuthContext to listen for forced logouts
// ---------------------------------------------------------------------------

type UnauthorizedListener = () => void;
const unauthorizedListeners: Set<UnauthorizedListener> = new Set();

/** Subscribe to 401 events. Returns an unsubscribe function. */
export function onUnauthorized(listener: UnauthorizedListener): () => void {
  unauthorizedListeners.add(listener);
  return () => {
    unauthorizedListeners.delete(listener);
  };
}

function emitUnauthorized() {
  unauthorizedListeners.forEach((fn) => {
    try {
      fn();
    } catch {
      // Swallow errors in listeners
    }
  });
}

// ---------------------------------------------------------------------------
// Token Management
// ---------------------------------------------------------------------------

/** Save auth token to device secure storage. */
export async function saveToken(token: string): Promise<void> {
  await secureStorage.setItem(TOKEN_KEY, token);
}

/** Get auth token from device secure storage. */
export async function getToken(): Promise<string | null> {
  return await secureStorage.getItem(TOKEN_KEY);
}

/** Delete auth token from device secure storage. */
export async function deleteToken(): Promise<void> {
  await secureStorage.deleteItem(TOKEN_KEY);
}

// ---------------------------------------------------------------------------
// Core API Request
// ---------------------------------------------------------------------------

/**
 * Core API request function with automatic Bearer token injection.
 * Emits an "unauthorized" event on 401 responses so AuthContext can auto-logout.
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getToken();

  const headers: HeadersInit = {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  // Only set Content-Type to JSON if body is not FormData (multipart)
  if (!(options.body instanceof FormData)) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 401 — token expired or revoked
  if (response.status === 401) {
    emitUnauthorized();
    const errorBody = await response.json().catch(() => ({
      message: 'Session expired. Please log in again.',
    }));
    throw { ...errorBody, status: 401 };
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({
      message: `Request failed with status ${response.status}`,
    }));
    throw { ...errorBody, status: response.status };
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// ---------------------------------------------------------------------------
// Convenience Methods
// ---------------------------------------------------------------------------

export const api = {
  get: <T>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, body: Record<string, unknown>) =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body: Record<string, unknown>) =>
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  patch: <T>(endpoint: string, body: Record<string, unknown>) =>
    apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  delete: <T>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: 'DELETE' }),

  /** Upload files via multipart/form-data. */
  upload: <T>(endpoint: string, formData: FormData) =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: formData,
      // Do NOT set Content-Type — fetch will auto-set with boundary
    }),
};
