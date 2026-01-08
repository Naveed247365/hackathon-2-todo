/**
 * TodoForm component for creating new todos (Phase 5 enhanced).
 */
import { useState, FormEvent } from 'react';
import { PriorityLevel, RecurrencePattern } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface TodoFormData {
  title: string;
  priority?: PriorityLevel;
  tags?: string[];
  due_date?: string;
  is_recurring?: boolean;
  recurrence_pattern?: RecurrencePattern;
}

interface TodoFormProps {
  onSubmit: (data: TodoFormData) => Promise<void>;
}

export default function TodoForm({ onSubmit }: TodoFormProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('Medium');
  const [tagsInput, setTagsInput] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>('Daily');
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Title cannot be empty');
      return;
    }

    // Parse tags from comma-separated or space-separated input
    const tags = tagsInput
      .split(/[,\s]+/)
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .map(tag => tag.startsWith('#') ? tag : `#${tag}`); // Ensure # prefix

    setLoading(true);
    try {
      await onSubmit({
        title,
        priority,
        tags: tags.length > 0 ? tags : undefined,
        due_date: dueDate || undefined,
        is_recurring: isRecurring,
        recurrence_pattern: isRecurring ? recurrencePattern : undefined,
      });

      // Reset form
      setTitle('');
      setPriority('Medium');
      setTagsInput('');
      setDueDate('');
      setIsRecurring(false);
      setRecurrencePattern('Daily');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: theme === 'dark' ? '#1e293b' : 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: theme === 'dark'
        ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
        : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      marginBottom: '24px'
    }}>
      <h2 style={{
        margin: '0 0 24px 0',
        fontSize: '24px',
        fontWeight: '700',
        color: theme === 'dark' ? '#f1f5f9' : '#1f2937',
        textAlign: 'center'
      }}>
        Create New Todo
      </h2>

      <form onSubmit={handleSubmit}>
        {/* Title */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '600',
            color: theme === 'dark' ? '#e2e8f0' : '#374151'
          }}>
            Todo Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What do you need to do?"
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '16px',
              borderRadius: '8px',
              border: `2px solid ${theme === 'dark' ? '#334155' : '#e5e7eb'}`,
              backgroundColor: theme === 'dark' ? '#0f172a' : 'white',
              color: theme === 'dark' ? '#f1f5f9' : '#1e2937',
              transition: 'border-color 0.2s',
              outline: 'none'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.currentTarget.style.borderColor = theme === 'dark' ? '#334155' : '#e5e7eb'}
          />
        </div>

        {/* Priority and Due Date row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: theme === 'dark' ? '#e2e8f0' : '#374151'
            }}>
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as PriorityLevel)}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                borderRadius: '8px',
                border: `2px solid ${theme === 'dark' ? '#334155' : '#e5e7eb'}`,
                backgroundColor: theme === 'dark' ? '#0f172a' : 'white',
                color: theme === 'dark' ? '#f1f5f9' : '#1e2937',
                cursor: 'pointer',
                outline: 'none'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.currentTarget.style.borderColor = theme === 'dark' ? '#334155' : '#e5e7eb'}
            >
              <option value="High" style={{ color: '#ef4444' }}>High Priority</option>
              <option value="Medium" style={{ color: '#f59e0b' }}>Medium Priority</option>
              <option value="Low" style={{ color: '#10b981' }}>Low Priority</option>
            </select>
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: theme === 'dark' ? '#e2e8f0' : '#374151'
            }}>
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                borderRadius: '8px',
                border: `2px solid ${theme === 'dark' ? '#334155' : '#e5e7eb'}`,
                backgroundColor: theme === 'dark' ? '#0f172a' : 'white',
                color: theme === 'dark' ? '#f1f5f9' : '#1e2937',
                cursor: 'pointer',
                outline: 'none'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.currentTarget.style.borderColor = theme === 'dark' ? '#334155' : '#e5e7eb'}
            />
          </div>
        </div>

        {/* Tags */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '600',
            color: theme === 'dark' ? '#e2e8f0' : '#374151'
          }}>
            Tags
          </label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="Add tags separated by commas (e.g., work, urgent, personal)"
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '16px',
              borderRadius: '8px',
              border: `2px solid ${theme === 'dark' ? '#334155' : '#e5e7eb'}`,
              backgroundColor: theme === 'dark' ? '#0f172a' : 'white',
              color: theme === 'dark' ? '#f1f5f9' : '#1e2937',
              transition: 'border-color 0.2s',
              outline: 'none'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.currentTarget.style.borderColor = theme === 'dark' ? '#334155' : '#e5e7eb'}
          />
          <small style={{ color: theme === 'dark' ? '#94a3b8' : '#6b7280', fontSize: '13px', display: 'block', marginTop: '4px' }}>
            Separate tags with commas or spaces. The # symbol will be added automatically.
          </small>
        </div>

        {/* Recurring */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            padding: '12px',
            borderRadius: '8px',
            border: `2px solid ${theme === 'dark' ? '#334155' : '#e5e7eb'}`,
            transition: 'border-color 0.2s',
            backgroundColor: theme === 'dark' ? '#0f172a' : 'white'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = theme === 'dark' ? '#334155' : '#e5e7eb'}
          >
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              style={{
                width: '20px',
                height: '20px',
                marginRight: '12px',
                cursor: 'pointer'
              }}
            />
            <span style={{
              fontSize: '16px',
              fontWeight: '600',
              color: theme === 'dark' ? '#e2e8f0' : '#374151'
            }}>
              Recurring Task
            </span>
          </label>

          {isRecurring && (
            <div style={{ marginTop: '12px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: theme === 'dark' ? '#e2e8f0' : '#374151'
              }}>
                Recurrence Pattern
              </label>
              <select
                value={recurrencePattern}
                onChange={(e) => setRecurrencePattern(e.target.value as RecurrencePattern)}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  borderRadius: '8px',
                  border: `2px solid ${theme === 'dark' ? '#334155' : '#e5e7eb'}`,
                  backgroundColor: theme === 'dark' ? '#0f172a' : 'white',
                  color: theme === 'dark' ? '#f1f5f9' : '#1e2937',
                  cursor: 'pointer',
                  outline: 'none'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.currentTarget.style.borderColor = theme === 'dark' ? '#334155' : '#e5e7eb'}
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: loading ? (theme === 'dark' ? '#475569' : '#9ca3af') : '#3b82f6',
            color: 'white',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            transition: 'background-color 0.2s',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
          onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#2563eb')}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = loading
            ? (theme === 'dark' ? '#475569' : '#9ca3af')
            : '#3b82f6'}
        >
          {loading ? 'Adding Todo...' : 'Add Todo'}
        </button>
      </form>
    </div>
  );
}
