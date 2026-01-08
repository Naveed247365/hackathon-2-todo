/**
 * Homepage for Evolution-of-Todo application.
 */
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { getToken } from '@/lib/api';

export default function HomePage() {
  const router = useRouter();

  // Check if user is logged in and redirect to todos page
  useEffect(() => {
    const token = getToken();
    if (token) {
      router.push('/todos');
    }
  }, [router]);

  const handleGetStarted = () => {
    router.push('/signup');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      backgroundImage: `
        radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.2) 0%, transparent 50%),
        radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)
      `,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Navigation */}
      <nav style={{
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '28px' }}>📋</div>
          <h1 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Evolution-of-Todo
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button
            onClick={() => router.push('/login')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4338ca'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
          >
            Login
          </button>
          <button
            onClick={() => router.push('/signup')}
            style={{
              padding: '10px 20px',
              backgroundColor: 'white',
              color: '#4f46e5',
              border: '2px solid #4f46e5',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#4f46e5';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.color = '#4f46e5';
            }}
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '800px',
          padding: '60px 40px',
          backgroundColor: 'white',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative elements */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'linear-gradient(45deg, #c7d2fe, #a5b4fc)',
            opacity: 0.1
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-80px',
            left: '-50px',
            width: '250px',
            height: '250px',
            borderRadius: '50%',
            background: 'linear-gradient(45deg, #a78bfa, #8b5cf6)',
            opacity: 0.1
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <h1 style={{
              fontSize: '48px',
              fontWeight: '800',
              margin: '0 0 20px 0',
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: '1.2'
            }}>
              Evolution-of-Todo
            </h1>

            <p style={{
              fontSize: '20px',
              color: '#4b5563',
              margin: '0 0 40px 0',
              lineHeight: '1.6',
              maxWidth: '600px',
              marginInline: 'auto'
            }}>
              Transform your productivity with our advanced todo management system.
              Experience the evolution of task management with AI assistance,
              smart features, and intuitive design.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              marginBottom: '40px'
            }}>
              <div style={{
                padding: '20px',
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>🧠</div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#1e2937' }}>AI-Powered</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
                  Natural language commands and intelligent task management
                </p>
              </div>

              <div style={{
                padding: '20px',
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚡</div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#1e2937' }}>Advanced Features</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
                  Priorities, tags, due dates, recurring tasks, and more
                </p>
              </div>

              <div style={{
                padding: '20px',
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎨</div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#1e2937' }}>Beautiful UI</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
                  Modern design with dark/light mode support
                </p>
              </div>
            </div>

            <button
              onClick={handleGetStarted}
              style={{
                padding: '18px 40px',
                backgroundColor: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: '700',
                transition: 'all 0.2s',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3), 0 4px 6px -2px rgba(79, 70, 229, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#4338ca';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(79, 70, 229, 0.4), 0 10px 10px -5px rgba(79, 70, 229, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#4f46e5';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(79, 70, 229, 0.3), 0 4px 6px -2px rgba(79, 70, 229, 0.1)';
              }}
            >
              Get Started
            </button>

            <p style={{
              marginTop: '24px',
              fontSize: '14px',
              color: '#6b7280'
            }}>
              Already have an account?{' '}
              <button
                onClick={() => router.push('/login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#4f46e5',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Sign in
              </button>
            </p>
          </div>
        </div>

        {/* Features Preview */}
        <div style={{
          marginTop: '60px',
          width: '100%',
          maxWidth: '1200px',
          padding: '0 20px'
        }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '40px'
          }}>
            Powerful Features
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '16px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              textAlign: 'left'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '16px' }}>🎯</div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', color: '#1f2937' }}>Smart Prioritization</h3>
              <p style={{ margin: 0, color: '#6b7280', lineHeight: '1.6' }}>
                Set priorities (High/Medium/Low) to focus on what matters most.
                Visual indicators help you identify urgent tasks at a glance.
              </p>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '16px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              textAlign: 'left'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '16px' }}>🏷️</div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', color: '#1f2937' }}>Tag Organization</h3>
              <p style={{ margin: 0, color: '#6b7280', lineHeight: '1.6' }}>
                Organize your todos with customizable tags.
                Filter and search through your tasks efficiently.
              </p>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '16px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              textAlign: 'left'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '16px' }}>📅</div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', color: '#1f2937' }}>Due Dates & Reminders</h3>
              <p style={{ margin: 0, color: '#6b7280', lineHeight: '1.6' }}>
                Set due dates for your tasks and get automatic reminders.
                Never miss an important deadline again.
              </p>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '16px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              textAlign: 'left'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '16px' }}>🔄</div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', color: '#1f2937' }}>Recurring Tasks</h3>
              <p style={{ margin: 0, color: '#6b7280', lineHeight: '1.6' }}>
                Set up recurring tasks with daily, weekly, or monthly patterns.
                Automatically create repetitive tasks without manual effort.
              </p>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '16px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              textAlign: 'left'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '16px' }}>🤖</div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', color: '#1f2937' }}>AI Assistant</h3>
              <p style={{ margin: 0, color: '#6b7280', lineHeight: '1.6' }}>
                Natural language commands to manage your todos.
                Simply type what you want to do and let AI handle the rest.
              </p>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '16px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              textAlign: 'left'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '16px' }}>🎨</div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', color: '#1f2937' }}>Modern UI</h3>
              <p style={{ margin: 0, color: '#6b7280', lineHeight: '1.6' }}>
                Beautiful, responsive design with dark/light mode.
                Enjoy a seamless experience across all devices.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '40px 20px',
        backgroundColor: 'white',
        borderTop: '1px solid #e5e7eb',
        textAlign: 'center',
        color: '#6b7280'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '500' }}>
            Evolution-of-Todo - The Next Generation Todo Application
          </p>
          <p style={{ margin: '0 0 24px 0', fontSize: '14px' }}>
            Built with modern technologies and AI-powered features to enhance your productivity.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '14px' }}>
            <span>© 2026 Evolution-of-Todo</span>
            <span>|</span>
            <span>Made with ❤️ for productivity</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
