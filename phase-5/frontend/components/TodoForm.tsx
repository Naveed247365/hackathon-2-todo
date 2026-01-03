/**
 * TodoForm component for creating new todos (Phase 5 enhanced).
 */
import { useState, FormEvent } from 'react';
import { PriorityLevel, RecurrencePattern } from '../types';

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
    <form onSubmit={handleSubmit} style={{
      marginBottom: '30px',
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '5px',
      border: '1px solid #dee2e6'
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '18px' }}>Create New Todo</h3>

      {/* Title */}
      <div style={{ marginBottom: '15px' }}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter todo title..."
          style={{
            width: '100%',
            padding: '10px',
            fontSize: '14px',
            borderRadius: '3px',
            border: '1px solid #ced4da'
          }}
        />
      </div>

      {/* Priority and Due Date row */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold' }}>
            Priority
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as PriorityLevel)}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '14px',
              borderRadius: '3px',
              border: '1px solid #ced4da'
            }}
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold' }}>
            Due Date (optional)
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '14px',
              borderRadius: '3px',
              border: '1px solid #ced4da'
            }}
          />
        </div>
      </div>

      {/* Tags */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold' }}>
          Tags (optional)
        </label>
        <input
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="work, urgent, meeting (# will be added automatically)"
          style={{
            width: '100%',
            padding: '10px',
            fontSize: '14px',
            borderRadius: '3px',
            border: '1px solid #ced4da'
          }}
        />
        <small style={{ color: '#6c757d', fontSize: '12px' }}>Separate tags with commas or spaces</small>
      </div>

      {/* Recurring */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            style={{ marginRight: '8px' }}
          />
          <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Recurring Task</span>
        </label>

        {isRecurring && (
          <select
            value={recurrencePattern}
            onChange={(e) => setRecurrencePattern(e.target.value as RecurrencePattern)}
            style={{
              width: '100%',
              marginTop: '8px',
              padding: '10px',
              fontSize: '14px',
              borderRadius: '3px',
              border: '1px solid #ced4da'
            }}
          >
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
          </select>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: loading ? '#6c757d' : '#007bff',
          color: 'white',
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          borderRadius: '3px',
          fontSize: '15px',
          fontWeight: 'bold'
        }}
      >
        {loading ? 'Adding...' : 'Add Todo'}
      </button>
    </form>
  );
}
