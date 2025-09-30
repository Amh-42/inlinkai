import * as React from 'react';
import {
  Html,
  Body,
  Container,
  Head,
  Heading,
  Text,
  Button,
  Section,
  Row,
  Column,
} from '@react-email/components';

interface WelcomeEmailProps {
  firstName?: string;
  userEmail: string;
}

export function WelcomeEmail({ firstName, userEmail }: WelcomeEmailProps) {
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
        background: 'linear-gradient(135deg, #0084ff 0%, #44bcf0 100%)',
        padding: '40px 20px',
        textAlign: 'center' as const
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

        {/* Features List */}
        <div style={{ marginBottom: '30px' }}>
          {[
            { icon: '🎯', title: 'AI-Powered Content Creation', desc: 'Generate engaging posts and articles' },
            { icon: '📊', title: 'Analytics & Insights', desc: 'Track your LinkedIn performance' },
            { icon: '🤝', title: 'Smart Networking', desc: 'Connect with the right prospects' },
            { icon: '🚀', title: 'Profile Optimization', desc: 'Enhance your professional brand' }
          ].map((feature, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'flex-start',
              marginBottom: '16px',
              padding: '12px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <span style={{
                fontSize: '24px',
                marginRight: '12px',
                flexShrink: 0
              }}>
                {feature.icon}
              </span>
              <div>
                <h4 style={{
                  margin: '0 0 4px 0',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1e293b'
                }}>
                  {feature.title}
                </h4>
                <p style={{
                  margin: '0',
                  fontSize: '14px',
                  color: '#64748b'
                }}>
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div style={{ textAlign: 'center' as const, margin: '40px 0' }}>
          <a
            href="https://inlinkai.com/dashboard"
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #0084ff 0%, #44bcf0 100%)',
              color: '#ffffff',
              textDecoration: 'none',
              padding: '16px 32px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              boxShadow: '0 4px 14px 0 rgba(0, 132, 255, 0.25)'
            }}
          >
            Get Started Now →
          </a>
        </div>

        <p style={{
          fontSize: '14px',
          color: '#64748b',
          textAlign: 'center' as const,
          marginTop: '30px'
        }}>
          Need help? Reply to this email or visit our{' '}
          <a href="#" style={{ color: '#0084ff', textDecoration: 'none' }}>
            support center
          </a>
        </p>
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
          margin: '0'
        }}>
          You received this email because you signed up for InlinkAI at{' '}
          <span style={{ color: '#0084ff' }}>{userEmail}</span>
        </p>
      </div>
    </div>
  );
}
