/**
 * TodoList component for displaying todos.
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

  return (
    <div>
      {todos.map((todo) => (
        <div
          key={todo.id}
          style={{
            border: '1px solid #ddd',
            padding: '15px',
            marginBottom: '10px',
            borderRadius: '4px',
            backgroundColor: todo.status === 'completed' ? '#f0f0f0' : 'white'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 5px 0', textDecoration: todo.status === 'completed' ? 'line-through' : 'none' }}>
                {todo.title}
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                Status: {todo.status} | ID: {todo.id}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {todo.status === 'pending' && (
                <button
                  onClick={() => onComplete(todo.id)}
                  style={{ padding: '5px 10px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '3px' }}
                >
                  Complete
                </button>
              )}
              <button
                onClick={() => {
                  const newTitle = prompt('Enter new title:', todo.title);
                  if (newTitle) onUpdate(todo.id, newTitle);
                }}
                style={{ padding: '5px 10px', backgroundColor: '#ffc107', color: 'black', border: 'none', cursor: 'pointer', borderRadius: '3px' }}
              >
                Edit
              </button>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this todo?')) {
                    onDelete(todo.id);
                  }
                }}
                style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '3px' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
