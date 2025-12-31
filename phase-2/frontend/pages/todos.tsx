/**
 * Todos page - main todo management interface (protected route).
 */
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { apiCall, getToken, removeToken } from '@/lib/api';
import TodoList from '@/components/TodoList';
import TodoForm from '@/components/TodoForm';
import { TodoResponse } from '../types';

export default function Todos() {
  const router = useRouter();
  const [todos, setTodos] = useState<TodoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Auth check - redirect if not logged in
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    // Fetch todos
    fetchTodos();
  }, [router]);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await apiCall('/api/todos', 'GET');
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

  const handleCreate = async (title: string) => {
    try {
      const newTodo = await apiCall('/api/todos', 'POST', { title });
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
      const updatedTodo = await apiCall(`/api/todos/${id}/complete`, 'PATCH');
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
      const updatedTodo = await apiCall(`/api/todos/${id}`, 'PATCH', { title });
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
      await apiCall(`/api/todos/${id}`, 'DELETE');
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
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>My Todos</h1>
        <button
          onClick={handleLogout}
          style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '3px' }}
        >
          Logout
        </button>
      </div>

      {error && <div style={{ color: 'red', marginBottom: '15px', padding: '10px', backgroundColor: '#fee', borderRadius: '3px' }}>{error}</div>}

      <TodoForm onSubmit={handleCreate} />
      <TodoList
        todos={todos}
        onComplete={handleComplete}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </div>
  );
}
