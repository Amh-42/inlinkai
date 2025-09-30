'use client';

import { useEffect, useState } from 'react';

interface UsageInfo {
  currentUsage: number;
  limit: number;
  remaining: number;
  canUseFeature: boolean;
  isProUser: boolean;
}

export default function UsageIndicator() {
  const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsageInfo = async () => {
      try {
        const response = await fetch('/api/usage');
        if (response.ok) {
          const data = await response.json();
          setUsageInfo(data.usage);
        }
      } catch (error) {
        console.error('Error fetching usage info:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsageInfo();
  }, []);

  if (isLoading || !usageInfo) {
    return null;
  }

  // Don't show anything for pro users - they have unlimited access
  if (usageInfo.isProUser) {
    return null;
  }

  const percentage = (usageInfo.currentUsage / usageInfo.limit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = usageInfo.currentUsage >= usageInfo.limit;

  return (
    <div 
      style={{
        padding: '0.75rem 1.5rem',
        margin: '1rem 0',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '8px',
        border: isAtLimit ? '1px solid #ef4444' : '1px solid var(--border-color)'
      }}
    >
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '0.5rem'
        }}
      >
        <span 
          style={{ 
            fontSize: '0.75rem', 
            fontWeight: 600, 
            color: isAtLimit ? '#ef4444' : 'var(--text-primary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          Monthly Usage
        </span>
        <span 
          style={{ 
            fontSize: '0.75rem', 
            color: isAtLimit ? '#ef4444' : isNearLimit ? '#f59e0b' : 'var(--text-secondary)' 
          }}
        >
          {usageInfo.currentUsage}/{usageInfo.limit}
        </span>
      </div>
      
      {/* Progress bar */}
      <div 
        style={{
          width: '100%',
          height: '4px',
          backgroundColor: 'var(--border-color)',
          borderRadius: '2px',
          overflow: 'hidden',
          marginBottom: '0.5rem'
        }}
      >
        <div 
          style={{
            width: `${Math.min(percentage, 100)}%`,
            height: '100%',
            backgroundColor: isAtLimit ? '#ef4444' : isNearLimit ? '#f59e0b' : 'var(--accent-primary)',
            transition: 'width 0.3s ease'
          }}
        />
      </div>

      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
        {usageInfo.remaining > 0 ? (
          `${usageInfo.remaining} uses remaining`
        ) : (
          <span style={{ color: '#ef4444', fontWeight: 500 }}>
            <i className="fas fa-exclamation-triangle" style={{ marginRight: '0.25rem' }}></i>
            Limit reached
          </span>
        )}
      </div>
    </div>
  );
}
