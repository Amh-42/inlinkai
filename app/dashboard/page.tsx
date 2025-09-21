'use client';

import { useSession, signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTheme } from '../components/ThemeProvider';
import { syncOnboardingStatus, clearOnboardingData } from '@/lib/onboarding-utils';
import { isAdmin } from '@/lib/admin-utils';
import { sendWelcomeEmailToUser, shouldSendWelcomeEmail, markWelcomeEmailSent, hasWelcomeEmailBeenSent } from '@/lib/welcome-email-utils';
import VapiWidget from '../components/VapiWidget';

// Get Noticed Section Component
function GetNoticedSection({ linkedinUsername, setActiveSection }: { linkedinUsername: string, setActiveSection: (section: string) => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<any>(null);

  const handleOptimizeProfile = async () => {
    if (!linkedinUsername.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/get-noticed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: linkedinUsername.trim() })
      });
      
      const result = await response.json();
      if (result.success) {
        setOptimizationResult(result.data);
      }
    } catch (error) {
      console.error('Error optimizing profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--text-primary)', fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>Get Noticed</h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Optimize your LinkedIn profile with AI-powered recommendations</p>
      </div>

      {linkedinUsername ? (
        <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '12px', marginBottom: '2rem' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Optimize Your Profile</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            Analyzing LinkedIn profile: <strong>linkedin.com/in/{linkedinUsername}</strong>
          </p>
          <button
            onClick={handleOptimizeProfile}
            disabled={isLoading}
            className="cta-button"
            style={{ minWidth: '150px' }}
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Analyzing...
              </>
            ) : (
              <>
                <i className="fas fa-magic"></i>
                Optimize Profile
              </>
            )}
          </button>
        </div>
      ) : (
        <div style={{ 
          background: 'var(--bg-secondary)', 
          padding: '2rem', 
          borderRadius: '12px', 
          marginBottom: '2rem',
          textAlign: 'center',
          border: '2px dashed var(--border-color)'
        }}>
          <i className="fab fa-linkedin" style={{ fontSize: '3rem', color: '#0077B5', marginBottom: '1rem' }}></i>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>LinkedIn Username Required</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Configure your LinkedIn username in settings to optimize your profile with AI-powered recommendations.
          </p>
          <button 
            onClick={() => setActiveSection('settings')}
            className="cta-button"
          >
            <i className="fas fa-cog"></i>
            Go to Settings
          </button>
        </div>
      )}

      {optimizationResult && (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px' }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Optimized Headline</h3>
            <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
              <p style={{ color: 'var(--text-primary)', margin: 0, fontWeight: 500 }}>
                {optimizationResult.optimizedProfile.optimizedHeadline}
              </p>
            </div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px' }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Optimized About Section</h3>
            <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
              <p style={{ color: 'var(--text-primary)', margin: 0, whiteSpace: 'pre-line' }}>
                {optimizationResult.optimizedProfile.optimizedAbout}
              </p>
            </div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px' }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Recommendations</h3>
            <ul style={{ color: 'var(--text-primary)', paddingLeft: '1.5rem' }}>
              {optimizationResult.optimizedProfile.recommendations.map((rec: string, index: number) => (
                <li key={index} style={{ marginBottom: '0.5rem' }}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

// Stay Relevant Section Component
function StayRelevantSection() {
  const [sources, setSources] = useState(['']);
  const [isLoading, setIsLoading] = useState(false);
  const [contentResult, setContentResult] = useState<any>(null);

  const addSource = () => setSources([...sources, '']);
  const updateSource = (index: number, value: string) => {
    const newSources = [...sources];
    newSources[index] = value;
    setSources(newSources);
  };
  const removeSource = (index: number) => setSources(sources.filter((_, i) => i !== index));

  const handleGenerateContent = async () => {
    const validSources = sources.filter(s => s.trim());
    if (validSources.length === 0) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/stay-relevant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sources: validSources })
      });
      
      const result = await response.json();
      if (result.success) {
        setContentResult(result.data);
      }
    } catch (error) {
      console.error('Error generating content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--text-primary)', fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>Stay Relevant</h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Create engaging LinkedIn content from trending news and articles</p>
      </div>

      <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '12px', marginBottom: '2rem' }}>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Add News Sources</h3>
        {sources.map((source, index) => (
          <div key={index} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <input
              type="url"
              value={source}
              onChange={(e) => updateSource(index, e.target.value)}
              placeholder="https://example.com/article"
              style={{
                flex: 1,
                padding: '0.75rem',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)'
              }}
            />
            {sources.length > 1 && (
              <button
                onClick={() => removeSource(index)}
                style={{
                  padding: '0.75rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                <i className="fas fa-trash"></i>
              </button>
            )}
          </div>
        ))}
        
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button onClick={addSource} className="cta-button secondary-button">
            <i className="fas fa-plus"></i>
            Add Source
          </button>
          <button
            onClick={handleGenerateContent}
            disabled={isLoading || sources.every(s => !s.trim())}
            className="cta-button"
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Generating...
              </>
            ) : (
              <>
                <i className="fas fa-magic"></i>
                Generate Content
              </>
            )}
          </button>
        </div>
      </div>

      {contentResult && (
        <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Generated LinkedIn Post</h3>
          <div style={{ background: 'var(--bg-primary)', padding: '1.5rem', borderRadius: '8px', marginBottom: '1rem' }}>
            <p style={{ color: 'var(--text-primary)', margin: '0 0 1rem 0', whiteSpace: 'pre-line' }}>
              {contentResult.generatedContent.post}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              {contentResult.generatedContent.hashtags.map((tag: string, index: number) => (
                <span key={index} style={{ 
                  background: 'var(--accent-primary)', 
                  color: 'white', 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '12px', 
                  fontSize: '0.875rem' 
                }}>
                  {tag}
                </span>
              ))}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontStyle: 'italic', margin: 0 }}>
              {contentResult.generatedContent.callToAction}
            </p>
          </div>
          <button className="cta-button" style={{ width: '100%' }}>
            <i className="fas fa-copy"></i>
            Copy to Clipboard
          </button>
        </div>
      )}
    </div>
  );
}

