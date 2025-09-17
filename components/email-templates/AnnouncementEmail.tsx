import * as React from 'react';

interface AnnouncementEmailProps {
  firstName?: string;
  userEmail: string;
  announcement: {
    title: string;
    subtitle: string;
    description: string;
    features: Array<{
      icon: string;
      title: string;
      description: string;
    }>;
    ctaText: string;
    ctaUrl: string;
    customMessage?: string;
  };
}

export function AnnouncementEmail({ firstName, userEmail, announcement }: AnnouncementEmailProps) {
  return (
    <div style={{
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      lineHeight: '1.6',
      color: '#333333',
      maxWidth: '600px',
      margin: '0 auto',
      backgroundColor: '#ffffff'
    }}>
      {/* Header with Announcement Badge */}
      <div style={{
        background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
        padding: '40px 20px',
        textAlign: 'center' as const,
        position: 'relative' as const
      }}>
        <div style={{
          display: 'inline-block',
          backgroundColor: '#fbbf24',
          color: '#1f2937',
          fontSize: '12px',
          fontWeight: '700',
          padding: '6px 12px',
          borderRadius: '20px',
          textTransform: 'uppercase' as const,
          letterSpacing: '0.5px',
          marginBottom: '16px'
        }}>
          🎉 New Feature
        </div>
        
        <h1 style={{
          color: '#ffffff',
          fontSize: '32px',
          fontWeight: '700',
          margin: '0 0 8px 0',
          letterSpacing: '-0.02em'
        }}>
          {announcement.title}
        </h1>
        
        <p style={{
          color: '#e0e7ff',
          fontSize: '18px',
          margin: '0',
          fontWeight: '400'
        }}>
          {announcement.subtitle}
        </p>
      </div>

      {/* Main Content */}
      <div style={{ padding: '40px 20px' }}>
        <h2 style={{
          color: '#1e293b',
          fontSize: '24px',
          fontWeight: '600',
          marginBottom: '16px',
          letterSpacing: '-0.01em'
        }}>
          Hey {firstName || 'there'}! 👋
        </h2>

        {announcement.customMessage ? (
          <div style={{
            fontSize: '16px',
            marginBottom: '30px',
            lineHeight: '1.7',
            color: '#475569',
            whiteSpace: 'pre-line'
          }}>
            {announcement.customMessage}
          </div>
        ) : (
          <p style={{
            fontSize: '16px',
            marginBottom: '30px',
            lineHeight: '1.7',
            color: '#475569'
          }}>
            {announcement.description}
          </p>
        )}

        {/* Features Showcase */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderRadius: '16px',
          padding: '30px 20px',
          marginBottom: '30px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{
            color: '#1e293b',
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '20px',
            textAlign: 'center' as const
          }}>
            What's New ✨
          </h3>

          {announcement.features.map((feature, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'flex-start',
              marginBottom: index === announcement.features.length - 1 ? '0' : '20px',
              padding: '16px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{
                fontSize: '32px',
                marginRight: '16px',
                flexShrink: 0,
                lineHeight: '1'
              }}>
                {feature.icon}
              </div>
              <div>
                <h4 style={{
                  margin: '0 0 6px 0',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1e293b'
                }}>
                  {feature.title}
                </h4>
                <p style={{
                  margin: '0',
                  fontSize: '14px',
                  color: '#64748b',
                  lineHeight: '1.5'
                }}>
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div style={{
          textAlign: 'center' as const,
          padding: '30px 20px',
          backgroundColor: '#f1f5f9',
          borderRadius: '12px',
          border: '2px dashed #cbd5e1'
        }}>
          <h3 style={{
            color: '#1e293b',
            fontSize: '22px',
            fontWeight: '600',
            marginBottom: '12px'
          }}>
            Ready to try it out?
          </h3>
          <p style={{
            fontSize: '16px',
            color: '#64748b',
            marginBottom: '24px'
          }}>
            Experience the new features in your dashboard
          </p>
          <a
            href={announcement.ctaUrl}
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
              color: '#ffffff',
              textDecoration: 'none',
              padding: '16px 32px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              boxShadow: '0 4px 14px 0 rgba(124, 58, 237, 0.25)',
              transition: 'transform 0.2s ease'
            }}
          >
            {announcement.ctaText} →
          </a>
        </div>

        {/* Social Proof / Community */}
        <div style={{
          marginTop: '40px',
          textAlign: 'center' as const
        }}>
          <p style={{
            fontSize: '14px',
            color: '#64748b',
            marginBottom: '16px'
          }}>
            Join thousands of professionals already using InlinkAI
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '20px',
            flexWrap: 'wrap' as const
          }}>
            {['⭐⭐⭐⭐⭐', '🚀 Fast', '🔒 Secure', '💡 Smart'].map((badge, index) => (
              <span
                key={index}
                style={{
                  fontSize: '12px',
                  color: '#64748b',
                  backgroundColor: '#ffffff',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: '1px solid #e2e8f0'
                }}
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        borderTop: '1px solid #e2e8f0',
        padding: '20px',
        textAlign: 'center' as const,
        backgroundColor: '#f8fafc'
      }}>
        <p style={{
          fontSize: '12px',
          color: '#64748b',
          margin: '0 0 8px 0'
        }}>
          © 2024 InlinkAI. All rights reserved.
        </p>
        <p style={{
          fontSize: '12px',
          color: '#64748b',
          margin: '0 0 8px 0'
        }}>
          You received this email because you're subscribed to InlinkAI updates at{' '}
          <span style={{ color: '#7c3aed' }}>{userEmail}</span>
        </p>
        <div style={{ marginTop: '12px' }}>
          <a
            href="#"
            style={{
              fontSize: '12px',
              color: '#64748b',
              textDecoration: 'underline',
              marginRight: '16px'
            }}
          >
            Update preferences
          </a>
          <a
            href="#"
            style={{
              fontSize: '12px',
              color: '#64748b',
              textDecoration: 'underline'
            }}
          >
            Unsubscribe
          </a>
        </div>
      </div>
    </div>
  );
}
