import Link from 'next/link';

export default function FeaturesPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <div className="compliance-badge">
              <i className="fas fa-star"></i>
              Features Overview
            </div>
            <h1 className="hero-title">Powerful AI Tools for <span className="hero-subtitle">LinkedIn Success</span></h1>
            <p className="hero-description">
              Discover how InlinkAI's cutting-edge features transform your LinkedIn presence, helping you get noticed, stay relevant, and be chosen by ideal prospects.
            </p>
            <div className="hero-actions">
              <Link href="/login" className="cta-button login-button">
                Start Free Trial
                <i className="fas fa-rocket"></i>
              </Link>
              <Link href="/#pricing" className="cta-button secondary-button">
                View Pricing
                <i className="fas fa-tags"></i>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 1: AI Profile Optimization */}
      <section className="feature-section feature-left">
        <div className="feature-container">
          <div className="feature-content">
            <div className="feature-badge">
              <i className="fas fa-user-edit"></i>
              PROFILE OPTIMIZATION
            </div>
            <h2 className="feature-title">AI Profile Optimization</h2>
            <p className="feature-description">
              Transform your LinkedIn profile with AI-powered insights. Our advanced algorithms analyze your current profile and provide personalized recommendations to maximize visibility, engagement, and professional appeal.
            </p>
            <div className="feature-benefits">
              <div className="benefit-item">
                <i className="fas fa-check-circle"></i>
                <span>Headline optimization for maximum impact</span>
              </div>
              <div className="benefit-item">
                <i className="fas fa-check-circle"></i>
                <span>About section enhancement</span>
              </div>
              <div className="benefit-item">
                <i className="fas fa-check-circle"></i>
                <span>Experience section improvements</span>
              </div>
            </div>
          </div>
          <div className="feature-visual">
            <div className="feature-mockup profile-mockup">
              <div className="mockup-header">
                <div className="mockup-avatar"></div>
                <div className="mockup-info">
                  <div className="mockup-name"></div>
                  <div className="mockup-title"></div>
                </div>
              </div>
              <div className="mockup-content">
                <div className="mockup-line"></div>
                <div className="mockup-line short"></div>
                <div className="mockup-line medium"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 2: Smart Content Generation */}
      <section className="feature-section feature-right">
        <div className="feature-container">
          <div className="feature-visual">
            <div className="feature-mockup content-mockup">
              <div className="content-editor">
                <div className="editor-toolbar">
                  <div className="toolbar-btn"></div>
                  <div className="toolbar-btn"></div>
                  <div className="toolbar-btn"></div>
                </div>
                <div className="editor-content">
                  <div className="typing-animation">
                    <span className="typing-text">Creating engaging content...</span>
                    <span className="cursor"></span>
                  </div>
                </div>
              </div>
              <div className="ai-suggestions">
                <div className="suggestion-item">
                  <i className="fas fa-lightbulb"></i>
                  <span>AI Suggestion 1</span>
                </div>
                <div className="suggestion-item">
                  <i className="fas fa-lightbulb"></i>
                  <span>AI Suggestion 2</span>
                </div>
              </div>
            </div>
          </div>
          <div className="feature-content">
            <div className="feature-badge">
              <i className="fas fa-edit"></i>
              CONTENT CREATION
            </div>
            <h2 className="feature-title">Smart Content Generation</h2>
            <p className="feature-description">
              Never run out of engaging content ideas. Our AI understands your industry, audience, and personal brand voice to create compelling LinkedIn posts, articles, and updates that drive engagement and establish thought leadership.
            </p>
            <div className="feature-benefits">
              <div className="benefit-item">
                <i className="fas fa-check-circle"></i>
                <span>Industry-specific content suggestions</span>
              </div>
              <div className="benefit-item">
                <i className="fas fa-check-circle"></i>
                <span>Personal brand voice matching</span>
              </div>
              <div className="benefit-item">
                <i className="fas fa-check-circle"></i>
                <span>Engagement-optimized posts</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 3: Performance Analytics */}
      <section className="feature-section feature-center">
        <div className="feature-container">
          <div className="feature-content-center">
            <div className="feature-badge">
              <i className="fas fa-chart-line"></i>
              ANALYTICS & INSIGHTS
            </div>
            <h2 className="feature-title">Performance Analytics</h2>
            <p className="feature-description">
              Track your LinkedIn success with comprehensive analytics. Monitor profile views, post engagement, connection growth, and conversion metrics to optimize your strategy.
            </p>
          </div>
          <div className="feature-visual-wide">
            <div className="analytics-dashboard">
              <div className="dashboard-header">
                <h3>LinkedIn Performance Dashboard</h3>
              </div>
              <div className="dashboard-metrics">
                <div className="metric-card">
                  <div className="metric-number">847</div>
                  <div className="metric-label">Profile Views</div>
                  <div className="metric-change positive">+23%</div>
                </div>
                <div className="metric-card">
                  <div className="metric-number">156</div>
                  <div className="metric-label">Post Likes</div>
                  <div className="metric-change positive">+45%</div>
                </div>
                <div className="metric-card">
                  <div className="metric-number">23</div>
                  <div className="metric-label">New Connections</div>
                  <div className="metric-change positive">+12%</div>
                </div>
              </div>
              <div className="dashboard-chart">
                <div className="chart-bars">
                  <div className="chart-bar" style={{ height: '60%' }}></div>
                  <div className="chart-bar" style={{ height: '80%' }}></div>
                  <div className="chart-bar" style={{ height: '45%' }}></div>
                  <div className="chart-bar" style={{ height: '90%' }}></div>
                  <div className="chart-bar" style={{ height: '75%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 4: Prospect Targeting */}
      <section className="feature-section feature-diagonal">
        <div className="feature-container">
          <div className="feature-content">
            <div className="feature-badge">
              <i className="fas fa-bullseye"></i>
              SMART TARGETING
            </div>
            <h2 className="feature-title">Prospect Targeting</h2>
            <p className="feature-description">
              Find and connect with your ideal prospects using advanced AI algorithms. Target by industry, role, company size, and engagement patterns to build a high-quality network.
            </p>
            <div className="targeting-filters">
              <div className="filter-tag">Industry: Tech</div>
              <div className="filter-tag">Role: Decision Maker</div>
              <div className="filter-tag">Company: 50-200</div>
              <div className="filter-tag">Active: Last 30 days</div>
            </div>
          </div>
          <div className="feature-visual">
            <div className="prospect-network">
              <div className="network-center">
                <div className="user-avatar main">You</div>
              </div>
              <div className="network-prospects">
                <div className="prospect-node prospect-1">
                  <div className="user-avatar"></div>
                  <div className="connection-line"></div>
                </div>
                <div className="prospect-node prospect-2">
                  <div className="user-avatar"></div>
                  <div className="connection-line"></div>
                </div>
                <div className="prospect-node prospect-3">
                  <div className="user-avatar"></div>
                  <div className="connection-line"></div>
                </div>
                <div className="prospect-node prospect-4">
                  <div className="user-avatar"></div>
                  <div className="connection-line"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 5: Automation Suite */}
      <section className="feature-section feature-timeline">
        <div className="feature-container">
          <div className="feature-content-center">
            <div className="feature-badge">
              <i className="fas fa-robot"></i>
              AUTOMATION SUITE
            </div>
            <h2 className="feature-title">Complete Automation</h2>
            <p className="feature-description">
              Save hours every week with intelligent automation. From content scheduling to engagement and outreach campaigns, let AI handle the routine while you focus on building relationships.
            </p>
          </div>
          <div className="automation-timeline">
            <div className="timeline-item">
              <div className="timeline-icon">
                <i className="fas fa-calendar-alt"></i>
              </div>
              <div className="timeline-content">
                <h4>Content Scheduling</h4>
                <p>Auto-schedule posts for optimal engagement</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-icon">
                <i className="fas fa-comments"></i>
              </div>
              <div className="timeline-content">
                <h4>Smart Engagement</h4>
                <p>Automatically engage with relevant content</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-icon">
                <i className="fas fa-paper-plane"></i>
              </div>
              <div className="timeline-content">
                <h4>Outreach Campaigns</h4>
                <p>Personalized connection requests and follow-ups</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-icon">
                <i className="fas fa-search"></i>
              </div>
              <div className="timeline-content">
                <h4>Lead Research</h4>
                <p>Continuous prospect discovery and analysis</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="about">
        <div className="about-container">
          <div className="about-content">
            <div className="section-tag">
              <i className="fas fa-cogs"></i>
              HOW IT WORKS
            </div>
            <h2>Simple 3-Step Process</h2>
            <div className="intro-features">
              <div className="intro-feature">
                <i className="fas fa-user-plus"></i>
                <span><strong>Step 1:</strong> Connect your LinkedIn profile securely</span>
              </div>
              <div className="intro-feature">
                <i className="fas fa-robot"></i>
                <span><strong>Step 2:</strong> AI analyzes your profile and goals</span>
              </div>
              <div className="intro-feature">
                <i className="fas fa-rocket"></i>
                <span><strong>Step 3:</strong> Start getting better results immediately</span>
              </div>
            </div>
          </div>
          <div className="about-image">
            <div className="team-visual">
              <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' className="team-svg">
                <rect width='400' height='300' fill='var(--bg-secondary)'/>
                <g transform='translate(200,150)'>
                  <circle r='80' fill='var(--accent-primary)' opacity='0.1'/>
                  <circle r='60' fill='var(--accent-primary)' opacity='0.2'/>
                  <circle r='40' fill='var(--accent-primary)' opacity='0.3'/>
                  <circle r='20' fill='var(--accent-primary)'/>
                </g>
                <text x='200' y='280' textAnchor='middle' fill='var(--text-secondary)' fontFamily='Inter' fontSize='14'>AI-Powered Process</text>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="pricing">
        <div className="pricing-container">
          <div className="section-header">
            <div className="section-tag">
              <i className="fas fa-gift"></i>
              GET STARTED
            </div>
            <h2 className="section-title">Ready to Transform Your LinkedIn?</h2>
            <p className="section-subtitle">Join thousands of professionals already using InlinkAI</p>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link href="/login" className="cta-button login-button" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
              Start Your Free Trial
              <i className="fas fa-arrow-right"></i>
            </Link>
            <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
