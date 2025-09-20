'use client';

import { useSession, signOut } from '@/lib/auth-client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import { clearOnboardingData } from '@/lib/onboarding-utils';

export function Navigation() {
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      clearOnboardingData(); // Clear onboarding data on logout
      router.push('/'); // Redirect to home page after logout
    } catch (error) {
      console.error('Sign-out error:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link href="/" className="logo">
          <img src="/images/logo.svg" alt="InlinkAI" />
          InlinkAI
        </Link>

        {/* Desktop navigation - hidden on mobile */}
        <div className="nav-center desktop-only">
          <ul className="nav-links">
            <li><Link href="/features">Features</Link></li>
            <li><Link href="/#how-it-works">How It Works</Link></li>
            <li><Link href="/#pricing">Pricing</Link></li>
            <li><Link href="/#about">About</Link></li>
          </ul>
        </div>

        <div className="nav-actions">
          {/* Desktop actions - hidden on mobile */}
          <div className="desktop-actions desktop-only">
            {session?.user ? (
              <>
                <Link href="/dashboard" className="cta-button dashboard-button">
                  Dashboard
                  <i className="fas fa-chart-line" aria-hidden="true"></i>
                </Link>
                
              </>
            ) : (
              <Link href="/login" className="cta-button login-button">
                Get Started
                <i className="fas fa-rocket" aria-hidden="true"></i>
              </Link>
            )}

            <div className="theme-toggle-container">
              <input 
                type="checkbox" 
                id="themeToggle" 
                className="theme-toggle-input"
                checked={theme === 'dark'}
                onChange={toggleTheme}
              />
              <label htmlFor="themeToggle" className="theme-toggle-label">
                <div className="theme-toggle-slider">
                  <i className="theme-toggle-icon sun fas fa-sun"></i>
                  <i className="theme-toggle-icon moon fas fa-moon"></i>
                </div>
              </label>
            </div>
          </div>

          {/* Mobile hamburger menu button */}
          <button 
            className="mobile-menu-toggle mobile-only"
            id="mobileMenuToggle"
            onClick={toggleMobileMenu}
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
          >
            <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-menu-overlay" 
          onClick={toggleMobileMenu}
          aria-hidden="true"
        />
      )}

      <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`} id="mobileMenu">
        <ul className="mobile-nav-links">
          <li><Link href="/features" onClick={toggleMobileMenu}>Features</Link></li>
          <li><Link href="/#how-it-works" onClick={toggleMobileMenu}>How It Works</Link></li>
          <li><Link href="/#pricing" onClick={toggleMobileMenu}>Pricing</Link></li>
          <li><Link href="/#about" onClick={toggleMobileMenu}>About</Link></li>
        </ul>

        <div className="mobile-theme-toggle">
          <div className="mobile-theme-toggle-container">
            <span className="mobile-theme-label">
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
            <div className="mobile-theme-toggle-wrapper">
              <input 
                type="checkbox" 
                id="mobileThemeToggle" 
                className="theme-toggle-input"
                checked={theme === 'dark'}
                onChange={toggleTheme}
              />
              <label htmlFor="mobileThemeToggle" className="theme-toggle-label mobile">
                <div className="theme-toggle-slider mobile">
                  <i className="theme-toggle-icon sun fas fa-sun"></i>
                  <i className="theme-toggle-icon moon fas fa-moon"></i>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="mobile-cta">
          {session?.user ? (
            <>
              <Link href="/dashboard" className="cta-button dashboard-button" onClick={toggleMobileMenu}>
                Dashboard
                <i className="fas fa-chart-line" aria-hidden="true"></i>
              </Link>
              
            </>
          ) : (
            <Link href="/login" className="cta-button login-button" onClick={toggleMobileMenu}>
              Get Started
              <i className="fas fa-rocket" aria-hidden="true"></i>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
