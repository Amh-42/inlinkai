'use client';

import { useCustomer, CheckoutDialog } from "autumn-js/react";
import { useRouter } from "next/navigation";

export default function PricingPage() {
  const { checkout } = useCustomer();
  const router = useRouter();

  const handleUpgrade = async () => {
    try {
      await checkout({
        productId: "pro",
        dialog: CheckoutDialog,
        successUrl: `${window.location.origin}/dashboard?upgraded=true`,
      });
    } catch (error) {
      console.error('Checkout error:', error);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      backgroundImage: `
        linear-gradient(rgba(0, 132, 255, 0.08) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 132, 255, 0.08) 1px, transparent 1px)
      `,
      backgroundSize: '16px 16px',
      padding: '140px 1rem 3rem 1rem'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ 
            color: 'var(--text-primary)', 
            fontSize: '2.5rem', 
            fontWeight: 700, 
            margin: '0 0 1rem 0' 
          }}>
            Choose Your Plan
          </h1>
          <p style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '1.25rem',
            margin: 0 
          }}>
            Unlock the full potential of your AI workflow
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '2rem', 
          maxWidth: '800px', 
          margin: '0 auto' 
        }}>
          {/* Free Plan */}
          <div style={{
            background: 'var(--bg-primary)',
            border: '2px solid var(--border-color)',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: 'var(--shadow-lg)',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ 
                color: 'var(--text-primary)', 
                fontSize: '1.5rem', 
                fontWeight: 700, 
                margin: '0 0 0.5rem 0' 
              }}>Free</h3>
              <div style={{ 
                color: 'var(--text-primary)', 
                fontSize: '2.5rem', 
                fontWeight: 700, 
                margin: '0 0 1rem 0' 
              }}>
                $0<span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-secondary)' }}>/month</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Perfect for getting started</p>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0' }}>
              <li style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <svg style={{ width: '20px', height: '20px', color: 'var(--success-color)', marginRight: '0.75rem' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span style={{ color: 'var(--text-primary)' }}>5 AI messages per month</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <svg style={{ width: '20px', height: '20px', color: 'var(--success-color)', marginRight: '0.75rem' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span style={{ color: 'var(--text-primary)' }}>Basic content generation</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <svg style={{ width: '20px', height: '20px', color: 'var(--success-color)', marginRight: '0.75rem' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span style={{ color: 'var(--text-primary)' }}>Community support</span>
              </li>
            </ul>

            <button 
              onClick={() => router.push('/dashboard')}
              style={{
                width: '100%',
                padding: '0.75rem 1.5rem',
                border: '2px solid var(--border-color)',
                background: 'transparent',
                color: 'var(--text-primary)',
                fontWeight: 600,
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Current Plan
            </button>
          </div>

          {/* Pro Plan */}
          <div style={{
            background: 'var(--bg-primary)',
            border: '2px solid var(--accent-primary)',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: 'var(--shadow-xl)',
            position: 'relative',
            transition: 'all 0.3s ease'
          }}>
            <div style={{
              position: 'absolute',
              top: '-12px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'var(--accent-gradient)',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              fontSize: '0.875rem',
              fontWeight: 600
            }}>
              Most Popular
            </div>

            <div style={{ textAlign: 'center' }}>
              <h3 style={{ 
                color: 'var(--text-primary)', 
                fontSize: '1.5rem', 
                fontWeight: 700, 
                margin: '0 0 0.5rem 0' 
              }}>Pro</h3>
              <div style={{ 
                color: 'var(--text-primary)', 
                fontSize: '2.5rem', 
                fontWeight: 700, 
                margin: '0 0 1rem 0' 
              }}>
                $20<span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-secondary)' }}>/month</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>For power users and professionals</p>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0' }}>
              <li style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <svg style={{ width: '20px', height: '20px', color: 'var(--success-color)', marginRight: '0.75rem' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span style={{ color: 'var(--text-primary)' }}>100 AI messages per month</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <svg style={{ width: '20px', height: '20px', color: 'var(--success-color)', marginRight: '0.75rem' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span style={{ color: 'var(--text-primary)' }}>Advanced content generation</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <svg style={{ width: '20px', height: '20px', color: 'var(--success-color)', marginRight: '0.75rem' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span style={{ color: 'var(--text-primary)' }}>Priority support</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <svg style={{ width: '20px', height: '20px', color: 'var(--success-color)', marginRight: '0.75rem' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span style={{ color: 'var(--text-primary)' }}>Analytics dashboard</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <svg style={{ width: '20px', height: '20px', color: 'var(--success-color)', marginRight: '0.75rem' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span style={{ color: 'var(--text-primary)' }}>API access</span>
              </li>
            </ul>

            <button 
              onClick={handleUpgrade}
              style={{
                width: '100%',
                padding: '0.75rem 1.5rem',
                border: 'none',
                background: 'var(--accent-gradient)',
                color: 'white',
                fontWeight: 600,
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(0, 132, 255, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 132, 255, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 132, 255, 0.3)';
              }}
            >
              Upgrade to Pro
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Need help choosing? <a href="#" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>Contact our team</a>
          </p>
          <button 
            onClick={() => router.push('/dashboard')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '0.875rem',
              transition: 'color 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
