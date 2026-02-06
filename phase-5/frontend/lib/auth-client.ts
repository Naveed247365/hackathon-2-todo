/**
 * Client-side auth helpers for Better Auth + JWT.
 * Provides token management that bridges Better Auth sessions with backend JWT auth.
 */
import { getSession } from './auth';

/**
 * Get the JWT token from Better Auth session.
 * Falls back to localStorage for backwards compatibility.
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    const session = await getSession();
    if (session?.data?.session?.token) {
      return session.data.session.token;
    }
  } catch {
    // Fall through to localStorage
  }

  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

/**
 * Check if user is authenticated.
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getAuthToken();
  return !!token;
}
