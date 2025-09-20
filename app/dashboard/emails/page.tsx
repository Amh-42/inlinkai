'use client';

import { useSession } from '@/lib/auth-client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/components/ThemeProvider';
import { Navigation } from '@/app/components/Navigation';
import { isAdmin } from '@/lib/admin-utils';

interface EmailStats {
  optedInUsers: number;
  totalUsers: number;
  optInRate: number;
}

interface EmailResult {
  success: boolean;
  sent: number;
  failed: number;
  total: number;
  errors?: Array<{ email: string; error: string }>;
}

export default function EmailsPage() {
  const { data: session, isPending } = useSession();
  const { theme } = useTheme();
  const router = useRouter();
  
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sendProgress, setSendProgress] = useState<{current: number; total: number} | null>(null);
  const [emailType, setEmailType] = useState('welcome');
  const [recipients, setRecipients] = useState('test');
  const [emailBody, setEmailBody] = useState('');
  const [emailData, setEmailData] = useState({
    subject: '',
    content: {
      title: '',
      excerpt: '',
      articles: [
        {
          title: 'How AI is Transforming LinkedIn Marketing',
          summary: 'Discover the latest trends in AI-powered LinkedIn strategies that top professionals use.',
          readTime: '5 min read',
          category: 'AI Insights'
        }
      ],
      tips: [
        {
          title: 'Optimize Your LinkedIn Headline',
          description: 'Use industry-specific keywords that your target audience actively searches for.'
        }
      ]
    },
    announcement: {
      title: 'New Feature Released!',
      subtitle: 'Enhanced AI capabilities for better LinkedIn performance',
      description: 'We\'re excited to introduce our latest feature that will supercharge your LinkedIn presence with advanced AI capabilities.',
      features: [
        {
          icon: '🤖',
          title: 'Advanced AI Engine',
          description: 'More intelligent content suggestions based on your industry and audience preferences.'
        },
        {
          icon: '📊',
          title: 'Enhanced Analytics',
          description: 'Deeper insights into your LinkedIn performance with actionable recommendations.'
        }
      ],
      ctaText: 'Try New Features',
      ctaUrl: 'https://inlinkai.vercel.app/dashboard'
    }
  });
  const [lastResult, setLastResult] = useState<EmailResult | null>(null);

  // Default email body content for each template
  const getDefaultEmailBody = (templateType: string) => {
    switch (templateType) {
      case 'welcome':
        return `Welcome to InlinkAI!

We're thrilled to have you join our community of professionals who are transforming their LinkedIn presence with AI-powered tools.

Here's what you can expect from InlinkAI:
✨ AI-powered content suggestions
📊 Advanced analytics and insights  
🎯 Targeted networking opportunities
🚀 Professional growth acceleration

Ready to get started? Click the button below to access your dashboard and begin your LinkedIn transformation journey.

Best regards,
The InlinkAI Team

---
Note: This message will be displayed in our beautiful HTML email template with proper styling, header, footer, and call-to-action buttons.`;

      case 'newsletter':
        return `This week, we're bringing you the latest trends, insights, and tips to supercharge your LinkedIn presence with AI technology.

Featured Articles This Week:
📖 How AI is Transforming LinkedIn Marketing
📊 Advanced Analytics for Professional Growth  
🎯 Networking Strategies That Actually Work

Pro Tips from Our Experts:
💡 Optimize your LinkedIn headline with industry-specific keywords
📱 Use AI-powered content scheduling for maximum engagement
🔍 Leverage analytics to understand your audience better

Stay ahead of the curve and make your LinkedIn profile work harder for you!

Keep growing,
The InlinkAI Team

---
Note: This content will be displayed in our professional newsletter template with featured articles section, tips, and styled layout.`;

      case 'announcement':
        return `We're thrilled to announce our latest feature release that will supercharge your LinkedIn presence with enhanced AI capabilities.

🚀 What's New:
• Advanced AI Engine: More intelligent content suggestions based on your industry
• Enhanced Analytics: Deeper insights with actionable recommendations  
• Smart Networking: AI-powered connection recommendations
• Content Optimization: Real-time suggestions for better engagement

These new features are designed to help you achieve better results, save time, and grow your professional network more effectively.

Ready to experience the future of LinkedIn marketing? Click the button below to explore the new features and take your LinkedIn game to the next level.

Best regards,
The InlinkAI Team

---
Note: This announcement will be displayed in our premium announcement template with feature showcase, gradient headers, and prominent call-to-action.`;

      default:
        return '';
    }
  };

  // Update email body when template type changes
  useEffect(() => {
    const defaultBody = getDefaultEmailBody(emailType);
    setEmailBody(defaultBody);
    
    // Update default subject based on template type
    const defaultSubjects = {
      welcome: 'Welcome to InlinkAI - Let\'s Transform Your LinkedIn Presence!',
      newsletter: 'InlinkAI Weekly - Latest LinkedIn AI Insights & Tips',
      announcement: 'Exciting New Features Just Launched at InlinkAI!'
    };
    
    setEmailData(prev => ({
      ...prev,
      subject: defaultSubjects[emailType as keyof typeof defaultSubjects] || ''
    }));
  }, [emailType]);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login');
      return;
    }
    
    // Check if user is admin
    if (!isPending && session?.user) {
      if (!isAdmin(session.user.email)) {
        // Return 404 for non-admin users
        router.push('/404');
        return;
      }
      
      fetchEmailStats();
    }
  }, [session, isPending, router]);

  const fetchEmailStats = async () => {
    try {
      const response = await fetch('/api/send-email');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching email stats:', error);
    }
  };

  const handleSendEmail = async () => {
    if (!emailData.subject.trim()) {
      alert('Please enter an email subject');
      return;
    }
    
    if (!emailBody.trim()) {
      alert('Please enter email content');
      return;
    }

    setIsLoading(true);
    setLastResult(null);
    setSendProgress(null);

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailType,
          recipients,
          emailData: {
            ...emailData,
            customBody: emailBody.trim() // Include the custom email body
          }
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        setLastResult(result);
        // Refresh stats after sending
        fetchEmailStats();
      } else {
        const errorMessage = result.message ? `${result.error}: ${result.message}` : result.error;
        alert(`Error: ${errorMessage}`);
        setLastResult({
          success: false,
          sent: 0,
          failed: 1,
          total: 1,
          errors: [{ email: 'N/A', error: errorMessage }]
        });
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again.');
    } finally {
      setIsLoading(false);
      setSendProgress(null);
    }
  };

  const getEmailTypeSubjects = () => {
    switch (emailType) {
      case 'welcome':
        return 'Welcome to InlinkAI! 🚀';
      case 'newsletter':
        return 'InlinkAI Weekly - LinkedIn Insights & Tips';
      case 'announcement':
        return 'Exciting New Feature in InlinkAI! 🎉';
      default:
        return '';
    }
  };

  useEffect(() => {
    if (!emailData.subject || emailData.subject === getEmailTypeSubjects()) {
      setEmailData(prev => ({
        ...prev,
        subject: getEmailTypeSubjects()
      }));
    }
  }, [emailType]);

  if (isPending) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: 'var(--bg-primary)'
      }}>
        <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <i className="fas fa-spinner fa-spin"></i>
          Loading...
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <>
      {/* Homepage Navigation */}
      <Navigation />
      
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        padding: '2rem',
        paddingTop: 'calc(2rem + 120px)' // Account for homepage navbar (120px total height)
      }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: 'var(--text-primary)',
            margin: '0 0 0.5rem 0'
          }}>
            📧 Email Marketing
          </h1>
          <p style={{
            fontSize: '1.125rem',
            color: 'var(--text-secondary)',
            margin: 0
          }}>
            Send emails to your opted-in users
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              background: 'var(--bg-secondary)',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid var(--border-color)'
            }}>
              <h3 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: 'var(--accent-primary)',
                margin: '0 0 0.5rem 0'
              }}>
                {stats.optedInUsers}
              </h3>
              <p style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                margin: 0
              }}>
                Opted-in Users
              </p>
            </div>

            <div style={{
              background: 'var(--bg-secondary)',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid var(--border-color)'
            }}>
              <h3 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: 'var(--text-primary)',
                margin: '0 0 0.5rem 0'
              }}>
                {stats.totalUsers}
              </h3>
              <p style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                margin: 0
              }}>
                Total Users
              </p>
            </div>

            <div style={{
              background: 'var(--bg-secondary)',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid var(--border-color)'
            }}>
              <h3 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#10b981',
                margin: '0 0 0.5rem 0'
              }}>
                {stats.optInRate}%
              </h3>
              <p style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                margin: 0
              }}>
                Opt-in Rate
              </p>
            </div>
          </div>
        )}

        {/* Email Composer */}
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          padding: '2rem'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: 'var(--text-primary)',
            margin: '0 0 1rem 0'
          }}>
            Compose Email
          </h2>
          <p style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            margin: '0 0 1.5rem 0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <i className="fas fa-lightbulb"></i>
            Select a template type to auto-fill the email content, then customize as needed.
          </p>

          {/* Email Type Selection */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: '0.5rem'
            }}>
              Email Type
            </label>
            <select
              value={emailType}
              onChange={(e) => setEmailType(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem'
              }}
            >
              <option value="welcome">Welcome Email - Blue gradient header, features list, CTA button</option>
              <option value="newsletter">Newsletter - Dark header, articles section, tips layout</option>
              <option value="announcement">Announcement - Purple gradient, feature showcase, badges</option>
            </select>
            
            {/* Template Preview Info */}
            <div style={{
              marginTop: '0.75rem',
              padding: '1rem',
              background: 'var(--accent-secondary)',
              border: '1px solid var(--accent-primary)',
              borderRadius: '8px',
              fontSize: '0.8rem',
              color: 'var(--text-primary)'
            }}>
              <div style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fas fa-info-circle"></i>
                {emailType === 'welcome' && 'Welcome Email Template'}
                {emailType === 'newsletter' && 'Newsletter Template'}
                {emailType === 'announcement' && 'Announcement Template'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {emailType === 'welcome' && 'Includes: Beautiful blue gradient header, personalized greeting, features showcase with icons, call-to-action button, and professional footer.'}
                {emailType === 'newsletter' && 'Includes: Dark professional header, featured articles section, pro tips layout, styled content blocks, and social links.'}
                {emailType === 'announcement' && 'Includes: Purple gradient header with "New Feature" badge, feature showcase cards, prominent CTA button, and premium styling.'}
              </div>
            </div>
          </div>

          {/* Recipients Selection */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: '0.5rem'
            }}>
              Recipients
            </label>
            <select
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem'
              }}
            >
              <option value="test">Test (Send to me only)</option>
              <option value="all">All opted-in users ({stats?.optedInUsers || 0})</option>
            </select>
          </div>

          {/* Subject Line */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: '0.5rem'
            }}>
              Subject Line
            </label>
            <input
              type="text"
              value={emailData.subject}
              onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem'
              }}
              placeholder="Enter email subject..."
            />
          </div>

          {/* Email Body */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: '0.5rem'
            }}>
              Email Body
              <span style={{ 
                fontSize: '0.75rem', 
                fontWeight: '400', 
                color: 'var(--text-secondary)',
                marginLeft: '0.5rem'
              }}>
                (This text will be inserted into our beautiful HTML template)
              </span>
            </label>
            <textarea
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              rows={12}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                lineHeight: '1.5',
                fontFamily: 'inherit',
                resize: 'vertical',
                minHeight: '200px'
              }}
              placeholder="Enter your email content here..."
            />
            <div style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              marginTop: '0.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span>✨ Your content will include professional HTML styling</span>
                <span>🎨 Template includes: Header, footer, buttons & responsive design</span>
              </div>
              <span>{emailBody.length} characters</span>
            </div>
          </div>

          {/* Send Button */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginTop: '2rem'
          }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <div>{recipients === 'test' ? 'Will send to you only' : `Will send to ${stats?.optedInUsers || 0} opted-in users`}</div>
              {recipients === 'all' && (stats?.optedInUsers || 0) > 1 && (
                <div style={{ 
                  marginTop: '0.5rem',
                  fontSize: '0.75rem',
                  color: 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  <i className="fas fa-clock"></i>
                  Estimated time: ~{Math.ceil((stats?.optedInUsers || 0) * 0.6)}s (600ms delay between emails)
                </div>
              )}
            </div>
            
            <button
              onClick={handleSendEmail}
              disabled={isLoading || !emailData.subject.trim()}
              style={{
                background: isLoading ? 'var(--border-color)' : 'var(--accent-gradient)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {isLoading ? (
                sendProgress ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Sending {sendProgress.current}/{sendProgress.total}...
                  </>
                ) : (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Preparing to send...
                  </>
                )
              ) : (
                <>
                  <i className="fas fa-paper-plane"></i>
                  Send Email
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Progress */}
        {isLoading && sendProgress && (
          <div style={{
            background: '#fef3c7',
            border: '1px solid #fbbf24',
            borderRadius: '12px',
            padding: '1.5rem',
            marginTop: '1.5rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <i className="fas fa-clock" style={{ color: '#d97706', fontSize: '1.25rem' }}></i>
              <h3 style={{
                color: '#92400e',
                fontSize: '1.125rem',
                fontWeight: '600',
                margin: 0
              }}>
                Sending in Progress... ({sendProgress.current}/{sendProgress.total})
              </h3>
            </div>
            
            <div style={{
              background: '#fef9e7',
              borderRadius: '8px',
              height: '8px',
              overflow: 'hidden',
              marginBottom: '0.75rem'
            }}>
              <div style={{
                background: '#d97706',
                height: '100%',
                width: `${(sendProgress.current / sendProgress.total) * 100}%`,
                transition: 'width 0.3s ease'
              }}></div>
            </div>
            
            <p style={{
              color: '#92400e',
              fontSize: '0.875rem',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <i className="fas fa-info-circle"></i>
              We add a 600ms delay between each email to respect rate limits.
            </p>
          </div>
        )}

        {/* Results */}
        {lastResult && (
          <div style={{
            background: lastResult.success ? '#ecfdf5' : '#fef2f2',
            border: `1px solid ${lastResult.success ? '#bbf7d0' : '#fecaca'}`,
            borderRadius: '12px',
            padding: '1.5rem',
            marginTop: '1.5rem'
          }}>
            <h3 style={{
              color: lastResult.success ? '#065f46' : '#991b1b',
              fontSize: '1.125rem',
              fontWeight: '600',
              margin: '0 0 1rem 0'
            }}>
              {lastResult.success ? '✅ Email Sent Successfully!' : '❌ Email Send Failed'}
            </h3>
            
            <div style={{
              color: lastResult.success ? '#047857' : '#dc2626',
              fontSize: '0.875rem'
            }}>
              <p style={{ margin: '0 0 0.5rem 0' }}>
                <strong>Sent:</strong> {lastResult.sent} / {lastResult.total}
              </p>
              {lastResult.failed > 0 && (
                <p style={{ margin: '0 0 0.5rem 0' }}>
                  <strong>Failed:</strong> {lastResult.failed}
                </p>
              )}
              
              {lastResult.errors && lastResult.errors.length > 0 && (
                <details style={{ marginTop: '0.5rem' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: '600' }}>
                    View Errors ({lastResult.errors.length})
                  </summary>
                  <ul style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
                    {lastResult.errors.map((error, index) => (
                      <li key={index} style={{ marginBottom: '0.25rem' }}>
                        <strong>{error.email}:</strong> {error.error}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          </div>
        )}

        {/* Email Preview Info */}
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          padding: '1.5rem',
          marginTop: '1.5rem'
        }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: 'var(--text-primary)',
            margin: '0 0 1rem 0'
          }}>
            📋 Template Info
          </h3>
          
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            {emailType === 'welcome' && (
              <p>Welcome email template with features overview and CTA to dashboard.</p>
            )}
            {emailType === 'newsletter' && (
              <p>Newsletter template with articles, tips, and weekly insights.</p>
            )}
            {emailType === 'announcement' && (
              <p>Product announcement template with features showcase and CTA.</p>
            )}
            
            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #0ea5e9' }}>
              <h4 style={{ color: '#0284c7', margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: '600' }}>
                📝 Setup Instructions:
              </h4>
              <ol style={{ margin: '0', paddingLeft: '1.25rem', fontSize: '0.875rem', color: '#475569' }}>
                <li>Get your Resend API key from <a href="https://resend.com" target="_blank" style={{ color: '#0ea5e9' }}>resend.com</a></li>
                <li>Add <code style={{ background: '#e2e8f0', padding: '2px 4px', borderRadius: '3px' }}>RESEND_API_KEY=your-key-here</code> to your <code>.env</code> file</li>
                <li>Update the "from" email address in the API to your verified domain</li>
                <li>Test with "Send to me only" first</li>
              </ol>
            </div>
            
            <p style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
              <strong>Note:</strong> Emails are personalized with user's first name and email address.
              The system only sends to users who opted in for marketing emails during onboarding.
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
