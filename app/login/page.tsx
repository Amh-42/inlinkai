'use client';

import { useSession, signIn, signUp, signOut } from '@/lib/auth-client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isOnboardingCompletSync, syncOnboardingStatus } from '@/lib/onboarding-utils';
import { sendWelcomeEmailToUser, shouldSendWelcomeEmail, markWelcomeEmailSent, hasWelcomeEmailBeenSent, markRecentSignup } from '@/lib/welcome-email-utils';

export default function LoginPage() {
  const { data: session, isPending } = useSession();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Auto-redirect based on login status and onboarding completion
  useEffect(() => {
    const checkOnboardingAndRedirect = async () => {
      if (!isPending && session?.user) {
        // Check if this is a new user who needs a welcome email (for OAuth signups)
        if (shouldSendWelcomeEmail(session) && !hasWelcomeEmailBeenSent(session.user.id)) {
          console.log('🎉 New OAuth user detected, sending welcome email...');
          
          // Send welcome email for OAuth signups
          sendWelcomeEmailToUser(
            session.user.id,
            session.user.email!,
            session.user.name
          ).then((result) => {
            if (result.success) {
              console.log('✅ OAuth welcome email sent successfully!');
            }
            markWelcomeEmailSent(session.user.id);
          }).catch(error => {
            console.error('❌ Failed to send OAuth welcome email:', error);
          });
        }
        
        // Sync onboarding status from database
        const isComplete = await syncOnboardingStatus();
        
        if (isComplete) {
          router.push('/dashboard');
        } else {
          // Redirect to onboarding for first-time users
          router.push('/onboarding/role');
        }
      }
    };

    checkOnboardingAndRedirect();
  }, [session, isPending, router]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      let authResult: any;
      
      if (isSignUp) {
        authResult = await signUp.email({
          email,
          password,
          name,
        });
        
        // Send welcome email for new signups
        // Check if signup was successful and user data is available
        if (authResult && !authResult.error) {
          console.log('🎉 New user signed up, sending welcome email...');
          
          // For signups, we know it's a new user, so always send welcome email
          // Send welcome email in the background (don't wait for it to complete)
          sendWelcomeEmailToUser(
            email, // Use the email from form since authResult might not have user data immediately
            email,
            name
          ).then((result) => {
            if (result.success) {
              console.log('✅ Welcome email sent successfully!');
              // Could show a toast notification here if desired
            }
            markWelcomeEmailSent(email); // Use email as temp ID
          }).catch(error => {
            console.error('❌ Failed to send welcome email:', error);
            // Don't block the user flow if email fails
          });
        }
      } else {
        authResult = await signIn.email({
          email,
          password,
        });
      }
      
      // Check if there was an authentication error
      if (authResult && authResult.error) {
        console.error('Authentication error:', authResult.error);
        
        // Set specific error messages based on the error type
        if (authResult.error.message) {
          if (authResult.error.message.includes('Invalid password')) {
            setError('Incorrect password. Please try again.');
          } else if (authResult.error.message.includes('User not found')) {
            setError('No account found with this email address.');
          } else if (authResult.error.message.includes('Password is too short')) {
            setError('Password must be at least 6 characters long.');
          } else {
            setError(authResult.error.message);
          }
        } else {
          setError('Authentication failed. Please check your credentials and try again.');
        }
        return; // Don't proceed with redirect if there's an error
      }
      
      // Only clear form and redirect if authentication was successful
      setEmail('');
      setPassword('');
      setName('');
      setError(''); // Clear any previous errors
      
      // Redirect based on onboarding status
      const isComplete = await syncOnboardingStatus();
      if (isComplete) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding/role');
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      
      // Better error handling for different error types
      if (error.message) {
        if (error.message.includes('Invalid password')) {
          setError('Incorrect password. Please try again.');
        } else if (error.message.includes('User not found')) {
          setError('No account found with this email address.');
        } else if (error.message.includes('Password is too short')) {
          setError('Password must be at least 6 characters long.');
        } else if (error.message.includes('Email already exists')) {
          setError('An account with this email already exists. Try signing in instead.');
        } else {
          setError(error.message);
        }
      } else {
        setError('Authentication failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    try {
      setIsLoading(true);
      setError(''); // Clear any previous errors
      
      const result = await signIn.social({
        provider: 'github',
        callbackURL: '/dashboard', // Will be handled by dashboard redirect logic
      });
      
      // Check if there was an error
      if (result && result.error) {
        console.error('GitHub sign-in error:', result.error);
        setError('GitHub sign-in failed. Please try again.');
        setIsLoading(false);
      }
      // If successful, OAuth flow will handle redirection automatically
    } catch (error: any) {
      console.error('GitHub sign-in error:', error);
      setError('GitHub sign-in failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(''); // Clear any previous errors
      
      const result = await signIn.social({
        provider: 'google',
        callbackURL: '/dashboard', // Will be handled by dashboard redirect logic
      });
      
      // Check if there was an error
      if (result && result.error) {
        console.error('Google sign-in error:', result.error);
        setError('Google sign-in failed. Please try again.');
        setIsLoading(false);
      }
      // If successful, OAuth flow will handle redirection automatically
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      setError('Google sign-in failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      console.log('🚪 Login page: Starting logout process...');
      
      // Clear any cached session data
      if (typeof window !== 'undefined') {
        // Clear all auth-related localStorage
        Object.keys(localStorage).forEach(key => {
          if (key.includes('auth') || key.includes('session') || key.includes('token') || key.includes('onboarding')) {
            localStorage.removeItem(key);
          }
        });
      }
      
      // Call Better Auth signOut
      await signOut({
        fetchOptions: {
          credentials: 'include',
        }
      });
      
      console.log('✅ Login page: Logout successful, redirecting...');
      
      // Force a hard redirect to clear any cached state
      window.location.href = '/';
    } catch (error) {
      console.error('❌ Login page: Sign-out error:', error);
      // Even if signOut fails, clear local data and redirect
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;

    setIsLoading(true);
    setResetMessage('');
    
    try {
      // TODO: Replace with actual password reset endpoint
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resetEmail }),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setResetMessage(result.message || 'Password reset link sent! Check your email.');
        setResetEmail('');
        setTimeout(() => {
          setShowForgotPassword(false);
          setResetMessage('');
        }, 4000);
      } else {
        setResetMessage(result.error || result.details || 'Failed to send reset email. Please try again.');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setResetMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isPending) {
    return (
      <section className="hero" id="login">
        <div className="hero-container">
          <div className="hero-content">
            <div className="login-card">
              <div className="loading">Loading...</div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (session?.user) {
    return (
      <section className="hero" id="login">
        <div className="hero-container">
          <div className="hero-content">
            <div className="user-info">
              <div className="compliance-badge">
                <i className="fas fa-check-circle"></i>
                Welcome Back
              </div>
              <h2 className="hero-title">Hello, <span className="hero-subtitle">{session.user.name || session.user.email}!</span></h2>
              <p className="hero-description">
                You're successfully signed in to your InlinkAI account.
              </p>
              <div className="user-details">
                <p><strong>Email:</strong> {session.user.email}</p>
                <p><strong>User ID:</strong> {session.user.id}</p>
                {session.user.image && (
                  <img 
                    src={session.user.image} 
                    alt="Profile" 
                    style={{ 
                      width: '80px', 
                      height: '80px', 
                      borderRadius: '50%', 
                      margin: '20px 0',
                      border: '3px solid var(--accent-primary)'
                    }}
                  />
                )}
              </div>
              <div className="hero-actions">
                <a href="/dashboard" className="cta-button login-button">
                  Go to Dashboard
                  <i className="fas fa-chart-line" aria-hidden="true"></i>
                </a>
                <button onClick={handleSignOut} className="cta-button secondary-button">
                  Sign Out
                  <i className="fas fa-sign-out-alt" aria-hidden="true"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="hero" id="login">
      <div className="hero-container">
        <div className="hero-content">
          <div className="login-card">
            <div className="compliance-badge">
              <i className="fas fa-lock"></i>
              Secure Authentication
            </div>
            <h1 className="hero-title">
              {isSignUp ? 'Create Your' : 'Access Your'} <span className="hero-subtitle">Account</span>
            </h1>
            <p className="hero-description">
              {isSignUp 
                ? 'Join thousands of professionals transforming their LinkedIn presence with AI-powered tools.'
                : 'Sign in to continue your LinkedIn transformation journey with AI-powered insights and content.'
              }
            </p>
            
                {error && (
                  <div className="alert">
                    <i className="fas fa-exclamation-triangle"></i>
                    {error}
                  </div>
                )}

                {showForgotPassword && (
                  <div className="forgot-password-modal">
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', fontWeight: '600' }}>
                      <i className="fas fa-key" style={{ marginRight: '0.5rem', color: 'var(--accent-primary)' }}></i>
                      Reset Your Password
                    </h3>
                    <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      Enter your email address and we'll send you a link to reset your password.
                    </p>
                    <form onSubmit={handleForgotPassword}>
                      <div className="form-group">
                        <label htmlFor="resetEmail" className="form-label">Email Address</label>
                        <input
                          type="email"
                          id="resetEmail"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          className="form-input"
                          placeholder="Enter your email address"
                          required
                          disabled={isLoading}
                        />
                      </div>
                      {resetMessage && (
                        <div className={`alert ${resetMessage.includes('sent') ? 'success' : ''}`} style={{ marginBottom: '1rem' }}>
                          <i className={`fas ${resetMessage.includes('sent') ? 'fa-check-circle' : 'fa-exclamation-triangle'}`}></i>
                          {resetMessage}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setShowForgotPassword(false);
                            setResetEmail('');
                            setResetMessage('');
                          }}
                          className="cta-button secondary-button"
                          style={{ flex: 1 }}
                          disabled={isLoading}
                        >
                          <i className="fas fa-arrow-left"></i>
                          Back
                        </button>
                        <button
                          type="submit"
                          className="cta-button login-button"
                          style={{ flex: 1 }}
                          disabled={isLoading || !resetEmail}
                        >
                          {isLoading ? (
                            <>
                              <i className="fas fa-spinner fa-spin"></i>
                              Sending...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-paper-plane"></i>
                              Send Reset Link
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {!showForgotPassword && (
                  <form onSubmit={handleEmailAuth} className="login-form">
              {isSignUp && (
                <div className="form-group">
                  <label htmlFor="name" className="form-label">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (error) setError(''); // Clear error when user starts typing
                    }}
                    className="form-input"
                    placeholder="Enter your full name"
                    required={isSignUp}
                    disabled={isLoading}
                  />
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError(''); // Clear error when user starts typing
                      }}
                      className="form-input"
                      placeholder="Enter your email address"
                      required
                      disabled={isLoading}
                    />
              </div>
              
                <div className="form-group">
                  <label htmlFor="password" className="form-label">Password</label>
                  <div className="password-input-container">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError(''); // Clear error when user starts typing
                      }}
                      className="form-input password-input"
                      placeholder="Enter your password"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="password-toggle-btn"
                      disabled={isLoading}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  {!isSignUp && (
                    <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                      <span
                        onClick={() => setShowForgotPassword(true)}
                        className="forgot-password-link"
                        style={{ 
                          cursor: isLoading ? 'not-allowed' : 'pointer',
                          opacity: isLoading ? 0.5 : 1,
                          pointerEvents: isLoading ? 'none' : 'auto'
                        }}
                      >
                        Forgot password?
                      </span>
                    </div>
                  )}
                </div>
              
              <button 
                type="submit" 
                className="cta-button login-button full-width"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin" aria-hidden="true"></i>
                    {isSignUp ? 'Creating Account...' : 'Signing In...'}
                  </>
                ) : (
                  <>
                    {isSignUp ? 'Create Account' : 'Sign In'}
                    <i className="fas fa-rocket" aria-hidden="true"></i>
                  </>
                )}
              </button>
            </form>
                )}
            
            {!showForgotPassword && (
              <div className="social-buttons">
              <p>Or continue with:</p>
              <button 
                onClick={handleGitHubSignIn} 
                className="btn btn-github"
                disabled={isLoading}
              >
                <i className="fab fa-github"></i>
                Continue with GitHub
              </button>
              
              <button 
                onClick={handleGoogleSignIn} 
                className="btn btn-google"
                disabled={isLoading}
              >
                <i className="fab fa-google"></i>
                Continue with Google
              </button>
            </div>
            )}
            
            <div className="login-footer">
              <p className="footer-text">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setError(''); // Clear any error messages
                      setEmail('');
                      setPassword('');
                      setName('');
                      setResetEmail('');
                      setResetMessage('');
                      setShowForgotPassword(false);
                    }}
                    disabled={isLoading}
                  >
                  {isSignUp ? 'Sign In' : 'Create Account'}
                </button>
              </p>
              <div className="security-features">
                <div className="security-item">
                  <i className="fas fa-shield-alt"></i>
                  <span>Secured by Better Auth</span>
                </div>
                
                <div className="security-item">
                  <i className="fas fa-credit-card"></i>
                  <span>No credit card needed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
