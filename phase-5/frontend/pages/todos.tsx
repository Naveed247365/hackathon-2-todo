/**
 * Phase 5 Todos page with advanced features
 */
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { apiCall, getToken, removeToken } from '@/lib/api';
import { Todo, CreateTodoData, Priority, RecurrencePattern } from '../types';

export default function Todos() {
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [tags, setTags] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>('Daily');

  // Filter state
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchText, setSearchText] = useState('');
  const [filterTag, setFilterTag] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('created');

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }
    fetchTodos();
  }, [router]);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await apiCall('/api/todos', 'GET');
      setTodos(response.todos || []);
      setError('');
    } catch (err: any) {
      if (err.message.includes('401')) {
        removeToken();
        router.push('/login');
      } else {
        setError(err.message || 'Failed to load todos');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tagArray = tags.split(',').map(t => t.trim()).filter(t => t);

    const todoData: CreateTodoData = {
      title: title.trim(),
      priority,
      tags: tagArray,
      due_date: dueDate || undefined,
      is_recurring: isRecurring,
      recurrence_pattern: isRecurring ? recurrencePattern : undefined,
    };

    try {
      await apiCall('/api/todos', 'POST', todoData);
      setTitle('');
      setTags('');
      setDueDate('');
      setIsRecurring(false);
      setPriority('Medium');
      fetchTodos();
    } catch (err: any) {
      setError(err.message || 'Failed to create todo');
    }
  };

  const handleToggle = async (todo: Todo) => {
    try {
      await apiCall(`/api/todos/${todo.id}/complete`, 'PATCH');
      fetchTodos();
    } catch (err: any) {
      setError(err.message || 'Failed to update todo');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiCall(`/api/todos/${id}`, 'DELETE');
      fetchTodos();
    } catch (err: any) {
      setError(err.message || 'Failed to delete todo');
    }
  };

  const handleLogout = () => {
    removeToken();
    router.push('/login');
  };

  // Filter and sort todos
  const filteredTodos = todos
    .filter(todo => {
      // Priority filter
      if (filterPriority !== 'all' && todo.priority !== filterPriority) return false;

      // Status filter
      if (filterStatus === 'pending' && todo.status === 'completed') return false;
      if (filterStatus === 'completed' && todo.status === 'pending') return false;

      // Search filter
      if (searchText && !todo.title.toLowerCase().includes(searchText.toLowerCase())) return false;

      // Tag filter
      if (filterTag && (!todo.tags || !todo.tags.some(tag => tag.toLowerCase().includes(filterTag.toLowerCase())))) return false;

      return true;
    })
    .sort((a, b) => {
      // Sort logic
      if (sortBy === 'priority') {
        const priorityOrder = { High: 0, Medium: 1, Low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      } else if (sortBy === 'dueDate') {
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      // Default: created (by id)
      return b.id - a.id;
    });

  const priorityColor = (p: Priority) => {
    return p === 'High' ? '#ef4444' : p === 'Medium' ? '#f59e0b' : '#10b981';
  };

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>Phase 5 - Advanced Todo App</h1>
        <button onClick={handleLogout} style={{ padding: '8px 16px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #ef4444', color: '#991b1b', padding: '12px', borderRadius: '6px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Create Form */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>Create New Todo</h2>
        <form onSubmit={handleCreate}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Todo title"
            style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', marginBottom: '10px' }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
            </div>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>Tags (comma separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="work, urgent, personal"
              style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} />
              <span>Recurring Task</span>
            </label>
            {isRecurring && (
              <select value={recurrencePattern} onChange={(e) => setRecurrencePattern(e.target.value as RecurrencePattern)} style={{ marginTop: '8px', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            )}
          </div>

          <button type="submit" style={{ width: '100%', padding: '10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
            Create Todo
          </button>
        </form>
      </div>

      {/* Search & Filters */}
      <div style={{ background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="🔍 Search todos by title..."
            style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}>
            <option value="all">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>

          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>

          <input
            type="text"
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            placeholder="Filter by tag..."
            style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
          />

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}>
            <option value="created">Sort: Newest First</option>
            <option value="priority">Sort: Priority</option>
            <option value="dueDate">Sort: Due Date</option>
          </select>
        </div>

        {(searchText || filterTag) && (
          <div style={{ marginTop: '10px', fontSize: '13px', color: '#6b7280' }}>
            Showing {filteredTodos.length} of {todos.length} todos
            {searchText && <span> • Search: "{searchText}"</span>}
            {filterTag && <span> • Tag: "{filterTag}"</span>}
            <button onClick={() => { setSearchText(''); setFilterTag(''); setFilterPriority('all'); setFilterStatus('all'); }} style={{ marginLeft: '10px', padding: '4px 8px', background: '#f3f4f6', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Todo List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
      ) : filteredTodos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>No todos found. Create one above!</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredTodos.map((todo) => (
            <div key={todo.id} style={{ background: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: `4px solid ${priorityColor(todo.priority)}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <input
                      type="checkbox"
                      checked={todo.status === 'completed'}
                      onChange={() => handleToggle(todo)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '16px', textDecoration: todo.status === 'completed' ? 'line-through' : 'none', color: todo.status === 'completed' ? '#9ca3af' : '#1f2937' }}>
                      {todo.title}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginLeft: '28px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '12px', background: priorityColor(todo.priority), color: 'white' }}>
                      {todo.priority}
                    </span>

                    {todo.tags && todo.tags.length > 0 && todo.tags.map((tag, i) => (
                      <span
                        key={i}
                        onClick={() => setFilterTag(tag)}
                        style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '12px', background: '#e5e7eb', color: '#374151', cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#d1d5db'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#e5e7eb'; }}
                        title={`Click to filter by ${tag}`}
                      >
                        {tag}
                      </span>
                    ))}

                    {todo.due_date && (
                      <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '12px', background: isOverdue(todo.due_date) ? '#fee2e2' : '#dbeafe', color: isOverdue(todo.due_date) ? '#991b1b' : '#1e40af' }}>
                        {isOverdue(todo.due_date) ? '⚠️ OVERDUE' : '📅'} {todo.due_date}
                      </span>
                    )}

                    {todo.is_recurring && (
                      <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '12px', background: '#fef3c7', color: '#92400e' }}>
                        🔁 {todo.recurrence_pattern}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(todo.id)}
                  style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
