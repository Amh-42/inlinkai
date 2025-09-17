'use client';

import { useSession } from '@/lib/auth-client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { saveOnboardingStep } from '@/lib/onboarding-utils';

const discoveryOptions = [
  {
    id: 'search-engine',
    title: 'Google Search',
    description: 'Found via search',
    icon: 'fas fa-search'
  },
  {
    id: 'social-media',
    title: 'Social Media',
    description: 'LinkedIn, Twitter, etc.',
    icon: 'fas fa-share-alt'
  },
  {
    id: 'recommendation',
    title: 'Recommendation',
    description: 'Friend or colleague',
    icon: 'fas fa-user-friends'
  },
  {
    id: 'online-ad',
    title: 'Advertisement',
    description: 'Saw an ad online',
    icon: 'fas fa-bullseye'
  },
  {
    id: 'other',
    title: 'Other',
    description: 'Different source',
    icon: 'fas fa-question-circle'
  }
];

export default function OnboardingDiscoveryPage() {
  const { data: session, isPending } = useSession();
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [customSource, setCustomSource] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login');
    }
  }, [session, isPending, router]);

  useEffect(() => {
    // Check if user completed previous step
    const roleData = localStorage.getItem('onboarding_role');
    if (!roleData) {
      router.push('/onboarding/role');
    }
  }, [router]);

  const handleContinue = async () => {
    if (!selectedSource) return;

    setIsLoading(true);
    
    try {
      // Save the discovery source to database
      const discoveryData = {
        source: selectedSource,
        customSource: selectedSource === 'other' ? customSource : null,
        timestamp: new Date().toISOString()
      };
      
      const success = await saveOnboardingStep('discovery', discoveryData);
      
      if (success) {
        // Also save to localStorage as fallback
        localStorage.setItem('onboarding_discovery', JSON.stringify(discoveryData));
        
        // Proceed to next step
        router.push('/onboarding/terms');
      } else {
        alert('Failed to save your selection. Please try again.');
      }
    } catch (error) {
      console.error('Error saving discovery source:', error);
      alert('Failed to save your selection. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/onboarding/role');
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
            <i className="fas fa-compass"></i>
            Help Us Improve
          </div>
          
          <h1 className="hero-title">
            How did you <span className="hero-subtitle">find us?</span>
          </h1>
          
          <p className="hero-description">
            Help us understand how to reach more professionals like you.
          </p>

          <div className="onboarding-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '1rem', 
            margin: '2rem 0' 
          }}>
            {discoveryOptions.map((option) => (
              <div
                key={option.id}
                onClick={() => setSelectedSource(option.id)}
                style={{
                  border: selectedSource === option.id ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  background: selectedSource === option.id ? 'var(--accent-secondary)' : 'var(--bg-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                className="discovery-option"
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: selectedSource === option.id ? 'var(--accent-primary)' : 'var(--accent-gradient)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <i className={option.icon} style={{ 
                      color: 'white', 
                      fontSize: '1.25rem' 
                    }}></i>
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      color: 'var(--text-primary)', 
                      margin: '0 0 0.5rem 0', 
                      fontSize: '1.1rem',
                      fontWeight: 600 
                    }}>
                      {option.title}
                    </h3>
                    <p style={{ 
                      color: 'var(--text-secondary)', 
                      margin: 0, 
                      fontSize: '0.9rem',
                      lineHeight: 1.4 
                    }}>
                      {option.description}
                    </p>
                  </div>
                  
                  {selectedSource === option.id && (
                    <div style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'var(--accent-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <i className="fas fa-check" style={{ color: 'white', fontSize: '0.75rem' }}></i>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {selectedSource === 'other' && (
            <div className="form-group" style={{ margin: '1.5rem 0' }}>
              <label htmlFor="customSource" className="form-label">
                Please tell us how you found InlinkAI:
              </label>
              <input
                type="text"
                id="customSource"
                value={customSource}
                onChange={(e) => setCustomSource(e.target.value)}
                className="form-input"
                placeholder="e.g., Industry publication, specific website, etc."
                style={{ marginTop: '0.5rem' }}
              />
            </div>
          )}

          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginTop: '2rem',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={handleBack}
                className="cta-button secondary-button"
                style={{ padding: '0.75rem 1.5rem' }}
              >
                <i className="fas fa-arrow-left" aria-hidden="true"></i>
                Back
              </button>
              
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Step 2 of 3
              </div>
            </div>
            
            <button
              onClick={handleContinue}
              disabled={!selectedSource || (selectedSource === 'other' && !customSource.trim()) || isLoading}
              className="cta-button login-button"
              style={{
                opacity: (!selectedSource || (selectedSource === 'other' && !customSource.trim())) ? 0.5 : 1,
                cursor: (!selectedSource || (selectedSource === 'other' && !customSource.trim())) ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin" aria-hidden="true"></i>
                  Continue
                </>
              ) : (
                <>
                  Continue
                  <i className="fas fa-arrow-right" aria-hidden="true"></i>
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
