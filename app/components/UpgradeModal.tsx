'use client';

import { useRouter } from 'next/navigation';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  usageInfo?: {
    currentUsage: number;
    limit: number;
    remaining: number;
  };
  featureName?: string;
}

export default function UpgradeModal({ 
  isOpen, 
  onClose, 
  usageInfo, 
  featureName = 'premium feature' 
}: UpgradeModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleUpgrade = () => {
    router.push('/pricing');
    onClose();
  };

  return (
    <div 
      className="modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div 
        className="modal-content"
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderRadius: '12px',
          padding: '2rem',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          border: '1px solid var(--border-color)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: '50%',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          ×
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div 
            style={{
              width: '80px',
              height: '80px',
              backgroundColor: 'var(--accent-primary)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto'
            }}
          >
            <i 
              className="fas fa-crown" 
              style={{ 
                fontSize: '2rem', 
                color: 'white' 
              }}
            ></i>
          </div>
          <h2 
            style={{ 
              color: 'var(--text-primary)', 
              margin: '0 0 0.5rem 0',
              fontSize: '1.5rem',
              fontWeight: 600
            }}
          >
            Upgrade to Pro
          </h2>
          <p 
            style={{ 
              color: 'var(--text-secondary)', 
              margin: 0,
              fontSize: '0.95rem'
            }}
          >
            You've reached your monthly limit
          </p>
        </div>

        {/* Usage info */}
        {usageInfo && (
          <div 
            style={{
              backgroundColor: 'var(--bg-secondary)',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}
          >
            <div style={{ marginBottom: '0.5rem' }}>
              <span 
                style={{ 
                  fontSize: '2rem', 
                  fontWeight: 'bold', 
                  color: 'var(--accent-primary)' 
                }}
              >
                {usageInfo.currentUsage}
              </span>
              <span 
                style={{ 
                  fontSize: '1rem', 
                  color: 'var(--text-secondary)' 
                }}
              >
                /{usageInfo.limit}
              </span>
            </div>
            <p 
              style={{ 
                margin: 0, 
                color: 'var(--text-secondary)', 
                fontSize: '0.875rem' 
              }}
            >
              Monthly {featureName} uses
            </p>
          </div>
        )}

        {/* Benefits */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 
            style={{ 
              color: 'var(--text-primary)', 
              fontSize: '1.1rem', 
              marginBottom: '1rem',
              fontWeight: 600
            }}
          >
            Pro Plan Benefits:
          </h3>
          <ul 
            style={{ 
              listStyle: 'none', 
              padding: 0, 
              margin: 0 
            }}
          >
            {[
              'Unlimited feature usage',
              'Advanced LinkedIn optimization',
              'Priority customer support',
              'Advanced analytics & insights',
              'Export CRM data'
            ].map((benefit, index) => (
              <li 
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.5rem 0',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              >
                <i 
                  className="fas fa-check" 
                  style={{ 
                    color: 'var(--accent-primary)', 
                    fontSize: '0.875rem' 
                  }}
                ></i>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {/* Action buttons */}
        <div 
          style={{ 
            display: 'flex', 
            gap: '1rem',
            flexDirection: 'column'
          }}
        >
          <button
            onClick={handleUpgrade}
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'white',
              border: 'none',
              padding: '0.875rem 1.5rem',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              width: '100%'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent-hover)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Upgrade to Pro - $20/month
          </button>
          
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
              padding: '0.875rem 1.5rem',
              borderRadius: '8px',
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              width: '100%'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
