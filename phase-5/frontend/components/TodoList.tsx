/**
 * TodoList component for displaying todos (Phase 5 enhanced).
 */
import { Todo } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface TodoListProps {
  todos: Todo[];
  onComplete: (id: number) => void;
  onUpdate: (id: number, title: string) => void;
  onDelete: (id: number) => void;
}

export default function TodoList({ todos, onComplete, onUpdate, onDelete }: TodoListProps) {
  const { theme } = useTheme();

  if (todos.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px',
        color: theme === 'dark' ? '#94a3b8' : '#6c757d',
        fontSize: '16px',
        backgroundColor: theme === 'dark' ? '#0f172a' : '#f8fafc',
        borderRadius: '12px',
        border: `2px dashed ${theme === 'dark' ? '#334155' : '#e2e8f0'}`,
        marginTop: '20px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
        <h3 style={{ margin: '0 0 8px 0', color: theme === 'dark' ? '#cbd5e1' : '#4a5568' }}>No todos yet</h3>
        <p style={{ margin: 0, color: theme === 'dark' ? '#94a3b8' : '#718096' }}>Create your first todo to get started!</p>
      </div>
    );
  }

  // Helper: Check if todo is overdue
  const isOverdue = (todo: Todo): boolean => {
    if (!todo.due_date || todo.status === 'completed') return false;
    const dueDate = new Date(todo.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  // Helper: Get priority color
  const getPriorityColor = (priority?: string): string => {
    switch (priority) {
      case 'High': return theme === 'dark' ? '#f87171' : '#ef4444';
      case 'Medium': return theme === 'dark' ? '#fbbf24' : '#f59e0b';
      case 'Low': return theme === 'dark' ? '#34d399' : '#10b981';
      default: return theme === 'dark' ? '#94a3b8' : '#6b7280';
    }
  };

  // Helper: Get priority bg color
  const getPriorityBgColor = (priority?: string): string => {
    switch (priority) {
      case 'High': return theme === 'dark' ? '#450a0a' : '#fee2e2';
      case 'Medium': return theme === 'dark' ? '#713f12' : '#fef3c7';
      case 'Low': return theme === 'dark' ? '#14532d' : '#d1fae5';
      default: return theme === 'dark' ? '#334155' : '#e5e7eb';
    }
  };

  // Helper: Format date
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {todos.map((todo) => {
        const overdue = isOverdue(todo);

        return (
          <div
            key={todo.id}
            style={{
              backgroundColor: theme === 'dark' ? '#1e293b' : 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: theme === 'dark'
                ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
                : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: overdue
                ? `2px solid ${theme === 'dark' ? '#f87171' : '#ef4444'}`
                : `1px solid ${theme === 'dark' ? '#334155' : '#e5e7eb'}`,
              transition: 'transform 0.2s, box-shadow 0.2s',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = theme === 'dark'
                ? '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)'
                : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = theme === 'dark'
                ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
                : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
            }}
          >
            {/* Priority accent bar */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: '6px',
                backgroundColor: getPriorityColor(todo.priority)
              }}
            />

            <div style={{ marginLeft: '12px' }}>
              {/* Header Row: Title and Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                    <input
                      type="checkbox"
                      checked={todo.status === 'completed'}
                      onChange={() => onComplete(todo.id)}
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '6px',
                        border: `2px solid ${theme === 'dark' ? '#475569' : '#d1d5db'}`,
                        backgroundColor: theme === 'dark' ? '#0f172a' : 'white',
                        cursor: 'pointer',
                        flexShrink: 0,
                        marginTop: '2px'
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        margin: '0 0 4px 0',
                        fontSize: '18px',
                        fontWeight: '600',
                        color: todo.status === 'completed'
                          ? (theme === 'dark' ? '#94a3b8' : '#9ca3af')
                          : (theme === 'dark' ? '#f1f5f9' : '#1f2937'),
                        textDecoration: todo.status === 'completed' ? 'line-through' : 'none',
                        lineHeight: '1.4'
                      }}>
                        {todo.title}
                      </h3>

                      {/* Recurring icon */}
                      {todo.is_recurring && (
                        <span
                          title={`Recurring: ${todo.recurrence_pattern || 'Unknown'}`}
                          style={{
                            fontSize: '12px',
                            backgroundColor: theme === 'dark' ? '#1e3a8a' : '#bfdbfe',
                            color: theme === 'dark' ? '#93c5fd' : '#1e40af',
                            padding: '4px 8px',
                            borderRadius: '20px',
                            fontWeight: '500',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginTop: '4px'
                          }}
                        >
                          <span style={{ fontSize: '14px' }}>🔄</span>
                          {todo.recurrence_pattern}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Metadata Row: Priority, Tags, Due Date */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                    {/* Priority Badge */}
                    {todo.priority && (
                      <span style={{
                        backgroundColor: getPriorityBgColor(todo.priority),
                        color: getPriorityColor(todo.priority),
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <span style={{ fontSize: '14px' }}>
                          {todo.priority === 'High' ? '🔴' : todo.priority === 'Medium' ? '🟡' : '🟢'}
                        </span>
                        {todo.priority}
                      </span>
                    )}

                    {/* Tags */}
                    {todo.tags && todo.tags.length > 0 && todo.tags.map((tag, index) => (
                      <span
                        key={index}
                        style={{
                          backgroundColor: theme === 'dark' ? '#312e81' : '#e0e7ff',
                          color: theme === 'dark' ? '#c7d2fe' : '#4f46e5',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}
                      >
                        {tag}
                      </span>
                    ))}

                    {/* Due Date */}
                    {todo.due_date && (
                      <span style={{
                        backgroundColor: overdue
                          ? (theme === 'dark' ? '#7f1d1d' : '#fee2e2')
                          : (theme === 'dark' ? '#1e3a8a' : '#dbeafe'),
                        color: overdue
                          ? (theme === 'dark' ? '#fca5a5' : '#dc2626')
                          : (theme === 'dark' ? '#93c5fd' : '#2563eb'),
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {overdue ? '⚠️ OVERDUE' : '📅'}
                        {formatDate(todo.due_date)}
                      </span>
                    )}

                    {/* Status */}
                    <span style={{
                      backgroundColor: todo.status === 'completed'
                        ? (theme === 'dark' ? '#14532d' : '#d1fae5')
                        : (theme === 'dark' ? '#713f12' : '#fef3c7'),
                      color: todo.status === 'completed'
                        ? (theme === 'dark' ? '#6ee7b7' : '#065f46')
                        : (theme === 'dark' ? '#fde68a' : '#92400e'),
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {todo.status === 'completed' ? '✅ Completed' : '⏳ Pending'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0, marginLeft: '16px' }}>
                  <button
                    onClick={() => {
                      const newTitle = prompt('Edit todo:', todo.title);
                      if (newTitle) onUpdate(todo.id, newTitle);
                    }}
                    title="Edit todo"
                    style={{
                      padding: '8px 12px',
                      backgroundColor: theme === 'dark' ? '#334155' : '#f3f4f6',
                      color: theme === 'dark' ? '#e2e8f0' : '#4b5563',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? '#475569' : '#e5e7eb'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? '#334155' : '#f3f4f6'}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this todo?')) {
                        onDelete(todo.id);
                      }
                    }}
                    title="Delete todo"
                    style={{
                      padding: '8px 12px',
                      backgroundColor: theme === 'dark' ? '#7f1d1d' : '#fee2e2',
                      color: theme === 'dark' ? '#fca5a5' : '#dc2626',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? '#991b1b' : '#fecaca'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? '#7f1d1d' : '#fee2e2'}
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* ID at the bottom right */}
              <div style={{
                textAlign: 'right',
                fontSize: '12px',
                color: theme === 'dark' ? '#94a3b8' : '#9ca3af',
                marginTop: '12px'
              }}>
                ID: #{todo.id}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
