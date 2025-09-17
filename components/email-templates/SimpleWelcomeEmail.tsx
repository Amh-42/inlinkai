import * as React from 'react';

interface SimpleWelcomeEmailProps {
  firstName?: string;
  userEmail: string;
  customMessage?: string;
}

export function SimpleWelcomeEmail({ firstName, userEmail, customMessage }: SimpleWelcomeEmailProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Welcome to InlinkAI</title>
      </head>
      <body style={{
        margin: '0',
        padding: '0',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        lineHeight: '1.6',
        color: '#333333',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          backgroundColor: '#ffffff'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #0084ff 0%, #44bcf0 100%)',
            padding: '40px 20px',
            textAlign: 'center'
          }}>
            <h1 style={{
              color: '#ffffff',
              fontSize: '32px',
              fontWeight: '700',
              margin: '0',
              letterSpacing: '-0.02em'
            }}>
              Welcome to InlinkAI! 🚀
            </h1>
            <p style={{
              color: '#ffffff',
              fontSize: '18px',
              margin: '10px 0 0 0',
              opacity: '0.9'
            }}>
              Transform your LinkedIn presence with AI
            </p>
          </div>

          {/* Content */}
          <div style={{ padding: '40px 20px' }}>
            <h2 style={{
              color: '#333333',
              fontSize: '24px',
              fontWeight: '600',
              marginBottom: '20px',
              letterSpacing: '-0.01em'
            }}>
              Hello {firstName || 'there'}! 👋
            </h2>

            {customMessage ? (
              <div style={{
                fontSize: '16px',
                marginBottom: '30px',
                lineHeight: '1.6',
                whiteSpace: 'pre-line' // Preserve line breaks in custom message
              }}>
                {customMessage}
              </div>
            ) : (
              <>
                <p style={{
                  fontSize: '16px',
                  marginBottom: '20px',
                  lineHeight: '1.6'
                }}>
                  Thank you for joining InlinkAI! We're excited to help you supercharge your LinkedIn presence with the power of AI.
                </p>

                <p style={{
                  fontSize: '16px',
                  marginBottom: '30px',
                  lineHeight: '1.6'
                }}>
                  Here's what you can do with InlinkAI:
                </p>
              </>
            )}

            {/* Features List - only show when not using custom message */}
            {!customMessage && (
            <div style={{ marginBottom: '30px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: '16px',
                padding: '12px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px'
              }}>
                <span style={{
                  fontSize: '24px',
                  marginRight: '12px'
                }}>
                  🎯
                </span>
                <div>
                  <h4 style={{
                    margin: '0 0 4px 0',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1e293b'
                  }}>
                    AI-Powered Content Creation
                  </h4>
                  <p style={{
                    margin: '0',
                    fontSize: '14px',
                    color: '#64748b'
                  }}>
                    Generate engaging posts and articles
                  </p>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: '16px',
                padding: '12px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px'
              }}>
                <span style={{
                  fontSize: '24px',
                  marginRight: '12px'
                }}>
                  📊
                </span>
                <div>
                  <h4 style={{
                    margin: '0 0 4px 0',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1e293b'
                  }}>
                    Analytics & Insights
                  </h4>
                  <p style={{
                    margin: '0',
                    fontSize: '14px',
                    color: '#64748b'
                  }}>
                    Track your LinkedIn performance
                  </p>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: '16px',
                padding: '12px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px'
              }}>
                <span style={{
                  fontSize: '24px',
                  marginRight: '12px'
                }}>
                  🤝
                </span>
                <div>
                  <h4 style={{
                    margin: '0 0 4px 0',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1e293b'
                  }}>
                    Smart Networking
                  </h4>
                  <p style={{
                    margin: '0',
                    fontSize: '14px',
                    color: '#64748b'
                  }}>
                    Connect with the right prospects
                  </p>
                </div>
              </div>
            </div>
            )}

            {/* CTA Button */}
            <div style={{ textAlign: 'center', margin: '40px 0' }}>
              <a
                href="https://inlinkai.vercel.app/dashboard"
                style={{
                  display: 'inline-block',
                  background: 'linear-gradient(135deg, #0084ff 0%, #44bcf0 100%)',
                  color: '#ffffff',
                  textDecoration: 'none',
                  padding: '16px 32px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                Get Started Now →
              </a>
            </div>

            <p style={{
              fontSize: '14px',
              color: '#64748b',
              textAlign: 'center',
              marginTop: '30px'
            }}>
              Need help? Reply to this email or contact our support team.
            </p>
          </div>

          {/* Footer */}
          <div style={{
            borderTop: '1px solid #e2e8f0',
            padding: '20px',
            textAlign: 'center',
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
              margin: '0'
            }}>
              You received this email because you signed up for InlinkAI at{' '}
              <span style={{ color: '#0084ff' }}>{userEmail}</span>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
