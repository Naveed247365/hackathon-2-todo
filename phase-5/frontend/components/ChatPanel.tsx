/**
 * ChatPanel component - AI chatbot interface for natural language todo management.
 * Phase 3: AI-Driven Todo Chatbot
 */
import { useState, useRef, useEffect, FormEvent } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const MCP_SERVER_URL = process.env.NEXT_PUBLIC_MCP_SERVER_URL || 'http://localhost:5000';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatPanelProps {
  token: string | null;
}

export default function ChatPanel({ token }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  // Example commands to display
  const exampleCommands = [
    "add buy groceries",
    "list my todos",
    "complete buy groceries",
    "update buy milk to buy almond milk",
    "delete the groceries task"
  ];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e?: FormEvent) => {
    if (e) e.preventDefault();

    if (!input.trim() || loading) return;

    if (!token) {
      alert('Please login to use the chat');
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${MCP_SERVER_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: input })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);

      const errorMessage: Message = {
        role: 'assistant',
        content: err.message.includes('401')
          ? 'Session expired. Please login again.'
          : err.message.includes('Failed to fetch') || err.message.includes('CONNECTION_RESET')
          ? 'Unable to connect to AI service. Please check if the server is running.'
          : `Unable to connect to AI service: ${err.message}`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (command: string) => {
    setInput(command);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: isOpen ? '20px' : '20px',
      right: isOpen ? '20px' : '20px',
      width: isOpen ? '400px' : '300px',
      height: isOpen ? '500px' : '60px',
      backgroundColor: isOpen ? (theme === 'dark' ? '#1e293b' : 'white') : '#4f46e5',
      border: `1px solid ${theme === 'dark' ? '#334155' : '#e5e7eb'}`,
      borderRadius: '12px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'all 0.3s ease',
      zIndex: 1000
    }}>
      {/* Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '16px',
          backgroundColor: '#4f46e5',
          color: 'white',
          cursor: 'pointer',
          borderRadius: '12px 12px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>🤖</span>
          <strong>AI Todo Assistant</strong>
        </div>
        <span style={{ fontSize: '20px' }}>{isOpen ? '−' : '+'}</span>
      </div>

      {/* Messages Area - only visible when open */}
      {isOpen && (
        <>
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            backgroundColor: theme === 'dark' ? '#0f172a' : '#f9fafb',
            borderBottom: `1px solid ${theme === 'dark' ? '#334155' : '#e5e7eb'}`
          }}>
            {messages.length === 0 ? (
              <div>
                <p style={{
                  marginBottom: '16px',
                  color: theme === 'dark' ? '#94a3b8' : '#6b7280',
                  textAlign: 'center',
                  fontWeight: '500'
                }}>
                  How can I help you today? Try these commands:
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                  {exampleCommands.map((cmd, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleExampleClick(cmd)}
                      style={{
                        padding: '12px 16px',
                        backgroundColor: theme === 'dark' ? '#334155' : '#e0e7ff',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: theme === 'dark' ? '#93c5fd' : '#4f46e5',
                        fontWeight: '500',
                        transition: 'all 0.2s',
                        border: `1px solid ${theme === 'dark' ? '#475569' : '#c7d2fe'}`
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = `0 4px 6px -1px ${theme === 'dark' ? 'rgba(56, 189, 248, 0.1)' : 'rgba(79, 70, 229, 0.1)'}`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {cmd}
                    </div>
                  ))}
                </div>
                <div style={{
                  marginTop: '24px',
                  padding: '16px',
                  backgroundColor: theme === 'dark' ? '#713f12' : '#fef3c7',
                  borderRadius: '8px',
                  border: `1px solid ${theme === 'dark' ? '#92400e' : '#fbbf24'}`
                }}>
                  <p style={{ margin: 0, fontSize: '14px', color: theme === 'dark' ? '#fed7aa' : '#92400e' }}>
                    <strong>💡 Tip:</strong> You can say things like "add a task", "show my pending tasks", "mark task as done", etc.
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div style={{
                      maxWidth: '85%',
                      padding: '14px 18px',
                      borderRadius: '18px',
                      backgroundColor: msg.role === 'user'
                        ? (theme === 'dark' ? '#4f46e5' : '#4f46e5')
                        : (theme === 'dark' ? '#334155' : '#e5e7eb'),
                      color: msg.role === 'user'
                        ? 'white'
                        : (theme === 'dark' ? '#e2e8f0' : '#374151'),
                      fontSize: '15px',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }}>
                      {msg.content}
                      <div style={{
                        fontSize: '11px',
                        color: msg.role === 'user'
                          ? (theme === 'dark' ? '#93c5fd' : '#bfdbfe')
                          : (theme === 'dark' ? '#94a3b8' : '#6b7280'),
                        marginTop: '6px',
                        textAlign: 'right'
                      }}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={sendMessage} style={{
            padding: '16px',
            backgroundColor: theme === 'dark' ? '#0f172a' : 'white',
            borderTop: `1px solid ${theme === 'dark' ? '#334155' : '#e5e7eb'}`
          }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a command..."
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  fontSize: '15px',
                  border: `2px solid ${theme === 'dark' ? '#334155' : '#e5e7eb'}`,
                  borderRadius: '24px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  backgroundColor: theme === 'dark' ? '#1e293b' : 'white',
                  color: theme === 'dark' ? '#f1f5f9' : '#1e2937'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#4f46e5'}
                onBlur={(e) => e.currentTarget.style.borderColor = theme === 'dark' ? '#334155' : '#e5e7eb'}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                style={{
                  padding: '12px 24px',
                  backgroundColor: loading ? (theme === 'dark' ? '#475569' : '#9ca3af') : '#4f46e5',
                  color: 'white',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  borderRadius: '24px',
                  fontSize: '15px',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#4338ca')}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = loading
                  ? (theme === 'dark' ? '#475569' : '#9ca3af')
                  : '#4f46e5'}
              >
                {loading ? '...' : 'Send'}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
