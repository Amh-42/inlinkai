'use client';

import { useSession } from '@/lib/auth-client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { saveOnboardingStep } from '@/lib/onboarding-utils';
import { Toggle } from '@/app/components/Toggle';

export default function OnboardingTermsPage() {
  const { data: session, isPending } = useSession();
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptMarketing, setAcceptMarketing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login');
    }
  }, [session, isPending, router]);

  const handleComplete = async () => {
    if (!acceptTerms) return;

    setIsLoading(true);
    
    try {
      // Save the terms acceptance to database
      const termsData = {
        acceptedTerms: acceptTerms,
        acceptedMarketing: acceptMarketing,
        acceptedAt: new Date().toISOString(),
        ipAddress: 'unknown', // In a real app, you'd capture this
        userAgent: navigator.userAgent
      };
      
      const success = await saveOnboardingStep('complete', {
        terms: termsData,
        marketing: acceptMarketing
      });
      
      if (success) {
        // Mark onboarding as complete in localStorage with correct key
        const onboardingComplete = {
          completed: true,
          completedAt: new Date().toISOString(),
          synced: true
        };
        localStorage.setItem('onboarding_complete', JSON.stringify(onboardingComplete));
        localStorage.removeItem('onboarding_current_step');
        
        console.log('✅ Onboarding completed, redirecting to dashboard...');
        
        // Small delay to ensure database update is processed
        setTimeout(() => {
          router.push('/dashboard');
        }, 500);
      } else {
        alert('Failed to save preferences. Please try again.');
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/onboarding/discovery');
  };

  if (isPending) {
    return (
      <section className="hero" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <i className="fas fa-spinner fa-spin"></i>
          Loading...
        </div>
      </section>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <section className="hero onboarding-page">
      <div className="hero-container">
        <div className="hero-content">
          <div className="login-card">
          <div className="compliance-badge">
            <i className="fas fa-shield-alt"></i>
            Legal & Privacy
          </div>
          
          <h1 className="hero-title">
            Almost <span className="hero-subtitle">Done!</span>
          </h1>
          
          <p className="hero-description">
            Quick legal stuff to finish your setup.
          </p>

          {/* Terms and Conditions Content - Simplified */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '1.5rem',
            margin: '2rem 0',
            maxHeight: '200px',
            overflow: 'auto'
          }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.125rem' }}>
              Terms & Privacy Summary
            </h3>
            
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5, fontSize: '0.9rem' }}>
              <p><strong>Service:</strong> Use InlinkAI for LinkedIn content creation and networking.</p>
              <p><strong>Privacy:</strong> We protect your data and only use it to improve your experience.</p>
              <p><strong>Content:</strong> You own your content. We help generate suggestions.</p>
              <p><strong>Account:</strong> Keep your login secure and follow our usage guidelines.</p>
              <p style={{ marginTop: '1rem', fontSize: '0.8rem', opacity: '0.8' }}>
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Agreement Toggles */}
          <div style={{ margin: '2rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Toggle
              checked={acceptTerms}
              onChange={setAcceptTerms}
              label="I agree to the Terms of Service and Privacy Policy"
              description="Required to use InlinkAI services"
              required={true}
            />
            
            <Toggle
              checked={acceptMarketing}
              onChange={setAcceptMarketing}
              label="Send me product updates and marketing emails"
              description="Optional - You can opt out anytime"
            />
          </div>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginTop: '3rem',
            gap: '1rem'
          }}>
            <button
              onClick={handleBack}
              style={{
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <i className="fas fa-arrow-left"></i>
              Back
            </button>
            
            <button
              onClick={handleComplete}
              disabled={!acceptTerms || isLoading}
              style={{
                background: acceptTerms ? 'var(--accent-gradient)' : 'var(--border-color)',
                color: acceptTerms ? 'white' : 'var(--text-secondary)',
                border: 'none',
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: acceptTerms ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: acceptTerms ? 1 : 0.6
              }}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Completing...
                </>
              ) : (
                <>
                  Complete Setup
                  <i className="fas fa-check"></i>
                </>
              )}
            </button>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}