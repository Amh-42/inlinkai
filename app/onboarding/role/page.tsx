'use client';

import { useSession } from '@/lib/auth-client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { saveOnboardingStep } from '@/lib/onboarding-utils';

const roleOptions = [
  {
    id: 'freelancer',
    title: 'Freelancer',
    description: 'Independent professional',
    icon: 'fas fa-user-tie'
  },
  {
    id: 'entrepreneur',
    title: 'Entrepreneur',
    description: 'Business owner',
    icon: 'fas fa-rocket'
  },
  {
    id: 'developer',
    title: 'Developer',
    description: 'Tech professional',
    icon: 'fas fa-code'
  },
  {
    id: 'marketer',
    title: 'Marketer',
    description: 'Marketing specialist',
    icon: 'fas fa-bullhorn'
  },
  {
    id: 'sales',
    title: 'Sales',
    description: 'Sales professional',
    icon: 'fas fa-handshake'
  },
  {
    id: 'other',
    title: 'Other',
    description: 'Different role',
    icon: 'fas fa-ellipsis-h'
  }
];

export default function OnboardingRolePage() {
  const { data: session, isPending } = useSession();
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [customRole, setCustomRole] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login');
    }
  }, [session, isPending, router]);

  const handleContinue = async () => {
    if (!selectedRole) return;

    setIsLoading(true);
    
    try {
      // Save the role selection to database
      const roleData = {
        role: selectedRole,
        customRole: selectedRole === 'other' ? customRole : null,
        timestamp: new Date().toISOString()
      };
      
      const success = await saveOnboardingStep('role', roleData);
      
      if (success) {
        // Also save to localStorage as fallback
        localStorage.setItem('onboarding_role', JSON.stringify(roleData));
        
        // Proceed to next step
        router.push('/onboarding/discovery');
      } else {
        alert('Failed to save your selection. Please try again.');
      }
    } catch (error) {
      console.error('Error saving role:', error);
      alert('Failed to save your selection. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
            <i className="fas fa-user-plus"></i>
            Welcome to InlinkAI
          </div>
          
          <h1 className="hero-title">
            What's Your <span className="hero-subtitle">Role?</span>
          </h1>
          
          <p className="hero-description">
            Quick question to personalize your experience.
          </p>

          <div className="onboarding-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '1rem', 
            margin: '2rem 0' 
          }}>
            {roleOptions.map((role) => (
              <div
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                style={{
                  border: selectedRole === role.id ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  background: selectedRole === role.id ? 'var(--accent-secondary)' : 'var(--bg-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                className="role-option"
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: selectedRole === role.id ? 'var(--accent-primary)' : 'var(--accent-gradient)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <i className={role.icon} style={{ 
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
                      {role.title}
                    </h3>
                    <p style={{ 
                      color: 'var(--text-secondary)', 
                      margin: 0, 
                      fontSize: '0.9rem',
                      lineHeight: 1.4 
                    }}>
                      {role.description}
                    </p>
                  </div>
                  
                  {selectedRole === role.id && (
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

          {selectedRole === 'other' && (
            <div className="form-group" style={{ margin: '1.5rem 0' }}>
              <label htmlFor="customRole" className="form-label">
                Please specify your role:
              </label>
              <input
                type="text"
                id="customRole"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                className="form-input"
                placeholder="e.g., Teacher, Doctor, Real Estate Agent..."
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
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Step 1 of 3
            </div>
            
            <button
              onClick={handleContinue}
              disabled={!selectedRole || (selectedRole === 'other' && !customRole.trim()) || isLoading}
              className="cta-button login-button"
              style={{
                opacity: (!selectedRole || (selectedRole === 'other' && !customRole.trim())) ? 0.5 : 1,
                cursor: (!selectedRole || (selectedRole === 'other' && !customRole.trim())) ? 'not-allowed' : 'pointer'
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
