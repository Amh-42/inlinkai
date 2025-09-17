'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    const emailParam = searchParams.get('email');
    
    if (!tokenParam || !emailParam) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }
    
    setToken(tokenParam);
    setEmail(emailParam);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          email,
          password,
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        setMessage('Password reset successful! Redirecting to login...');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(result.error || 'Failed to reset password. Please try again.');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <section className="hero" id="login">
        <div className="hero-container">
          <div className="hero-content">
            <div className="login-card">
              <div className="compliance-badge">
                <i className="fas fa-exclamation-triangle"></i>
                Invalid Link
              </div>
              <h1 className="hero-title">
                Reset Link <span className="hero-subtitle">Invalid</span>
              </h1>
              <p className="hero-description">
                This password reset link is invalid or has expired. Please request a new password reset.
              </p>
              
              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <Link href="/login" className="cta-button login-button">
                  <i className="fas fa-arrow-left"></i>
                  Back to Login
                </Link>
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
              <i className="fas fa-key"></i>
              Password Reset
            </div>
            <h1 className="hero-title">
              Create New <span className="hero-subtitle">Password</span>
            </h1>
            <p className="hero-description">
              Enter your new password below. Make sure it's secure and easy to remember.
            </p>
            
            {error && (
              <div className="alert">
                <i className="fas fa-exclamation-triangle"></i>
                {error}
              </div>
            )}
            
            {message && (
              <div className="alert success">
                <i className="fas fa-check-circle"></i>
                {message}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="password" className="form-label">New Password</label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input password-input"
                    placeholder="Enter your new password"
                    required
                    disabled={isLoading}
                    minLength={6}
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
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                <div className="password-input-container">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-input password-input"
                    placeholder="Confirm your new password"
                    required
                    disabled={isLoading}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="password-toggle-btn"
                    disabled={isLoading}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>
              
              <button 
                type="submit" 
                className="cta-button login-button full-width"
                disabled={isLoading || !password || !confirmPassword}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin" aria-hidden="true"></i>
                    Resetting Password...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check" aria-hidden="true"></i>
                    Reset Password
                  </>
                )}
              </button>
            </form>
            
            <div className="login-footer">
              <p className="footer-text">
                Remember your password?{' '}
                <Link href="/login">
                  Back to Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
