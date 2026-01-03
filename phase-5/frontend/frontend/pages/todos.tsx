/**
 * Todos page - main todo management interface (Phase 5 enhanced).
 */
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { apiCall, getToken, removeToken } from '@/lib/api';
import TodoList from '@/components/TodoList';
import TodoForm from '@/components/TodoForm';
import ChatPanel from '@/components/ChatPanel';
import { TodoResponse, PriorityLevel } from '../types';

interface TodoFormData {
  title: string;
  priority?: PriorityLevel;
  tags?: string[];
  due_date?: string;
  is_recurring?: boolean;
  recurrence_pattern?: string;
}

export default function Todos() {
  const router = useRouter();
  const [todos, setTodos] = useState<TodoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Phase 5: Filter states
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('priority');

  useEffect(() => {
    // Auth check - redirect if not logged in
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    // Fetch todos
    fetchTodos();
  }, [router, priorityFilter, statusFilter, sortBy]);

  const fetchTodos = async () => {
    try {
      setLoading(true);

      // Build query params for Phase 5 API
      const params = new URLSearchParams();
      if (priorityFilter) params.append('priority', priorityFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (sortBy) params.append('sort_by', sortBy);

      const queryString = params.toString();
      const endpoint = `/api/v5/todos${queryString ? `?${queryString}` : ''}`;

      const response = await apiCall(endpoint, 'GET');
      setTodos(response.todos);
      setError('');
    } catch (err: any) {
      if (err.message.includes('401') || err.message.includes('authentication')) {
        removeToken();
        router.push('/login');
      } else {
        setError(err.message || 'Failed to load todos');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: TodoFormData) => {
    try {
      const newTodo = await apiCall('/api/v5/todos', 'POST', data);
      setTodos([...todos, newTodo]);
      setError('');
    } catch (err: any) {
      if (err.message.includes('401')) {
        removeToken();
        router.push('/login');
      } else {
        setError(err.message || 'Failed to create todo');
      }
    }
  };

  const handleComplete = async (id: number) => {
    try {
      const updatedTodo = await apiCall(`/api/v5/todos/${id}/complete`, 'PATCH');
      setTodos(todos.map(t => t.id === id ? updatedTodo : t));
      setError('');
    } catch (err: any) {
      if (err.message.includes('401')) {
        removeToken();
        router.push('/login');
      } else {
        setError(err.message || 'Failed to complete todo');
      }
    }
  };

  const handleUpdate = async (id: number, title: string) => {
    if (!title.trim()) {
      setError('Title cannot be empty');
      return;
    }

    try {
      const updatedTodo = await apiCall(`/api/v5/todos/${id}`, 'PATCH', { title });
      setTodos(todos.map(t => t.id === id ? updatedTodo : t));
      setError('');
    } catch (err: any) {
      if (err.message.includes('401')) {
        removeToken();
        router.push('/login');
      } else {
        setError(err.message || 'Failed to update todo');
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiCall(`/api/v5/todos/${id}`, 'DELETE');
      setTodos(todos.filter(t => t.id !== id));
      setError('');
    } catch (err: any) {
      if (err.message.includes('401')) {
        removeToken();
        router.push('/login');
      } else {
        setError(err.message || 'Failed to delete todo');
      }
    }
  };

  const handleLogout = () => {
    removeToken();
    router.push('/login');
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '100px' }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '50px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>My Todos <span style={{ fontSize: '14px', color: '#6c757d' }}>(Phase 5)</span></h1>
        <button
          onClick={handleLogout}
          style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '3px' }}
        >
          Logout
        </button>
      </div>

      {error && <div style={{ color: 'red', marginBottom: '15px', padding: '10px', backgroundColor: '#fee', borderRadius: '3px' }}>{error}</div>}

      {/* Phase 5: Filter and Sort Controls */}
      <div style={{
        display: 'flex',
        gap: '15px',
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '5px',
        border: '1px solid #dee2e6'
      }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold' }}>
            Filter by Priority
          </label>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '14px',
              borderRadius: '3px',
              border: '1px solid #ced4da'
            }}
          >
            <option value="">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold' }}>
            Filter by Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '14px',
              borderRadius: '3px',
              border: '1px solid #ced4da'
            }}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold' }}>
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '14px',
              borderRadius: '3px',
              border: '1px solid #ced4da'
            }}
          >
            <option value="priority">Priority</option>
            <option value="created_at">Created Date</option>
          </select>
        </div>

        <div style={{ flex: 0, display: 'flex', alignItems: 'flex-end' }}>
          <button
            onClick={() => {
              setPriorityFilter('');
              setStatusFilter('');
              setSortBy('priority');
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '3px',
              fontSize: '14px'
            }}
          >
            Clear
          </button>
        </div>
      </div>

      <TodoForm onSubmit={handleCreate} />

      <div style={{ marginBottom: '15px', fontSize: '14px', color: '#6c757d' }}>
        Showing {todos.length} todo{todos.length !== 1 ? 's' : ''}
      </div>

      <TodoList
        todos={todos}
        onComplete={handleComplete}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />

      {/* Phase 3: AI Chatbot Interface */}
      <ChatPanel token={getToken()} />
    </div>
  );
}
