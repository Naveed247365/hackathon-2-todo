/**
 * TypeScript types for API responses.
 */

export type PriorityLevel = 'High' | 'Medium' | 'Low';
export type RecurrencePattern = 'Daily' | 'Weekly' | 'Monthly';

export interface TodoResponse {
  id: number;
  user_id: number;
  title: string;
  status: string;
  created_at: string;
  // Phase 5 fields
  priority?: PriorityLevel;
  tags?: string[];
  due_date?: string; // ISO date string
  is_recurring?: boolean;
  recurrence_pattern?: RecurrencePattern;
  parent_todo_id?: number;
}

export interface TokenResponse {
  user_id: number;
  email: string;
  token: string;
}
