'use client';

import { useSession, signIn, signUp } from '@/lib/auth-client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const { data: session, isPending } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasRedirected, setHasRedirected] = useState(false);
  const router = useRouter();

  // Auto-redirect authenticated users to dashboard
  useEffect(() => {
    if (!isPending && session?.user && !hasRedirected) {
      console.log('🔄 Register page: User authenticated, redirecting to dashboard...');
      setHasRedirected(true);
      router.push('/dashboard');
    }
  }, [session, isPending, router, hasRedirected]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const name = formData.get('name') as string;

    // Basic validation
    if (!email || !password || !name) {
      setError('All fields are required');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      // Use Better Auth signUp method
      const result = await signUp.email({
        email,
        password,
        name,
        callbackURL: '/dashboard'
      });

      if (result.error) {
        setError(result.error.message || 'Registration failed');
      } else {
        setSuccess('Registration successful! Redirecting...');
        // The user will be automatically redirected by the session effect
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isPending) {
    return (
      <section className="hero" id="register">
        <div className="hero-container">
          <div className="login-card">
            <div className="login-header">
              <div className="loading-spinner"></div>
              <p>Loading...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (session?.user) {
    return (
      <section className="hero" id="register">
        <div className="hero-container">
          <div className="login-card">
            <div className="login-header">
              <h2>Already Registered!</h2>
              <p>You're already signed in as {session.user.email}</p>
            </div>
            
            <div className="login-form">
              <Link href="/dashboard" className="btn btn-primary">
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '16px',
        padding: '3rem',
        boxShadow: '0 20px 40px rgba(0, 132, 255, 0.15), 0 8px 16px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(20px)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative gradient border */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4)',
          borderRadius: '16px 16px 0 0'
        }}></div>

        <div style={{
          textAlign: 'center',
          marginBottom: '2.5rem',
          paddingBottom: '1.5rem',
          borderBottom: '1px solid rgba(59, 130, 246, 0.2)'
        }}>
          <h2 style={{
            color: '#f8fafc',
            marginBottom: '0.75rem',
            fontSize: '1.875rem',
            fontWeight: '700',
            lineHeight: '1.2',
            letterSpacing: '-0.02em',
            margin: '0 0 0.75rem 0'
          }}>Create Account</h2>
          <p style={{
            color: '#cbd5e1',
            fontSize: '1rem',
            margin: '0',
            lineHeight: '1.5',
            opacity: '0.9'
          }}>Sign up to get started with InLinkAI</p>
        </div>
        
        <form onSubmit={handleSubmit} style={{ margin: '2rem 0', width: '100%' }}>
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem 1.25rem',
              margin: '1rem 0',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: '500',
              lineHeight: '1.4',
              background: 'rgba(220, 38, 38, 0.1)',
              border: '1px solid rgba(220, 38, 38, 0.3)',
              color: '#ff6b6b'
            }}>
              <i className="fas fa-exclamation-circle" style={{ color: '#ff6b6b', fontSize: '1.1rem' }}></i>
              {error}
            </div>
          )}
          
          {success && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem 1.25rem',
              margin: '1rem 0',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: '500',
              lineHeight: '1.4',
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              color: '#4ade80'
            }}>
              <i className="fas fa-check-circle" style={{ color: '#4ade80', fontSize: '1.1rem' }}></i>
              {success}
            </div>
          )}

          <div style={{ marginBottom: '1.5rem', width: '100%' }}>
            <label htmlFor="name" style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#f8fafc',
              fontWeight: '600',
              fontSize: '0.875rem',
              lineHeight: '1.4'
            }}>Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              required
              placeholder="Enter your full name"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                border: '2px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '8px',
                fontSize: '1rem',
                color: '#f8fafc',
                background: 'rgba(15, 23, 42, 0.8)',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                lineHeight: '1.5',
                outline: 'none'
              }}
              onFocus={(e) => {
                const target = e.target as HTMLInputElement;
                target.style.borderColor = '#3b82f6';
                target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                target.style.transform = 'translateY(-1px)';
              }}
              onBlur={(e) => {
                const target = e.target as HTMLInputElement;
                target.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                target.style.boxShadow = 'none';
                target.style.transform = 'translateY(0)';
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem', width: '100%' }}>
            <label htmlFor="email" style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#f8fafc',
              fontWeight: '600',
              fontSize: '0.875rem',
              lineHeight: '1.4'
            }}>Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              placeholder="Enter your email"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                border: '2px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '8px',
                fontSize: '1rem',
                color: '#f8fafc',
                background: 'rgba(15, 23, 42, 0.8)',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                lineHeight: '1.5',
                outline: 'none'
              }}
              onFocus={(e) => {
                const target = e.target as HTMLInputElement;
                target.style.borderColor = '#3b82f6';
                target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                target.style.transform = 'translateY(-1px)';
              }}
              onBlur={(e) => {
                const target = e.target as HTMLInputElement;
                target.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                target.style.boxShadow = 'none';
                target.style.transform = 'translateY(0)';
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem', width: '100%' }}>
            <label htmlFor="password" style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#f8fafc',
              fontWeight: '600',
              fontSize: '0.875rem',
              lineHeight: '1.4'
            }}>Password</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              placeholder="Create a password"
              minLength={6}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                border: '2px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '8px',
                fontSize: '1rem',
                color: '#f8fafc',
                background: 'rgba(15, 23, 42, 0.8)',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                lineHeight: '1.5',
                outline: 'none'
              }}
              onFocus={(e) => {
                const target = e.target as HTMLInputElement;
                target.style.borderColor = '#3b82f6';
                target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                target.style.transform = 'translateY(-1px)';
              }}
              onBlur={(e) => {
                const target = e.target as HTMLInputElement;
                target.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                target.style.boxShadow = 'none';
                target.style.transform = 'translateY(0)';
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem', width: '100%' }}>
            <label htmlFor="confirmPassword" style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#f8fafc',
              fontWeight: '600',
              fontSize: '0.875rem',
              lineHeight: '1.4'
            }}>Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              required
              placeholder="Confirm your password"
              minLength={6}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                border: '2px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '8px',
                fontSize: '1rem',
                color: '#f8fafc',
                background: 'rgba(15, 23, 42, 0.8)',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                lineHeight: '1.5',
                outline: 'none'
              }}
              onFocus={(e) => {
                const target = e.target as HTMLInputElement;
                target.style.borderColor = '#3b82f6';
                target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                target.style.transform = 'translateY(-1px)';
              }}
              onBlur={(e) => {
                const target = e.target as HTMLInputElement;
                target.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                target.style.boxShadow = 'none';
                target.style.transform = 'translateY(0)';
              }}
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.875rem 1.5rem',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              textDecoration: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
              lineHeight: '1.5',
              width: '100%',
              marginTop: '0.5rem',
              background: isLoading ? 'rgba(59, 130, 246, 0.6)' : '#3b82f6',
              color: 'white',
              opacity: isLoading ? '0.6' : '1',
              transform: 'translateY(0)',
              boxShadow: isLoading ? 'none' : '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                const target = e.target as HTMLButtonElement;
                target.style.background = '#2563eb';
                target.style.transform = 'translateY(-1px)';
                target.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                const target = e.target as HTMLButtonElement;
                target.style.background = '#3b82f6';
                target.style.transform = 'translateY(0)';
                target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
              }
            }}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <div style={{
          marginTop: '2.5rem',
          paddingTop: '2rem',
          borderTop: '1px solid rgba(59, 130, 246, 0.2)',
          textAlign: 'center'
        }}>
          <p style={{
            color: '#cbd5e1',
            fontSize: '0.9rem',
            marginBottom: '1rem',
            lineHeight: '1.5'
          }}>
            Already have an account?{' '}
            <Link href="/login" style={{
              color: '#3b82f6',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              const target = e.target as HTMLAnchorElement;
              target.style.color = '#2563eb';
              target.style.textDecoration = 'underline';
            }}
            onMouseLeave={(e) => {
              const target = e.target as HTMLAnchorElement;
              target.style.color = '#3b82f6';
              target.style.textDecoration = 'none';
            }}>
              Sign in here
            </Link>
          </p>
          <p style={{
            color: '#94a3b8',
            fontSize: '0.8rem',
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(59, 130, 246, 0.2)',
            opacity: '0.8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            <i className="fas fa-shield-alt" style={{ color: '#3b82f6' }}></i>
            Secured by Better Auth
          </p>
        </div>
      </div>
    </div>
  );
}
