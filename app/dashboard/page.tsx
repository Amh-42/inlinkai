'use client';

import { useSession, signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTheme } from '../components/ThemeProvider';
import { syncOnboardingStatus, clearOnboardingData } from '@/lib/onboarding-utils';
import { isAdmin } from '@/lib/admin-utils';
import { sendWelcomeEmailToUser, shouldSendWelcomeEmail, markWelcomeEmailSent, hasWelcomeEmailBeenSent } from '@/lib/welcome-email-utils';

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
                  <h1 style={{ color: 'var(--text-primary)', fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>Dashboard Overview</h1>
                  <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Track your LinkedIn growth and AI-powered results</p>
                </div>
                
                {/* Quick Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                  <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid #0084FF' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                      <i className="fas fa-eye" style={{ fontSize: '1.5rem', color: '#0084FF' }}></i>
                      <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Profile Views</h3>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>1,247</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>+23% from last week</div>
                  </div>

                  <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid #0084FF' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                      <i className="fas fa-users" style={{ fontSize: '1.5rem', color: '#0084FF' }}></i>
                      <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Connections</h3>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>892</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>+15% this month</div>
                  </div>

                  <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid #0084FF' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                      <i className="fas fa-heart" style={{ fontSize: '1.5rem', color: '#0084FF' }}></i>
                      <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Engagement</h3>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>94%</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Above average</div>
                  </div>

                  <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid #0084FF' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                      <i className="fas fa-star" style={{ fontSize: '1.5rem', color: '#0084FF' }}></i>
                      <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>AI Score</h3>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>8.7</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Profile optimized</div>
                  </div>
                </div>

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

            {/* Other sections */}
            {activeSection !== 'overview' && (
              <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <div style={{ fontSize: '3rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  <i className={`fas fa-${activeSection === 'profile' ? 'eye' : activeSection === 'content' ? 'bullseye' : activeSection === 'prospects' ? 'handshake' : activeSection === 'analytics' ? 'chart-line' : activeSection === 'insights' ? 'lightbulb' : 'cog'}`}></i>
                </div>
                <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
                  {activeSection === 'profile' && 'Get Noticed'}
                  {activeSection === 'content' && 'Stay Relevant'}
                  {activeSection === 'prospects' && 'Be Chosen'}
                  {activeSection === 'analytics' && 'Performance Analytics'}
                  {activeSection === 'insights' && 'AI Insights'}
                  {activeSection === 'settings' && 'Account Settings'}
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
