'use client';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  required?: boolean;
}

export function Toggle({ checked, onChange, label, description, required }: ToggleProps) {
  return (
    <div 
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
        padding: '1.5rem',
        background: 'var(--bg-secondary)',
        border: checked ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
      onClick={() => onChange(!checked)}
    >
      {/* Toggle Switch */}
      <div style={{
        width: '48px',
        height: '24px',
        borderRadius: '12px',
        background: checked ? 'var(--accent-primary)' : 'var(--border-color)',
        position: 'relative',
        transition: 'all 0.3s ease',
        flexShrink: 0,
        marginTop: '2px'
      }}>
        <div style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: 'white',
          position: 'absolute',
          top: '2px',
          left: checked ? '26px' : '2px',
          transition: 'all 0.3s ease',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
        }} />
      </div>
      
      {/* Label and Description */}
      <div>
        {label && (
          <div style={{ 
            color: 'var(--text-primary)', 
            fontWeight: 600, 
            marginBottom: description ? '0.5rem' : 0,
            fontSize: '1rem'
          }}>
            {required && <span style={{ color: 'var(--accent-primary)' }}>*</span>} {label}
          </div>
        )}
        {description && (
          <div style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '0.9rem',
            lineHeight: 1.4
          }}>
            {description}
          </div>
        )}
      </div>
    </div>
  );
}
