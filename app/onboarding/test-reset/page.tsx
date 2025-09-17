'use client';

import { clearOnboardingData, getOnboardingData } from '@/lib/onboarding-utils';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingTestResetPage() {
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    setOnboardingData(getOnboardingData());
  }, []);

  const handleReset = () => {
    clearOnboardingData();
    setOnboardingData(getOnboardingData());
    alert('Onboarding data cleared! Next login will trigger onboarding flow.');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <section className="hero" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '2rem',
      background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)'
    }}>
      <div className="hero-container" style={{ maxWidth: '800px', width: '100%' }}>
        <div className="login-card">
          <div className="compliance-badge">
            <i className="fas fa-tools"></i>
            Development Tools
          </div>
          
          <h1 className="hero-title">
            Onboarding <span className="hero-subtitle">Test Reset</span>
          </h1>
          
          <p className="hero-description">
            This page allows you to reset the onboarding data for testing purposes. 
            Use this to simulate a first-time user experience.
          </p>

          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '2rem',
            margin: '2rem 0'
          }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Current Onboarding Status
            </h3>
            
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.9rem' }}>
              {onboardingData ? (
                <div>
                  <p><strong>Role Data:</strong> {onboardingData.role ? '✅ Complete' : '❌ Missing'}</p>
                  <p><strong>Discovery Data:</strong> {onboardingData.discovery ? '✅ Complete' : '❌ Missing'}</p>
                  <p><strong>Terms Data:</strong> {onboardingData.terms ? '✅ Complete' : '❌ Missing'}</p>
                  <p><strong>Onboarding Complete:</strong> {onboardingData.complete ? '✅ Yes' : '❌ No'}</p>
                  
                  {onboardingData.complete && (
                    <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--accent-secondary)', borderRadius: '8px' }}>
                      <p style={{ color: 'var(--accent-primary)', fontWeight: 600, margin: 0 }}>
                        ✅ Onboarding is complete - user will go directly to dashboard
                      </p>
                    </div>
                  )}
                  
                  {!onboardingData.complete && (
                    <div style={{ marginTop: '1rem', padding: '1rem', background: '#fef3c7', borderRadius: '8px' }}>
                      <p style={{ color: '#92400e', fontWeight: 600, margin: 0 }}>
                        ⚠️ Onboarding is incomplete - user will be redirected to onboarding flow
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p>No onboarding data found - user will go through full onboarding flow</p>
              )}
            </div>
          </div>

          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={handleReset}
              className="cta-button secondary-button"
              style={{ backgroundColor: '#ef4444', borderColor: '#ef4444', color: 'white' }}
            >
              <i className="fas fa-trash" aria-hidden="true"></i>
              Reset Onboarding Data
            </button>
            
            <button
              onClick={handleGoHome}
              className="cta-button login-button"
            >
              <i className="fas fa-home" aria-hidden="true"></i>
              Go to Homepage
            </button>
          </div>
          
          <div style={{ 
            marginTop: '2rem',
            padding: '1rem',
            background: '#fef3c7',
            borderRadius: '8px',
            fontSize: '0.9rem',
            color: '#92400e'
          }}>
            <p style={{ margin: 0 }}>
              <strong>Note:</strong> This page is for development testing only. 
              In production, onboarding data would be stored in the database and managed properly.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