// Be Chosen Section Component
function BeChosenSection({ linkedinUsername, setActiveSection }: { linkedinUsername: string, setActiveSection: (section: string) => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [crmResult, setCrmResult] = useState<any>(null);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [practiceAssistant, setPracticeAssistant] = useState<{assistantId: string, contactData: any} | null>(null);
  const [creatingAssistantFor, setCreatingAssistantFor] = useState<string | null>(null);

  const handleBuildCRM = async () => {
    if (!linkedinUsername.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/be-chosen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: linkedinUsername.trim() })
      });
      
      const result = await response.json();
      if (result.success) {
        setCrmResult(result.data);
      }
    } catch (error) {
      console.error('Error building CRM:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePracticeCall = async (contact: any) => {
    setCreatingAssistantFor(contact.name);
    try {
      const response = await fetch('/api/vapi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'create_assistant',
          contactData: contact
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setPracticeAssistant({
          assistantId: result.data.assistantId,
          contactData: contact
        });
        console.log('✅ Practice assistant created:', result.data.assistantId);
      } else {
        console.error('❌ Failed to create assistant:', result.error);
        alert('Failed to create practice assistant. Please try again.');
      }
    } catch (error) {
      console.error('Error creating practice assistant:', error);
      alert('Error creating practice assistant. Please try again.');
    } finally {
      setCreatingAssistantFor(null);
    }
  };

  const handleCallEnd = () => {
    setPracticeAssistant(null);
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--text-primary)', fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>Be Chosen</h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Build your CRM from LinkedIn engagement and practice cold calls</p>
      </div>

      {linkedinUsername ? (
        <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '12px', marginBottom: '2rem' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Build Your CRM</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            Using LinkedIn profile: <strong>linkedin.com/in/{linkedinUsername}</strong>
          </p>
          <button
            onClick={handleBuildCRM}
            disabled={isLoading}
            className="cta-button"
            style={{ minWidth: '150px' }}
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Building CRM...
              </>
            ) : (
              <>
                <i className="fas fa-users"></i>
                Build CRM
              </>
            )}
          </button>
        </div>
      ) : (
        <div style={{ 
          background: 'var(--bg-secondary)', 
          padding: '2rem', 
          borderRadius: '12px', 
          marginBottom: '2rem',
          textAlign: 'center',
          border: '2px dashed var(--border-color)'
        }}>
          <i className="fab fa-linkedin" style={{ fontSize: '3rem', color: '#0077B5', marginBottom: '1rem' }}></i>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>LinkedIn Username Required</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Configure your LinkedIn username in settings to build your CRM from engagement data.
          </p>
          <button 
            onClick={() => setActiveSection('settings')}
            className="cta-button"
          >
            <i className="fas fa-cog"></i>
            Go to Settings
          </button>
        </div>
      )}

      {crmResult && (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px' }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Your CRM ({crmResult.totalContacts} contacts)
            </h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {crmResult.topContacts.slice(0, 5).map((contact: any, index: number) => (
                <div key={index} style={{ 
                  background: 'var(--bg-primary)', 
                  padding: '1rem', 
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{contact.name}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{contact.title}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                      Engagement Score: {contact.score}
                    </div>
                  </div>
                   <button
                     onClick={() => handlePracticeCall(contact)}
                     disabled={creatingAssistantFor === contact.name}
                     className="cta-button secondary-button"
                     style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                   >
                     {creatingAssistantFor === contact.name ? (
                       <>
                         <i className="fas fa-spinner fa-spin"></i>
                         Creating...
                       </>
                     ) : (
                       <>
                         <i className="fas fa-phone"></i>
                         Practice Call
                       </>
                     )}
                   </button>
                </div>
              ))}
            </div>
          </div>

          {crmResult.outreachMessages && (
            <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px' }}>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Personalized Outreach Messages</h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {crmResult.outreachMessages.slice(0, 3).map((message: any, index: number) => (
                  <div key={index} style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px' }}>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 500, marginBottom: '0.5rem' }}>
                      To: {message.contact.name}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                      Subject: {message.subject}
                    </div>
                    <p style={{ color: 'var(--text-primary)', fontSize: '0.875rem', whiteSpace: 'pre-line', margin: 0 }}>
                      {message.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
           )}
         </div>
       )}

       {/* Voice Practice Widget */}
       {practiceAssistant && (
         <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', marginTop: '1.5rem' }}>
           <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <i className="fas fa-microphone" style={{ color: '#12A594' }}></i>
             Voice Practice Session
           </h3>
           <VapiWidget
             apiKey={process.env.NEXT_PUBLIC_VAPI_API_KEY || ''}
             assistantId={practiceAssistant.assistantId}
             contactData={practiceAssistant.contactData}
             onCallEnd={handleCallEnd}
           />
         </div>
       )}
     </div>
   );
 }

export default function Dashboard() {
  const { data: session, isPending } = useSession();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  
  // Debug session state
  console.log('🔍 Dashboard render - Session debug:', {
    isPending,
    hasSession: !!session,
    hasUser: !!session?.user,
    userId: session?.user?.id,
    userEmail: session?.user?.email,
    sessionKeys: session ? Object.keys(session) : [],
    fullSession: session,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
    isIncognito: typeof window !== 'undefined' ? 'unknown' : 'server'
  });
  
  // Check if this is actually a real session or some kind of fallback
  if (session && !isPending) {
    console.log('🚨 CRITICAL: Session exists in dashboard!', {
      sessionData: JSON.stringify(session, null, 2),
      cookies: typeof document !== 'undefined' ? document.cookie : 'no-document',
      localStorage: typeof localStorage !== 'undefined' ? Object.keys(localStorage) : 'no-localStorage'
    });
  }
  const [activeSection, setActiveSection] = useState('overview');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [overviewData, setOverviewData] = useState<any>(null);
  const [isLoadingOverview, setIsLoadingOverview] = useState(false);
  const [recentActivity, setRecentActivity] = useState<any>(null);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);
  const [linkedinUsername, setLinkedinUsername] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  
  // Cache management
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [lastActivityFetchTime, setLastActivityFetchTime] = useState<number>(0);
  const [lastUsername, setLastUsername] = useState<string>('');
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  // Helper function to format change indicators with colors
  const formatChange = (change: number | undefined, suffix = '%') => {
    if (!change && change !== 0) return null;
    
    const isPositive = change > 0;
    const isNegative = change < 0;
    const color = isPositive ? '#10b981' : isNegative ? '#ef4444' : 'var(--text-secondary)';
    const icon = isPositive ? '↗' : isNegative ? '↘' : '';
    
    return (
      <span style={{ color, fontWeight: 500 }}>
        {icon} {isPositive ? '+' : ''}{change}{suffix}
      </span>
    );
  };

  // Fetch overview data with caching
  const fetchOverviewData = async (forceRefresh = false) => {
    if (isLoadingOverview || !session?.user?.id) return;
    
    const now = Date.now();
    const isCacheValid = (now - lastFetchTime) < CACHE_DURATION;
    const isSameUsername = lastUsername === linkedinUsername;
    
    // Use cached data if valid and username hasn't changed
    if (!forceRefresh && isCacheValid && isSameUsername && overviewData) {
      console.log('📋 Using cached overview data');
      return;
    }
    
    setIsLoadingOverview(true);
    try {
      const response = await fetch(`/api/overview/${session.user.id}`);
      const result = await response.json();
      
      if (result.success) {
        setOverviewData(result.data);
        setLastFetchTime(now);
        setLastUsername(linkedinUsername);
        console.log('✅ Overview data loaded and cached:', result.source);
      } else {
        console.log('❌ Failed to fetch overview data, setting null');
        setOverviewData(null);
      }
    } catch (error) {
      console.error('❌ Error fetching overview data:', error);
      setOverviewData(null);
    } finally {
      setIsLoadingOverview(false);
    }
  };

  // Fetch recent activity data with caching
  const fetchRecentActivity = async (forceRefresh = false) => {
    if (isLoadingActivity || !session?.user?.id) return;
    
    const now = Date.now();
    const isCacheValid = (now - lastActivityFetchTime) < CACHE_DURATION;
    const isSameUsername = lastUsername === linkedinUsername;
    
    // Use cached data if valid and username hasn't changed
    if (!forceRefresh && isCacheValid && isSameUsername && recentActivity) {
      console.log('📋 Using cached recent activity data');
      return;
    }
    
    setIsLoadingActivity(true);
    try {
      const response = await fetch(`/api/recent-activity/${session.user.id}`);
      const result = await response.json();
      
      if (result.success) {
        setRecentActivity(result.data);
        setLastActivityFetchTime(now);
        console.log('✅ Recent activity loaded and cached:', result.source);
      } else {
        console.log('❌ Failed to fetch recent activity, setting null');
        setRecentActivity(null);
      }
    } catch (error) {
      console.error('❌ Error fetching recent activity:', error);
      setRecentActivity(null);
    } finally {
      setIsLoadingActivity(false);
    }
  };

  // Load overview data when component mounts
  useEffect(() => {
    if (session?.user && activeSection === 'overview') {
      fetchOverviewData();
      fetchRecentActivity();
    }
  }, [session, activeSection]);

  useEffect(() => {
    const checkAccessAndRedirect = async () => {
      console.log('🔍 Dashboard: Checking auth status...', { 
        isPending, 
        hasSession: !!session, 
        hasUser: !!session?.user,
        userId: session?.user?.id 
      });
      
      if (!isPending && !session?.user) {
        console.log('❌ Dashboard: No authenticated user, redirecting to login');
        // Force a hard redirect to ensure clean state
        window.location.href = '/login';
        return;
      } 
      
      if (!isPending && session?.user) {
        console.log('✅ Dashboard: User authenticated:', session.user.email);
        
        // Fallback check: send welcome email if this is a new user who hasn't received one
        if (shouldSendWelcomeEmail(session) && !hasWelcomeEmailBeenSent(session.user.id)) {
          console.log('🎉 Dashboard: New user detected, sending welcome email...');
          
          sendWelcomeEmailToUser(
            session.user.id,
            session.user.email!,
            session.user.name
          ).then(() => {
            markWelcomeEmailSent(session.user.id);
          }).catch(error => {
            console.error('❌ Dashboard: Failed to send welcome email:', error);
          });
        }
        
        // Check onboarding status from database
        try {
          const isComplete = await syncOnboardingStatus();
          console.log('🔍 Dashboard: Onboarding status check result:', isComplete);
          
          if (!isComplete) {
            console.log('🔄 Dashboard: Onboarding incomplete, redirecting to onboarding...');
            router.push('/onboarding/role');
            return; // Prevent further execution
          } else {
            console.log('✅ Dashboard: Onboarding complete, user can access dashboard');
          }
        } catch (error) {
          console.error('❌ Dashboard: Error checking onboarding status:', error);
          // On error, don't redirect - let user stay on dashboard
        }
      }
    };

    checkAccessAndRedirect();
  }, [session, isPending, router]);

  // Add dashboard class to body for CSS targeting - moved before any returns
  useEffect(() => {
    // Apply styles immediately
    document.body.classList.add('dashboard-active');
    document.documentElement.classList.add('dashboard-active');
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    
    return () => {
      document.body.classList.remove('dashboard-active');
      document.documentElement.classList.remove('dashboard-active');
    };
  }, []);


  const handleSignOut = async () => {
    try {
      console.log('🚪 Starting logout process...');
      
      // Clear onboarding data first
      clearOnboardingData();
      
      // Clear any cached session data
      if (typeof window !== 'undefined') {
        // Clear all auth-related localStorage
        Object.keys(localStorage).forEach(key => {
          if (key.includes('auth') || key.includes('session') || key.includes('token')) {
            localStorage.removeItem(key);
          }
        });
      }
      
      // Call Better Auth signOut
      await signOut({
        fetchOptions: {
          credentials: 'include',
        }
      });
      
      console.log('✅ Logout successful, redirecting...');
      
      // Force a hard redirect to clear any cached state
      window.location.href = '/';
    } catch (error) {
      console.error('❌ Sign out error:', error);
      // Even if signOut fails, clear local data and redirect
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(true);
    setShowProfileDropdown(false);
  };

  const handleSaveSettings = async () => {
    if (!linkedinUsername.trim()) return;
    
    setIsSavingSettings(true);
    try {
      const response = await fetch('/api/user/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkedinUsername: linkedinUsername.trim() })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ LinkedIn username saved:', result.data.linkedinUsername);
        // Force refresh data after saving username (cache invalidation)
        if (activeSection === 'overview') {
          fetchOverviewData(true); // Force refresh
          fetchRecentActivity(true); // Force refresh
        }
      } else {
        console.error('❌ Error saving settings:', result.error);
      }
      
    } catch (error) {
      console.error('❌ Error saving settings:', error);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Load saved LinkedIn username on component mount
  useEffect(() => {
    const loadUserSettings = async () => {
      if (!session?.user) return;
      
      try {
        const response = await fetch('/api/user/settings');
        const result = await response.json();
        
        if (result.success && result.data.linkedinUsername) {
          setLinkedinUsername(result.data.linkedinUsername);
        }
      } catch (error) {
        console.error('❌ Error loading user settings:', error);
      }
    };
    
    loadUserSettings();
  }, [session]);

  if (isPending) {
    return (
      <div className="loading" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.125rem',
        color: 'var(--text-secondary)',
        gap: '0.5rem'
      }}>
        <i className="fas fa-spinner fa-spin"></i>
        Loading dashboard...
      </div>
    );
  }

  if (!session?.user) {
    return null; // Will redirect to login
  }

  const userInitial = session.user.email?.[0]?.toUpperCase() || session.user.name?.[0]?.toUpperCase() || 'U';
  const userName = session.user.name || session.user.email?.split('@')[0] || 'User';

  return (
    <div className="dashboard-page" style={{ 
      background: 'var(--bg-primary)', 
      minHeight: '100vh', 
      margin: 0, 
      padding: 0
    }}>
      {/* Dashboard Navigation */}
      <nav className="dashboard-navbar" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '70px',
        background: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        zIndex: 1000,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        margin: 0
      }}>
        {/* Logo */}
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <img src="/images/logo.svg" alt="InlinkAI Logo" width="32" height="32" />
          <span style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--text-primary)' }}>InlinkAI</span>
        </a>
        
        {/* Right side actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Theme Toggle */}
          <div className="theme-toggle-container">
            <input 
              type="checkbox" 
              id="dashboardThemeToggle" 
              className="theme-toggle-input"
              checked={theme === 'dark'}
              onChange={toggleTheme}
            />
            <label htmlFor="dashboardThemeToggle" className="theme-toggle-label">
              <div className="theme-toggle-slider">
                <i className="theme-toggle-icon sun fas fa-sun"></i>
                <i className="theme-toggle-icon moon fas fa-moon"></i>
              </div>
            </label>
          </div>
          
          {/* Profile Dropdown */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'none',
                border: 'none',
                padding: '0.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                transition: 'background 0.2s ease'
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg, #0084FF 0%, #0066CC 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.875rem'
              }}>
                {userInitial}
              </div>
              <i className="fas fa-chevron-down" style={{ fontSize: '0.75rem' }}></i>
            </button>
            
            {showProfileDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                minWidth: '200px',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 1001,
                marginTop: '0.5rem'
              }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                    {userName}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                    {session.user.email}
                  </div>
                </div>
                <div style={{ padding: '0.5rem' }}>
                  <button 
                    onClick={() => setActiveSection('settings')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      width: '100%',
                      padding: '0.75rem',
                      background: 'none',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      color: 'var(--text-secondary)',
                      fontSize: '0.875rem',
                      textAlign: 'left',
                      transition: 'background 0.2s ease'
                    }}
                  >
                    <i className="fas fa-cog" style={{ width: '16px' }}></i>
                    Settings
                  </button>
                  <button 
                    onClick={confirmLogout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      width: '100%',
                      padding: '0.75rem',
                      background: 'none',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      color: 'var(--text-secondary)',
                      fontSize: '0.875rem',
                      textAlign: 'left',
                      transition: 'background 0.2s ease'
                    }}
                  >
                    <i className="fas fa-sign-out-alt" style={{ width: '16px' }}></i>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Dashboard Layout */}
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)', marginTop: '70px' }}>
        {/* Sidebar */}
        <aside style={{
          width: '280px',
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-color)',
          padding: '2rem 0',
          position: 'fixed',
          height: 'calc(100vh - 70px)',
          overflowY: 'auto',
          top: '70px'
        }}>
          {/* User Profile Section */}
          <div style={{ padding: '0 1.5rem 2rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #0084FF 0%, #0066CC 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 600,
                fontSize: '1.125rem'
              }}>
                {userInitial}
              </div>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                  {userName}
                  {isAdmin(session?.user?.email) && (
                    <span style={{
                      marginLeft: '0.5rem',
                      fontSize: '0.625rem',
                      backgroundColor: '#10b981',
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Admin
                    </span>
                  )}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Free Trial • 14 days left</div>
              </div>
            </div>
            <button className="cta-button" style={{ width: '100%', fontSize: '0.75rem', padding: '0.5rem' }}>
              <i className="fas fa-crown"></i>
              Upgrade to Pro
            </button>
          </div>

          {/* Navigation Menu */}
          <nav style={{ padding: '1.5rem 0' }}>
            <div style={{ padding: '0 1.5rem', marginBottom: '1rem' }}>
              <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Dashboard</h3>
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {[
                { id: 'overview', icon: 'home', label: 'Overview' },
                { id: 'profile', icon: 'eye', label: 'Get Noticed' },
                { id: 'content', icon: 'bullseye', label: 'Stay Relevant' },
                { id: 'prospects', icon: 'handshake', label: 'Be Chosen' }
              ].map(item => (
                <li key={item.id}>
                  <button 
                    onClick={() => setActiveSection(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      width: '100%',
                      padding: '0.75rem 1.5rem',
                      background: activeSection === item.id ? 'var(--accent-primary)' : 'none',
                      color: activeSection === item.id ? 'white' : 'var(--text-secondary)',
                      border: 'none',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <i className={`fas fa-${item.icon}`} style={{ width: '16px' }}></i>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>

            <div style={{ padding: '0 1.5rem', margin: '1.5rem 0 1rem 0' }}>
              <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Analytics</h3>
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {[
                { id: 'analytics', icon: 'chart-line', label: 'Performance' },
                { id: 'insights', icon: 'lightbulb', label: 'Insights' }
              ].map(item => (
                <li key={item.id}>
                  <button 
                    onClick={() => setActiveSection(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      width: '100%',
                      padding: '0.75rem 1.5rem',
                      background: activeSection === item.id ? 'var(--accent-primary)' : 'none',
                      color: activeSection === item.id ? 'white' : 'var(--text-secondary)',
                      border: 'none',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <i className={`fas fa-${item.icon}`} style={{ width: '16px' }}></i>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>

            {/* Admin-only Marketing Section */}
            {isAdmin(session?.user?.email) && (
              <>
                <div style={{ padding: '0 1.5rem', margin: '1.5rem 0 1rem 0' }}>
                  <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Marketing</h3>
                </div>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  <li>
                    <a 
                      href="/dashboard/emails"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        width: '100%',
                        padding: '0.75rem 1.5rem',
                        background: 'none',
                        color: 'var(--text-secondary)',
                        border: 'none',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        transition: 'all 0.2s ease',
                        cursor: 'pointer'
                      }}
                    >
                      <i className="fas fa-envelope" style={{ width: '16px' }}></i>
                      Email Marketing
                    </a>
                  </li>
                </ul>
              </>
            )}

            <div style={{ padding: '0 1.5rem', margin: '1.5rem 0 1rem 0' }}>
              <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Account</h3>
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              <li>
                <button 
                  onClick={() => setActiveSection('settings')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    width: '100%',
                    padding: '0.75rem 1.5rem',
                    background: activeSection === 'settings' ? 'var(--accent-primary)' : 'none',
                    color: activeSection === 'settings' ? 'white' : 'var(--text-secondary)',
                    border: 'none',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <i className="fas fa-cog" style={{ width: '16px' }}></i>
                  Settings
                </button>
              </li>
              <li>
                <button 
                  onClick={confirmLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    width: '100%',
                    padding: '0.75rem 1.5rem',
                    background: 'none',
                    color: 'var(--text-secondary)',
                    border: 'none',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <i className="fas fa-sign-out-alt" style={{ width: '16px' }}></i>
                  Logout
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main style={{ flex: 1, marginLeft: '280px', padding: '2rem', maxWidth: '100%' }}>
          <div style={{ maxWidth: '100%', width: '100%' }}>
            {/* Overview Section */}
            {activeSection === 'overview' && (
              <div>
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <h1 style={{ color: 'var(--text-primary)', fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Dashboard Overview</h1>
                    {overviewData && !isLoadingOverview && (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        background: 'var(--bg-secondary)',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px'
                      }}>
                        <i className="fas fa-clock" style={{ fontSize: '0.625rem' }}></i>
                        {(() => {
                          const now = Date.now();
                          const timeSinceLastFetch = Math.floor((now - lastFetchTime) / 1000 / 60);
                          return timeSinceLastFetch === 0 ? 'Just updated' : `Updated ${timeSinceLastFetch}m ago`;
                        })()}
                        <button
                          onClick={() => {
                            fetchOverviewData(true);
                            fetchRecentActivity(true);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            padding: '0.25rem',
                            borderRadius: '4px',
                            fontSize: '0.625rem',
                            marginLeft: '0.5rem'
                          }}
                          title="Refresh data"
                        >
                          <i className="fas fa-sync-alt"></i>
                        </button>
                      </div>
                    )}
                  </div>
                  <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Track your LinkedIn growth and AI-powered results</p>
                </div>
                
                {/* Quick Stats */}
                {isLoadingOverview ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid #0084FF' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                          <div style={{ width: '24px', height: '24px', background: 'var(--border-color)', borderRadius: '4px' }}></div>
                          <div style={{ width: '120px', height: '20px', background: 'var(--border-color)', borderRadius: '4px' }}></div>
                        </div>
                        <div style={{ width: '80px', height: '32px', background: 'var(--border-color)', borderRadius: '4px', marginBottom: '0.5rem' }}></div>
                        <div style={{ width: '100px', height: '14px', background: 'var(--border-color)', borderRadius: '4px' }}></div>
                      </div>
                    ))}
                  </div>
                ) : overviewData ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                    <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid #0084FF' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <i className="fas fa-eye" style={{ fontSize: '1.5rem', color: '#0084FF' }}></i>
                        <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Profile Viewers</h3>
                      </div>
                      <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                        {overviewData.profile_viewers?.toLocaleString() || '0'}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        LinkedIn profile views
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid #0084FF' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <i className="fas fa-users" style={{ fontSize: '1.5rem', color: '#0084FF' }}></i>
                        <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Followers</h3>
                      </div>
                      <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                        {overviewData.followers?.toLocaleString() || '0'}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {overviewData.followers_change ? (
                          <>LinkedIn followers {formatChange(overviewData.followers_change)}</>
                        ) : (
                          'LinkedIn followers'
                        )}
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid #0084FF' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <i className="fas fa-chart-line" style={{ fontSize: '1.5rem', color: '#0084FF' }}></i>
                        <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Post Impressions</h3>
                      </div>
                      <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                        {overviewData.post_impressions?.toLocaleString() || '0'}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {overviewData.post_impressions_change ? (
                          <>Post reach {formatChange(overviewData.post_impressions_change)}</>
                        ) : (
                          'Post reach'
                        )}
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid #0084FF' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <i className="fas fa-search" style={{ fontSize: '1.5rem', color: '#0084FF' }}></i>
                        <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Search Appearances</h3>
                      </div>
                      <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                        {overviewData.search_appearances?.toLocaleString() || '0'}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        LinkedIn search results
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                    <div style={{ 
                      background: 'var(--bg-secondary)', 
                      padding: '2rem', 
                      borderRadius: '12px', 
                      textAlign: 'center',
                      gridColumn: '1 / -1',
                      border: '2px dashed var(--border-color)'
                    }}>
                      <i className="fas fa-chart-line" style={{ fontSize: '3rem', color: 'var(--text-muted)', marginBottom: '1rem' }}></i>
                      <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No Analytics Data Available</h3>
                      <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                        Connect your LinkedIn account in settings to view your analytics data.
                      </p>
                      <button 
                        onClick={() => setActiveSection('settings')}
                        className="cta-button" 
                        style={{ marginTop: '1rem' }}
                      >
                        <i className="fas fa-cog"></i>
                        Go to Settings
                      </button>
                    </div>
                  </div>
                )}

                {/* Recent Activity */}
                {isLoadingActivity ? (
                  <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', marginBottom: '3rem' }}>
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <i className="fas fa-clock" style={{ color: '#0084FF' }}></i>
                      Recent Activity
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {[1, 2, 3].map(i => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: '8px' }}>
                          <div style={{ width: '16px', height: '16px', background: 'var(--border-color)', borderRadius: '50%' }}></div>
                          <div style={{ flex: 1 }}>
                            <div style={{ width: '200px', height: '16px', background: 'var(--border-color)', borderRadius: '4px', marginBottom: '0.25rem' }}></div>
                            <div style={{ width: '120px', height: '12px', background: 'var(--border-color)', borderRadius: '4px' }}></div>
                          </div>
                          <div style={{ width: '60px', height: '12px', background: 'var(--border-color)', borderRadius: '4px' }}></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : recentActivity?.posts && recentActivity.posts.length > 0 ? (
                  <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', marginBottom: '3rem' }}>
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <i className="fas fa-clock" style={{ color: '#0084FF' }}></i>
                      Recent Activity
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {recentActivity.posts.slice(0, 3).map((post: any, index: number) => {
                        // Get the most recent activity from this post (likes or comments)
                        const recentLikes = post.likes?.slice(0, 2) || [];
                        const recentComments = post.comments?.slice(0, 2) || [];
                        const allActivity = [
                          ...recentLikes.map((like: any) => ({
                            type: 'like',
                            user: like.user,
                            date: like.created_at,
                            post: post
                          })),
                          ...recentComments.map((comment: any) => ({
                            type: 'comment',
                            user: comment.user,
                            date: comment.created_at,
                            post: post,
                            content: comment.content
                          }))
                        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                        return allActivity.slice(0, 1).map((activity: any, actIndex: number) => (
                          <div key={`${index}-${actIndex}`} style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '1rem', 
                            padding: '0.75rem', 
                            background: 'var(--bg-primary)', 
                            borderRadius: '8px' 
                          }}>
                            <i className={`fas fa-${activity.type === 'like' ? 'heart' : 'comment'}`} 
                               style={{ color: activity.type === 'like' ? '#e91e63' : '#0084FF', width: '16px' }}></i>
                            <div style={{ flex: 1 }}>
                              <div style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 500 }}>
                                {activity.user.name} {activity.type === 'like' ? 'liked' : 'commented on'} your post
                              </div>
                              <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                "{activity.post.content.substring(0, 60)}..."
                              </div>
                              {activity.type === 'comment' && activity.content && (
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontStyle: 'italic', marginTop: '0.25rem' }}>
                                  "{activity.content.substring(0, 80)}..."
                                </div>
                              )}
                            </div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                              {new Date(activity.date).toLocaleDateString()}
                            </div>
                          </div>
                        ));
                      }).flat()}
                    </div>
                  </div>
                ) : linkedinUsername ? (
                  <div style={{ 
                    background: 'var(--bg-secondary)', 
                    padding: '2rem', 
                    borderRadius: '12px', 
                    marginBottom: '3rem',
                    textAlign: 'center',
                    border: '2px dashed var(--border-color)'
                  }}>
                    <i className="fas fa-clock" style={{ fontSize: '2rem', color: 'var(--text-muted)', marginBottom: '1rem' }}></i>
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No Recent Activity</h3>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                      No recent LinkedIn activity found for your profile.
                    </p>
                  </div>
                ) : null}

                {/* Action Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '2rem', transition: 'transform 0.3s ease' }}>
                    <div style={{ marginBottom: '1rem' }}>
                      <i className="fas fa-eye" style={{ fontSize: '2rem', color: '#0084FF', marginBottom: '1rem' }}></i>
                      <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Get Noticed</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Optimize your LinkedIn profile to stand out and attract the right opportunities.</p>
                    </div>
                    <button 
                      onClick={() => setActiveSection('profile')}
                      className="cta-button" 
                      style={{ width: '100%' }}
                    >
                      Start Optimization
                      <i className="fas fa-arrow-right"></i>
                    </button>
                  </div>

                  <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '2rem', transition: 'transform 0.3s ease' }}>
                    <div style={{ marginBottom: '1rem' }}>
                      <i className="fas fa-bullseye" style={{ fontSize: '2rem', color: '#0084FF', marginBottom: '1rem' }}></i>
                      <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Stay Relevant</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Create engaging content with AI to maintain visibility and thought leadership.</p>
                    </div>
                    <button 
                      onClick={() => setActiveSection('content')}
                      className="cta-button secondary-button" 
                      style={{ width: '100%' }}
                    >
                      Create Content
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>

                  <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '2rem', transition: 'transform 0.3s ease' }}>
                    <div style={{ marginBottom: '1rem' }}>
                      <i className="fas fa-handshake" style={{ fontSize: '2rem', color: '#0084FF', marginBottom: '1rem' }}></i>
                      <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Be Chosen</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Find and connect with prospects who match your ideal customer profile.</p>
                    </div>
                    <button 
                      onClick={() => setActiveSection('prospects')}
                      className="cta-button secondary-button" 
                      style={{ width: '100%' }}
                    >
                      Find Prospects
                      <i className="fas fa-search"></i>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Get Noticed Section */}
            {activeSection === 'profile' && (
              <GetNoticedSection linkedinUsername={linkedinUsername} setActiveSection={setActiveSection} />
            )}

            {/* Stay Relevant Section */}
            {activeSection === 'content' && (
              <StayRelevantSection />
            )}

            {/* Be Chosen Section */}
            {activeSection === 'prospects' && (
              <BeChosenSection linkedinUsername={linkedinUsername} setActiveSection={setActiveSection} />
            )}

            {/* Settings Section */}
            {activeSection === 'settings' && (
              <div>
                <div style={{ marginBottom: '2rem' }}>
                  <h1 style={{ color: 'var(--text-primary)', fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>Account Settings</h1>
                  <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Configure your LinkedIn integration and account preferences</p>
                </div>

                <div style={{ display: 'grid', gap: '2rem', maxWidth: '600px' }}>
                  {/* LinkedIn Integration */}
                  <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '12px' }}>
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <i className="fab fa-linkedin" style={{ color: '#0077B5' }}></i>
                      LinkedIn Integration
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                      Enter your LinkedIn username to enable analytics and AI-powered features. This is the username that appears in your LinkedIn profile URL (e.g., linkedin.com/in/your-username).
                    </p>
                    
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                        LinkedIn Username
                      </label>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1, position: 'relative' }}>
                          <span style={{ 
                            position: 'absolute', 
                            left: '0.75rem', 
                            top: '50%', 
                            transform: 'translateY(-50%)', 
                            color: 'var(--text-secondary)', 
                            fontSize: '0.875rem',
                            pointerEvents: 'none'
                          }}>
                            linkedin.com/in/
                          </span>
                          <input
                            type="text"
                            value={linkedinUsername}
                            onChange={(e) => setLinkedinUsername(e.target.value)}
                            placeholder="your-username"
                            style={{
                              width: '100%',
                              padding: '0.75rem 0.75rem 0.75rem 140px',
                              border: '1px solid var(--border-color)',
                              borderRadius: '8px',
                              background: 'var(--bg-primary)',
                              color: 'var(--text-primary)',
                              fontSize: '0.875rem'
                            }}
                          />
                        </div>
                        <button
                          onClick={handleSaveSettings}
                          disabled={isSavingSettings || !linkedinUsername.trim()}
                          className="cta-button"
                          style={{ minWidth: '120px' }}
                        >
                          {isSavingSettings ? (
                            <>
                              <i className="fas fa-spinner fa-spin"></i>
                              Saving...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-save"></i>
                              Save
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {linkedinUsername && (
                      <div style={{ 
                        background: 'var(--bg-primary)', 
                        padding: '1rem', 
                        borderRadius: '8px', 
                        border: '1px solid var(--border-color)',
                        marginTop: '1rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <i className="fas fa-check-circle" style={{ color: '#10b981' }}></i>
                          <span style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 500 }}>
                            LinkedIn Profile Connected
                          </span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: 0 }}>
                          Profile URL: <a href={`https://linkedin.com/in/${linkedinUsername}`} target="_blank" rel="noopener noreferrer" style={{ color: '#0077B5' }}>
                            linkedin.com/in/{linkedinUsername}
                          </a>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Account Information */}
                  <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '12px' }}>
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <i className="fas fa-user" style={{ color: '#0084FF' }}></i>
                      Account Information
                    </h3>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                          Email Address
                        </label>
                        <div style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                          {session?.user?.email}
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                          Account Type
                        </label>
                        <div style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                          {isAdmin(session?.user?.email) ? 'Administrator' : 'Free Trial'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Other sections */}
            {!['overview', 'profile', 'content', 'prospects', 'settings'].includes(activeSection) && (
              <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <div style={{ fontSize: '3rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  <i className={`fas fa-${activeSection === 'analytics' ? 'chart-line' : activeSection === 'insights' ? 'lightbulb' : 'cog'}`}></i>
                </div>
                <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
                  {activeSection === 'analytics' && 'Performance Analytics'}
                  {activeSection === 'insights' && 'AI Insights'}
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                  This section is coming soon. We're building amazing features to help you dominate LinkedIn.
                </p>
                <button className="cta-button secondary-button">
                  <i className="fas fa-bell"></i>
                  Get Notified When Ready
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Click outside to close dropdowns */}
      {showProfileDropdown && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setShowProfileDropdown(false)}
        />
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1002
        }}>
          <div style={{
            background: 'var(--bg-primary)',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: '#ff6b6b',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto'
              }}>
                <i className="fas fa-sign-out-alt" style={{ fontSize: '1.5rem', color: 'white' }}></i>
              </div>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: 600 }}>
                Confirm Logout
              </h3>
              <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                Are you sure you want to sign out? You'll need to log in again to access your dashboard.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                  minWidth: '100px'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={handleSignOut}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#ff6b6b',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                  minWidth: '100px'
                }}
              >
                <i className="fas fa-sign-out-alt"></i>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
