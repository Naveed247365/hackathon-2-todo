/**
 * TypeScript types for API responses.
 */

export interface TodoResponse {
  id: number;
  user_id: number;
  title: string;
  status: string;
  created_at: string;
}

export interface TokenResponse {
  user_id: number;
  email: string;
  token: string;
}
