/**
 * ChatPanel component - AI chatbot interface for natural language todo management.
 * Phase 3: AI-Driven Todo Chatbot
 *
 * Features:
 * - ChatKit-compatible API pattern (endpoint, headers, initialMessages)
 * - Urdu language support with RTL text rendering
 * - Voice commands via Web Speech API
 * - Conversation persistence with conversation_id
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
  /** ChatKit-compatible: custom endpoint override */
  endpoint?: string;
  /** ChatKit-compatible: custom headers */
  headers?: Record<string, string>;
  /** ChatKit-compatible: initial messages */
  initialMessages?: Message[];
}

/**
 * Detect if text contains Urdu/Arabic script (Unicode range 0600-06FF)
 */
function containsUrdu(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

/**
 * Get text direction based on content
 */
function getTextDirection(text: string): 'rtl' | 'ltr' {
  return containsUrdu(text) ? 'rtl' : 'ltr';
}

export default function ChatPanel({ token, endpoint, headers: customHeaders, initialMessages }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages || []);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const { theme } = useTheme();

  const chatEndpoint = endpoint || `${MCP_SERVER_URL}/api/chat`;

  // Example commands (English + Urdu)
  const exampleCommands = [
    "add buy groceries",
    "list my todos",
    "complete buy groceries",
    "نیا کام شامل کرو: گروسری خریدنا",
    "میرے کام دکھاو"
  ];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US'; // Default language

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(prev => prev ? `${prev} ${transcript}` : transcript);
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Voice input is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      // Detect if current input has Urdu text to set appropriate language
      if (containsUrdu(input)) {
        recognitionRef.current.lang = 'ur-PK';
      } else {
        recognitionRef.current.lang = 'en-US';
      }
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

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
      const response = await fetch(chatEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...customHeaders
        },
        body: JSON.stringify({
          message: input,
          conversation_id: conversationId
        })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Track conversation_id for persistence
      if (data.conversation_id) {
        setConversationId(data.conversation_id);
      }

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
      bottom: '20px',
      right: '20px',
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

      {/* Messages Area */}
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
                        border: `1px solid ${theme === 'dark' ? '#475569' : '#c7d2fe'}`,
                        direction: containsUrdu(cmd) ? 'rtl' : 'ltr'
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
                    <strong>💡 Tip:</strong> Supports English & Urdu! Try voice input with the 🎤 button.
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
                        ? '#4f46e5'
                        : (theme === 'dark' ? '#334155' : '#e5e7eb'),
                      color: msg.role === 'user'
                        ? 'white'
                        : (theme === 'dark' ? '#e2e8f0' : '#374151'),
                      fontSize: '15px',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                      direction: getTextDirection(msg.content),
                      textAlign: containsUrdu(msg.content) ? 'right' : 'left'
                    }}>
                      {msg.content}
                      <div style={{
                        fontSize: '11px',
                        color: msg.role === 'user'
                          ? '#bfdbfe'
                          : (theme === 'dark' ? '#94a3b8' : '#6b7280'),
                        marginTop: '6px',
                        textAlign: 'right',
                        direction: 'ltr'
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

          {/* Input Area with Voice Button */}
          <form onSubmit={sendMessage} style={{
            padding: '16px',
            backgroundColor: theme === 'dark' ? '#0f172a' : 'white',
            borderTop: `1px solid ${theme === 'dark' ? '#334155' : '#e5e7eb'}`
          }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {/* Voice Input Button */}
              <button
                type="button"
                onClick={toggleVoiceInput}
                style={{
                  padding: '12px',
                  backgroundColor: isListening ? '#ef4444' : (theme === 'dark' ? '#334155' : '#f3f4f6'),
                  color: isListening ? 'white' : (theme === 'dark' ? '#e2e8f0' : '#374151'),
                  border: `2px solid ${isListening ? '#ef4444' : (theme === 'dark' ? '#475569' : '#e5e7eb')}`,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '18px',
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  animation: isListening ? 'pulse 1.5s infinite' : 'none',
                  flexShrink: 0
                }}
                title={isListening ? 'Stop listening' : 'Start voice input'}
              >
                🎤
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? 'Listening...' : 'Type a command...'}
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
                  color: theme === 'dark' ? '#f1f5f9' : '#1e2937',
                  direction: containsUrdu(input) ? 'rtl' : 'ltr'
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
                  transition: 'all 0.2s',
                  flexShrink: 0
                }}
              >
                {loading ? '...' : 'Send'}
              </button>
            </div>
          </form>

          {/* CSS for pulse animation */}
          <style>{`
            @keyframes pulse {
              0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
              70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
              100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
            }
          `}</style>
        </>
      )}
    </div>
  );
}
