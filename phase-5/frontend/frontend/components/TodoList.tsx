/**
 * TodoList component for displaying todos (Phase 5 enhanced).
 */
import { TodoResponse } from '../types';

interface TodoListProps {
  todos: TodoResponse[];
  onComplete: (id: number) => void;
  onUpdate: (id: number, title: string) => void;
  onDelete: (id: number) => void;
}

export default function TodoList({ todos, onComplete, onUpdate, onDelete }: TodoListProps) {
  if (todos.length === 0) {
    return <p>No todos yet. Create your first todo!</p>;
  }

  // Helper: Check if todo is overdue
  const isOverdue = (todo: TodoResponse): boolean => {
    if (!todo.due_date || todo.status === 'completed') return false;
    const dueDate = new Date(todo.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  // Helper: Get priority color
  const getPriorityColor = (priority?: string): string => {
    switch (priority) {
      case 'High': return '#dc3545';
      case 'Medium': return '#ffc107';
      case 'Low': return '#28a745';
      default: return '#6c757d';
    }
  };

  // Helper: Format date
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div>
      {todos.map((todo) => {
        const overdue = isOverdue(todo);

        return (
          <div
            key={todo.id}
            style={{
              border: overdue ? '2px solid #dc3545' : '1px solid #ddd',
              padding: '15px',
              marginBottom: '12px',
              borderRadius: '5px',
              backgroundColor: todo.status === 'completed' ? '#f0f0f0' : 'white',
              boxShadow: overdue ? '0 2px 8px rgba(220, 53, 69, 0.2)' : 'none'
            }}
          >
            {/* Header Row: Title and Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: '16px',
                    textDecoration: todo.status === 'completed' ? 'line-through' : 'none'
                  }}>
                    {todo.title}
                  </h3>

                  {/* Recurring icon */}
                  {todo.is_recurring && (
                    <span
                      title={`Recurring: ${todo.recurrence_pattern || 'Unknown'}`}
                      style={{
                        fontSize: '14px',
                        backgroundColor: '#17a2b8',
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontWeight: 'bold'
                      }}
                    >
                      ↻
                    </span>
                  )}
                </div>

                {/* Metadata Row: Priority, Tags, Due Date */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                  {/* Priority Badge */}
                  {todo.priority && (
                    <span style={{
                      backgroundColor: getPriorityColor(todo.priority),
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '3px',
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}>
                      {todo.priority}
                    </span>
                  )}

                  {/* Tags */}
                  {todo.tags && todo.tags.length > 0 && todo.tags.map((tag, index) => (
                    <span
                      key={index}
                      style={{
                        backgroundColor: '#e9ecef',
                        color: '#495057',
                        padding: '2px 8px',
                        borderRadius: '3px',
                        fontSize: '11px'
                      }}
                    >
                      {tag}
                    </span>
                  ))}

                  {/* Due Date */}
                  {todo.due_date && (
                    <span style={{
                      backgroundColor: overdue ? '#dc3545' : (todo.status === 'completed' ? '#6c757d' : '#007bff'),
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '3px',
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}>
                      {overdue ? '⚠ OVERDUE: ' : '📅 '}
                      {formatDate(todo.due_date)}
                    </span>
                  )}

                  {/* Status and ID */}
                  <span style={{ fontSize: '11px', color: '#6c757d' }}>
                    {todo.status} | #{todo.id}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                {todo.status === 'pending' && (
                  <button
                    onClick={() => onComplete(todo.id)}
                    title="Mark as complete"
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: '3px',
                      fontSize: '13px'
                    }}
                  >
                    ✓
                  </button>
                )}
                <button
                  onClick={() => {
                    const newTitle = prompt('Enter new title:', todo.title);
                    if (newTitle) onUpdate(todo.id, newTitle);
                  }}
                  title="Edit todo"
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#ffc107',
                    color: 'black',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '3px',
                    fontSize: '13px'
                  }}
                >
                  ✎
                </button>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this todo?')) {
                      onDelete(todo.id);
                    }
                  }}
                  title="Delete todo"
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '3px',
                    fontSize: '13px'
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
