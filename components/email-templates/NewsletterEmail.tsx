import * as React from 'react';

interface NewsletterEmailProps {
  firstName?: string;
  userEmail: string;
  subject: string;
  content: {
    title: string;
    excerpt: string;
    articles: Array<{
      title: string;
      summary: string;
      readTime: string;
      category: string;
    }>;
    tips: Array<{
      title: string;
      description: string;
    }>;
    customMessage?: string;
  };
}

export function NewsletterEmail({ firstName, userEmail, subject, content }: NewsletterEmailProps) {
  return (
    <div style={{
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      lineHeight: '1.6',
      color: '#333333',
      maxWidth: '600px',
      margin: '0 auto',
      backgroundColor: '#ffffff'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        padding: '30px 20px',
        textAlign: 'center' as const
      }}>
        <h1 style={{
          color: '#ffffff',
          fontSize: '28px',
          fontWeight: '700',
          margin: '0 0 8px 0',
          letterSpacing: '-0.02em'
        }}>
          InlinkAI Weekly 📈
        </h1>
        <p style={{
          color: '#94a3b8',
          fontSize: '16px',
          margin: '0',
          fontWeight: '400'
        }}>
          {subject}
        </p>
      </div>

      {/* Greeting */}
      <div style={{ padding: '30px 20px 20px 20px' }}>
        <h2 style={{
          color: '#1e293b',
          fontSize: '22px',
          fontWeight: '600',
          marginBottom: '16px',
          letterSpacing: '-0.01em'
        }}>
          Hi {firstName || 'there'}! 👋
        </h2>

        {content.customMessage ? (
          <div style={{
            fontSize: '16px',
            marginBottom: '30px',
            lineHeight: '1.6',
            color: '#475569',
            whiteSpace: 'pre-line'
          }}>
            {content.customMessage}
          </div>
        ) : (
          <p style={{
            fontSize: '16px',
            marginBottom: '30px',
            lineHeight: '1.6',
            color: '#475569'
          }}>
            {content.excerpt}
          </p>
        )}
      </div>

      {/* Featured Articles */}
      <div style={{ padding: '0 20px 30px 20px' }}>
        <h3 style={{
          color: '#1e293b',
          fontSize: '20px',
          fontWeight: '600',
          marginBottom: '20px',
          borderBottom: '2px solid #0084ff',
          paddingBottom: '8px'
        }}>
          📚 This Week's Insights
        </h3>

        {content.articles.map((article, index) => (
          <div key={index} style={{
            marginBottom: '20px',
            padding: '20px',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            borderLeft: '4px solid #0084ff'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '8px'
            }}>
              <span style={{
                fontSize: '12px',
                fontWeight: '600',
                color: '#0084ff',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.5px'
              }}>
                {article.category}
              </span>
              <span style={{
                fontSize: '12px',
                color: '#64748b',
                backgroundColor: '#ffffff',
                padding: '4px 8px',
                borderRadius: '4px'
              }}>
                {article.readTime}
              </span>
            </div>
            <h4 style={{
              margin: '0 0 8px 0',
              fontSize: '18px',
              fontWeight: '600',
              color: '#1e293b',
              lineHeight: '1.4'
            }}>
              {article.title}
            </h4>
            <p style={{
              margin: '0',
              fontSize: '14px',
              color: '#64748b',
              lineHeight: '1.5'
            }}>
              {article.summary}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Tips */}
      <div style={{ padding: '0 20px 30px 20px' }}>
        <h3 style={{
          color: '#1e293b',
          fontSize: '20px',
          fontWeight: '600',
          marginBottom: '20px',
          borderBottom: '2px solid #10b981',
          paddingBottom: '8px'
        }}>
          💡 Quick Tips
        </h3>

        {content.tips.map((tip, index) => (
          <div key={index} style={{
            marginBottom: '16px',
            padding: '16px',
            backgroundColor: '#f0fdf4',
            borderRadius: '8px',
            border: '1px solid #bbf7d0',
            borderLeft: '4px solid #10b981'
          }}>
            <h5 style={{
              margin: '0 0 6px 0',
              fontSize: '16px',
              fontWeight: '600',
              color: '#1e293b'
            }}>
              {tip.title}
            </h5>
            <p style={{
              margin: '0',
              fontSize: '14px',
              color: '#374151',
              lineHeight: '1.5'
            }}>
              {tip.description}
            </p>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div style={{
        padding: '30px 20px',
        backgroundColor: '#f8fafc',
        textAlign: 'center' as const,
        borderTop: '1px solid #e2e8f0'
      }}>
        <h3 style={{
          color: '#1e293b',
          fontSize: '20px',
          fontWeight: '600',
          marginBottom: '12px'
        }}>
          Ready to level up your LinkedIn game?
        </h3>
        <p style={{
          fontSize: '16px',
          color: '#64748b',
          marginBottom: '24px'
        }}>
          Join thousands of professionals already using InlinkAI
        </p>
        <a
          href="http://localhost:3000/dashboard"
          style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #0084ff 0%, #44bcf0 100%)',
            color: '#ffffff',
            textDecoration: 'none',
            padding: '14px 28px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            boxShadow: '0 4px 14px 0 rgba(0, 132, 255, 0.25)'
          }}
        >
          Open Dashboard →
        </a>
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
          You received this email because you subscribed to our newsletter at{' '}
          <span style={{ color: '#0084ff' }}>{userEmail}</span>
        </p>
        <a
          href="#"
          style={{
            fontSize: '12px',
            color: '#64748b',
            textDecoration: 'underline'
          }}
        >
          Unsubscribe from marketing emails
        </a>
      </div>
    </div>
  );
}
