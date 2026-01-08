/**
 * Phase 5 Todos page with advanced features
 */
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { apiCall, getToken, removeToken } from '@/lib/api';
import { Todo, CreateTodoData, Priority, RecurrencePattern } from '../types';
import TodoForm from '../components/TodoForm';
import TodoList from '../components/TodoList';
import ChatPanel from '../components/ChatPanel';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';

export default function Todos() {
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { theme } = useTheme();

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

  const handleCreate = async (data: CreateTodoData) => {
    try {
      await apiCall('/api/todos', 'POST', data);
      fetchTodos();
    } catch (err: any) {
      setError(err.message || 'Failed to create todo');
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await apiCall(`/api/todos/${id}/complete`, 'PATCH');
      fetchTodos();
    } catch (err: any) {
      setError(err.message || 'Failed to update todo');
    }
  };

  const handleUpdate = async (id: number, title: string) => {
    try {
      await apiCall(`/api/todos/${id}`, 'PATCH', { title });
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
    <div style={{
      minHeight: '100vh',
      backgroundColor: theme === 'dark' ? '#0f172a' : '#f8fafc',
      backgroundImage: theme === 'dark'
        ? 'radial-gradient(#1e293b 1px, transparent 1px)'
        : 'radial-gradient(#cbd5e1 1px, transparent 1px)',
      backgroundSize: '20px 20px',
      color: theme === 'dark' ? '#f1f5f9' : '#1e2937'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: theme === 'dark' ? '#1e293b' : 'white',
        padding: '20px 40px',
        boxShadow: theme === 'dark'
          ? '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)'
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '800',
            margin: 0,
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            📋 Advanced Todo App
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: theme === 'dark' ? '#94a3b8' : '#64748b' }}>
            Manage your tasks with AI assistance
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <ThemeToggle />
          <button
            onClick={handleLogout}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.2s',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
          >
            Logout
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '900px', margin: '30px auto', padding: '0 20px', position: 'relative' }}>
        {error && (
          <div style={{
            backgroundColor: theme === 'dark' ? '#450a0a' : '#fee2e2',
            border: `1px solid ${theme === 'dark' ? '#7f1d1d' : '#fecaca'}`,
            color: theme === 'dark' ? '#fca5a5' : '#991b1b',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: theme === 'dark'
              ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
              : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <span style={{ fontSize: '20px' }}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Stats Overview */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{
            backgroundColor: theme === 'dark' ? '#1e293b' : 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: theme === 'dark'
              ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
              : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#4f46e5' }}>
              {todos.length}
            </div>
            <div style={{ fontSize: '14px', color: theme === 'dark' ? '#94a3b8' : '#64748b', marginTop: '4px' }}>
              Total Tasks
            </div>
          </div>
          <div style={{
            backgroundColor: theme === 'dark' ? '#1e293b' : 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: theme === 'dark'
              ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
              : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
              {todos.filter(t => t.status === 'completed').length}
            </div>
            <div style={{ fontSize: '14px', color: theme === 'dark' ? '#94a3b8' : '#64748b', marginTop: '4px' }}>
              Completed
            </div>
          </div>
          <div style={{
            backgroundColor: theme === 'dark' ? '#1e293b' : 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: theme === 'dark'
              ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
              : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>
              {todos.filter(t => t.status === 'pending').length}
            </div>
            <div style={{ fontSize: '14px', color: theme === 'dark' ? '#94a3b8' : '#64748b', marginTop: '4px' }}>
              Pending
            </div>
          </div>
          <div style={{
            backgroundColor: theme === 'dark' ? '#1e293b' : 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: theme === 'dark'
              ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
              : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444' }}>
              {todos.filter(t => t.due_date && isOverdue(t.due_date)).length}
            </div>
            <div style={{ fontSize: '14px', color: theme === 'dark' ? '#94a3b8' : '#64748b', marginTop: '4px' }}>
              Overdue
            </div>
          </div>
        </div>

        {/* Create Todo Form */}
        <TodoForm onSubmit={handleCreate} />

        {/* Search & Filters */}
        <div style={{
          backgroundColor: theme === 'dark' ? '#1e293b' : 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: theme === 'dark'
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          marginBottom: '24px'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="🔍 Search todos by title..."
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
              onFocus={(e) => e.currentTarget.style.borderColor = '#4f46e5'}
              onBlur={(e) => e.currentTarget.style.borderColor = theme === 'dark' ? '#334155' : '#e5e7eb'}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              style={{
                padding: '12px',
                fontSize: '16px',
                borderRadius: '8px',
                border: `2px solid ${theme === 'dark' ? '#334155' : '#e5e7eb'}`,
                backgroundColor: theme === 'dark' ? '#0f172a' : 'white',
                color: theme === 'dark' ? '#f1f5f9' : '#1e2937',
                cursor: 'pointer',
                outline: 'none'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#4f46e5'}
              onBlur={(e) => e.currentTarget.style.borderColor = theme === 'dark' ? '#334155' : '#e5e7eb'}
            >
              <option value="all">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '12px',
                fontSize: '16px',
                borderRadius: '8px',
                border: `2px solid ${theme === 'dark' ? '#334155' : '#e5e7eb'}`,
                backgroundColor: theme === 'dark' ? '#0f172a' : 'white',
                color: theme === 'dark' ? '#f1f5f9' : '#1e2937',
                cursor: 'pointer',
                outline: 'none'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#4f46e5'}
              onBlur={(e) => e.currentTarget.style.borderColor = theme === 'dark' ? '#334155' : '#e5e7eb'}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>

            <input
              type="text"
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              placeholder="Filter by tag..."
              style={{
                padding: '12px 16px',
                fontSize: '16px',
                borderRadius: '8px',
                border: `2px solid ${theme === 'dark' ? '#334155' : '#e5e7eb'}`,
                backgroundColor: theme === 'dark' ? '#0f172a' : 'white',
                color: theme === 'dark' ? '#f1f5f9' : '#1e2937',
                transition: 'border-color 0.2s',
                outline: 'none'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#4f46e5'}
              onBlur={(e) => e.currentTarget.style.borderColor = theme === 'dark' ? '#334155' : '#e5e7eb'}
            />

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '12px',
                fontSize: '16px',
                borderRadius: '8px',
                border: `2px solid ${theme === 'dark' ? '#334155' : '#e5e7eb'}`,
                backgroundColor: theme === 'dark' ? '#0f172a' : 'white',
                color: theme === 'dark' ? '#f1f5f9' : '#1e2937',
                cursor: 'pointer',
                outline: 'none'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#4f46e5'}
              onBlur={(e) => e.currentTarget.style.borderColor = theme === 'dark' ? '#334155' : '#e5e7eb'}
            >
              <option value="created">Sort: Newest First</option>
              <option value="priority">Sort: Priority</option>
              <option value="dueDate">Sort: Due Date</option>
            </select>
          </div>

          {(searchText || filterTag) && (
            <div style={{
              fontSize: '14px',
              color: theme === 'dark' ? '#94a3b8' : '#64748b',
              padding: '12px',
              backgroundColor: theme === 'dark' ? '#1e293b' : '#f1f5f9',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                Showing <strong>{filteredTodos.length}</strong> of <strong>{todos.length}</strong> todos
                {searchText && <span> • Search: "{searchText}"</span>}
                {filterTag && <span> • Tag: "{filterTag}"</span>}
              </div>
              <button
                onClick={() => {
                  setSearchText('');
                  setFilterTag('');
                  setFilterPriority('all');
                  setFilterStatus('all');
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: theme === 'dark' ? '#475569' : '#64748b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? '#334155' : '#475569'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? '#475569' : '#64748b'}
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Todo List */}
        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '60px',
            fontSize: '18px',
            color: theme === 'dark' ? '#94a3b8' : '#64748b'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            Loading your todos...
          </div>
        ) : filteredTodos.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: theme === 'dark' ? '#94a3b8' : '#64748b',
            fontSize: '16px',
            backgroundColor: theme === 'dark' ? '#0f172a' : '#f8fafc',
            borderRadius: '12px',
            border: `2px dashed ${theme === 'dark' ? '#334155' : '#e2e8f0'}`,
            marginTop: '20px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
            <h3 style={{ margin: '0 0 8px 0', color: theme === 'dark' ? '#cbd5e1' : '#4a5568' }}>No todos found</h3>
            <p style={{ margin: 0, color: theme === 'dark' ? '#94a3b8' : '#718096' }}>
              {searchText || filterTag ? 'Try adjusting your filters' : 'Create your first todo to get started!'}
            </p>
          </div>
        ) : (
          <TodoList
            todos={filteredTodos}
            onComplete={handleToggle}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        )}
      </main>

      {/* Chat Panel */}
      <ChatPanel token={getToken()} />
    </div>
  );
}
