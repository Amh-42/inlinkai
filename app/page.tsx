'use client';

import Link from 'next/link';
import { useTheme } from './components/ThemeProvider';
import { useEffect, useState } from 'react';

export default function Home() {
  const { theme } = useTheme();
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const getVideoSource = () => {
    return theme === 'dark' ? '/dark.webm' : '/hero.webm';
  };

  useEffect(() => {
    // Handle smooth video transition on theme change
    const videoElement = document.querySelector('.hero-video') as HTMLVideoElement;
    if (videoElement) {
      setIsTransitioning(true);
      
      // Fade out current video
      videoElement.style.opacity = '0';
      
      setTimeout(() => {
        // Change video source
        const sourceElement = videoElement.querySelector('source');
        if (sourceElement) {
          sourceElement.src = getVideoSource();
          videoElement.load(); // Reload video with new source
        }
        
        // Fade in new video
        videoElement.style.opacity = '1';
        setIsTransitioning(false);
      }, 300); // 300ms fade duration
    }
  }, [theme]);
  return (
    <>
      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="hero-container">
          <div className="hero-content">
            <div className="compliance-badge">
              <i className="fab fa-linkedin"></i>
              AI-Powered LinkedIn Growth
            </div>
            <h1 className="hero-title">Get Noticed. Stay Relevant. <span className="hero-subtitle">Be Chosen.</span></h1>
            <p className="hero-description">
              Transform your LinkedIn presence with cutting-edge AI. 
            </p>
            
            <div className="hero-actions">
              <Link href="/login" className="cta-button login-button" aria-label="Start Free Trial">
                Start Free Trial
                <i className="fas fa-rocket" aria-hidden="true"></i>
              </Link>
              <Link href="/features" className="cta-button secondary-button" aria-label="View Features">
                View Features
                <i className="fas fa-play" aria-hidden="true"></i>
              </Link>
            </div>
          </div>
          <video 
            className={`hero-video ${isTransitioning ? 'transitioning' : ''}`}
            autoPlay 
            muted 
            loop 
            playsInline
            key={getVideoSource()} // Force re-render on theme change
          >
            <source src={getVideoSource()} type="video/webm" />
            Your browser does not support the video tag.
          </video>
        </div>
        
        {/* Hero Stats - Full Width */}
        <div className="hero-stats-wrapper">
          <div className="hero-stats">
            <div className="hero-stat-item">
              <div className="hero-stat-number">3x</div>
              <div className="hero-stat-label">More Profile Views</div>
            </div>
            <div className="hero-stat-item">
              <div className="hero-stat-number">5x</div>
              <div className="hero-stat-label">Higher Engagement</div>
            </div>
            <div className="hero-stat-item">
              <div className="hero-stat-number">200%</div>
              <div className="hero-stat-label">More Connections</div>
            </div>
            <div className="hero-stat-item">
              <div className="hero-stat-number">80%</div>
              <div className="hero-stat-label">Time Saved</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="benefits" id="how-it-works">
        <div className="benefits-container">
          <div className="section-header">
            <div className="section-tag">
              <i className="fas fa-cogs" aria-hidden="true"></i>
              HOW IT WORKS
            </div>
            <h2 className="section-title">Three Steps to LinkedIn Success</h2>
            <p className="section-subtitle">Get noticed, stay relevant, and be chosen</p>
          </div>
          <div className="benefits-grid">
            <div className="benefit-card loading">
              <div className="card-image">
                <div className="card-image-placeholder">
                  <i className="fas fa-eye"></i>
                </div>
              </div>
              <div className="card-content">
                <h3>Get Noticed</h3>
                <p>AI optimizes your LinkedIn profile</p>
                <div className="card-footer">
                  <span className="read-more">Learn More</span>
                  <i className="fas fa-arrow-right card-arrow"></i>
                </div>
              </div>
            </div>
            <div className="benefit-card loading">
              <div className="card-image">
                <div className="card-image-placeholder">
                  <i className="fas fa-bullseye"></i>
                </div>
              </div>
              <div className="card-content">
                <h3>Stay Relevant</h3>
                <p>Create engaging, topic-specific content</p>
                <div className="card-footer">
                  <span className="read-more">Learn More</span>
                  <i className="fas fa-arrow-right card-arrow"></i>
                </div>
              </div>
            </div>
            <div className="benefit-card loading">
              <div className="card-image">
                <div className="card-image-placeholder">
                  <i className="fas fa-handshake"></i>
                </div>
              </div>
              <div className="card-content">
                <h3>Be Chosen</h3>
                <p>Connect with prospects who engage with your content</p>
                <div className="card-footer">
                  <span className="read-more">Learn More</span>
                  <i className="fas fa-arrow-right card-arrow"></i>
                </div>
              </div>
            </div>
            <div className="benefit-card loading">
              <div className="card-image">
                <div className="card-image-placeholder">
                  <i className="fas fa-robot"></i>
                </div>
              </div>
              <div className="card-content">
                <h3>AI-Powered</h3>
                <p>State-of-the-art artificial intelligence</p>
                <div className="card-footer">
                  <span className="read-more">Learn More</span>
                  <i className="fas fa-arrow-right card-arrow"></i>
                </div>
              </div>
            </div>
            <div className="benefit-card loading">
              <div className="card-image">
                <div className="card-image-placeholder">
                  <i className="fas fa-chart-line"></i>
                </div>
              </div>
              <div className="card-content">
                <h3>Data-Driven</h3>
                <p>Track your performance with detailed analytics. </p>
                <div className="card-footer">
                  <span className="read-more">Learn More</span>
                  <i className="fas fa-arrow-right card-arrow"></i>
                </div>
              </div>
            </div>
            <div className="benefit-card loading">
              <div className="card-image">
                <div className="card-image-placeholder">
                  <i className="fas fa-clock"></i>
                </div>
              </div>
              <div className="card-content">
                <h3>Time-Saving</h3>
                <p>Automate your LinkedIn strategy.</p>
                <div className="card-footer">
                  <span className="read-more">Learn More</span>
                  <i className="fas fa-arrow-right card-arrow"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about" id="about">
        <div className="about-container">
          <div className="about-content">
            <div className="section-tag">
              <i className="fas fa-rocket" aria-hidden="true"></i>
              ABOUT InlinkAI
            </div>
            <h2>Why InlinkAI?</h2>
            <p>Independent professionals struggle to stand out on LinkedIn. You have the skills, but your profile gets lost in the noise. Your content doesn't reach the right people. You're missing opportunities because prospects can't find you.</p>
            <p>InlinkAI solves this with <strong>cutting-edge AI technology</strong> that transforms how you show up on LinkedIn. We help you get noticed by the right people, stay relevant with engaging content, and be chosen by ideal prospects.</p>
            <p>Stop being invisible. Start being chosen. InlinkAI gives you the AI-powered tools that top professionals use to dominate LinkedIn and win more business.</p>
          </div>
          <div className="about-image">
            <div className="team-visual">
              <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' className="team-svg">
                <rect width='400' height='300' fill='var(--bg-secondary)'/>
                <g transform='translate(200,150)'>
                  <circle r='60' fill='var(--accent-primary)' opacity='0.1'/>
                  <circle r='40' fill='var(--accent-primary)' opacity='0.2'/>
                  <circle r='20' fill='var(--accent-primary)'/>
                </g>
                <text x='200' y='280' textAnchor='middle' fill='var(--text-secondary)' fontFamily='Inter' fontSize='14'>InlinkAI Platform</text>
              </svg>
            </div>
          </div>
        </div>
      </section>


      {/* Pricing Section */}
      <section className="pricing" id="pricing">
        <div className="pricing-container">
          <div className="section-header">
            <div className="section-tag">
              <i className="fas fa-tags" aria-hidden="true"></i>
              PRICING
            </div>
            <h2 className="section-title">Choose Your Plan</h2>
            <p className="section-subtitle">Start free, upgrade when ready</p>
          </div>
          <div className="pricing-grid">
            <div className="pricing-card free-card loading">
              <div className="card-image">
                <div className="card-image-placeholder pricing-image">
                  <i className="fas fa-seedling"></i>
                </div>
              </div>
              <div className="card-content">
                <h3>Free Trial</h3>
                <div className="price">
                  <span className="currency">$</span>
                  <span className="amount">0</span>
                  <span className="period">/14 days</span>
                </div>
                <p>Perfect for getting started with AI-powered LinkedIn optimization. Includes profile optimization, content generation, and basic analytics.</p>
                <div className="card-footer">
                  <Link href="/login" className="read-more-link" aria-label="Start Free Trial">
                    <span className="read-more">Start Free Trial</span>
                    <i className="fas fa-arrow-right card-arrow"></i>
                  </Link>
                </div>
              </div>
            </div>

            <div className="pricing-card elite-card loading">
              <div className="pricing-badge">Most Popular</div>
              <div className="card-image">
                <div className="card-image-placeholder pricing-image">
                  <i className="fas fa-crown"></i>
                </div>
              </div>
              <div className="card-content">
                <h3>Pro Plan</h3>
                <div className="price">
                  <span className="currency">$</span>
                  <span className="amount">29</span>
                  <span className="period">/month</span>
                </div>
                <p>Unlock the full power of InlinkAI with unlimited content generation, advanced analytics, automated outreach, and priority support.</p>
                <div className="card-footer">
                  <Link href="/login" className="read-more-link" aria-label="Upgrade to Pro Plan">
                    <span className="read-more">Start Pro Trial</span>
                    <i className="fas fa-arrow-right card-arrow"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="simple-footer">
        <div className="footer-container">
          <div className="footer-content">
            <h3 className="footer-title">Ready to Transform Your LinkedIn?</h3>
            <p className="footer-description">Join thousands of professionals already growing their networks with AI.</p>
          </div>
          <div className="footer-actions">
            <Link href="/login" className="cta-button login-button" aria-label="Start Free Trial">
              Start Free Trial
              <i className="fas fa-rocket" aria-hidden="true"></i>
            </Link>
            <Link href="/login" className="footer-signin" aria-label="Sign In">
              Already have an account? <span>Sign In</span>
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
