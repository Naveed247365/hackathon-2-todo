/**
 * Better Auth client configuration with JWT plugin.
 * Provides authentication with JWT token support for backend API calls.
 */
import { createAuthClient } from 'better-auth/react';
import { jwtClient } from 'better-auth/client/plugins';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const authClient = createAuthClient({
  baseURL: API_URL,
  plugins: [jwtClient()],
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;
