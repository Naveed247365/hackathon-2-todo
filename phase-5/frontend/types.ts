/**
 * TypeScript types for Phase 5 Todo application
 */

export type Priority = 'High' | 'Medium' | 'Low';
export type RecurrencePattern = 'Daily' | 'Weekly' | 'Monthly';
export type TodoStatus = 'pending' | 'completed';

export interface Todo {
  id: number;
  user_id: number;
  title: string;
  status: TodoStatus;
  created_at: string;
  // Phase 5 fields
  priority: Priority;
  tags: string[];
  due_date: string | null;
  is_recurring: boolean;
  recurrence_pattern: RecurrencePattern | null;
  parent_todo_id: number | null;
}

export interface TodoResponse {
  todos: Todo[];
}

export interface CreateTodoData {
  title: string;
  priority?: Priority;
  tags?: string[];
  due_date?: string;
  is_recurring?: boolean;
  recurrence_pattern?: RecurrencePattern;
}

export interface UpdateTodoData {
  title?: string;
  status?: TodoStatus;
  priority?: Priority;
  tags?: string[];
  due_date?: string;
  is_recurring?: boolean;
  recurrence_pattern?: RecurrencePattern;
}
