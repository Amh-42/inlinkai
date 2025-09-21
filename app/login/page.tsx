'use client';

import { useSession, signIn, signOut } from '@/lib/auth-client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isOnboardingCompletSync, syncOnboardingStatus } from '@/lib/onboarding-utils';
import { sendWelcomeEmailToUser, shouldSendWelcomeEmail, markWelcomeEmailSent, hasWelcomeEmailBeenSent } from '@/lib/welcome-email-utils';

export default function LoginPage() {
  const { data: session, isPending } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);
  const router = useRouter();

  // Auto-redirect based on login status and onboarding completion
  useEffect(() => {
    const checkOnboardingAndRedirect = async () => {
      if (!isPending && session?.user && !hasRedirected) {
        console.log('🔄 Login page: User authenticated, checking onboarding status...');
        setHasRedirected(true); // Prevent multiple redirects
        // Check if this is a new user who needs a welcome email (for OAuth signups)
        if (shouldSendWelcomeEmail(session) && !hasWelcomeEmailBeenSent(session.user.id)) {
          console.log('🎉 New LinkedIn user detected, sending welcome email...');
          
          // Send welcome email for OAuth signups
          sendWelcomeEmailToUser(
            session.user.id,
            session.user.email!,
            session.user.name
          ).then((result) => {
            if (result.success) {
              console.log('✅ LinkedIn welcome email sent successfully!');
            }
            markWelcomeEmailSent(session.user.id);
          }).catch(error => {
            console.error('❌ Failed to send LinkedIn welcome email:', error);
          });
        }
        
        // Sync onboarding status from database
        const isComplete = await syncOnboardingStatus();
        
        console.log('🎯 Redirecting user:', { isComplete, userId: session.user.id });
        
        if (isComplete) {
          router.push('/dashboard');
        } else {
          router.push('/onboarding/discovery');
        }
      }
    };

    checkOnboardingAndRedirect();
  }, [session, isPending, router, hasRedirected]);

  const handleLinkedInSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn.social({
        provider: 'linkedin',
        // Remove callbackURL to let Better Auth handle redirects properly
      });
    } catch (error) {
      console.error('LinkedIn sign-in error:', error);
    } finally {
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

  if (isPending) {
    return (
      <section className="hero" id="login">
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
      <section className="hero" id="login">
        <div className="hero-container">
          <div className="login-card">
            <div className="login-header">
              <h2>Welcome back!</h2>
              <p>You're already signed in as {session.user.email}</p>
            </div>
            
            <div className="login-form">
              <button 
                onClick={handleSignOut}
                className="logout-button"
                disabled={isLoading}
              >
                {isLoading ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="hero" id="login">
      <div className="hero-container">
        <div className="login-card">
          <div className="login-form">
            <button 
              onClick={handleLinkedInSignIn}
              className="linkedin-button"
              disabled={isLoading}
            >
              <i className="fab fa-linkedin"></i>
              {isLoading ? 'Connecting...' : 'Continue with LinkedIn'}
            </button>
          </div>
          
          <div className="login-footer">
            <p className="secured-text">
              <i className="fas fa-shield-alt"></i>
              Secured by Better Auth
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}