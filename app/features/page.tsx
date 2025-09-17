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

      {/* Features Grid */}
      <section className="benefits">
        <div className="benefits-container">
          <div className="section-header">
            <div className="section-tag">
              <i className="fas fa-magic"></i>
              CORE FEATURES
            </div>
            <h2 className="section-title">Everything You Need to Dominate LinkedIn</h2>
            <p className="section-subtitle">Comprehensive AI-powered tools for professional growth</p>
          </div>

          <div className="benefits-grid">
            <div className="benefit-card loading">
              <div className="benefit-icon">
                <i className="fas fa-user-edit"></i>
              </div>
              <h3>AI Profile Optimization</h3>
              <p>Get your LinkedIn profile analyzed by AI and receive personalized recommendations to improve visibility, engagement, and professional appeal.</p>
            </div>

            <div className="benefit-card loading">
              <div className="benefit-icon">
                <i className="fas fa-edit"></i>
              </div>
              <h3>Smart Content Generation</h3>
              <p>Create compelling LinkedIn posts, articles, and updates with AI that understands your industry, audience, and personal brand voice.</p>
            </div>

            <div className="benefit-card loading">
              <div className="benefit-icon">
                <i className="fas fa-bullseye"></i>
              </div>
              <h3>Prospect Targeting</h3>
              <p>Identify and connect with high-value prospects who match your ideal customer profile using advanced AI algorithms.</p>
            </div>

            <div className="benefit-card loading">
              <div className="benefit-icon">
                <i className="fas fa-calendar-alt"></i>
              </div>
              <h3>Content Scheduling</h3>
              <p>Plan and schedule your LinkedIn content for optimal engagement times, ensuring consistent visibility without the daily effort.</p>
            </div>

            <div className="benefit-card loading">
              <div className="benefit-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3>Performance Analytics</h3>
              <p>Track your LinkedIn performance with detailed analytics on profile views, engagement rates, and connection success metrics.</p>
            </div>

            <div className="benefit-card loading">
              <div className="benefit-icon">
                <i className="fas fa-comments"></i>
              </div>
              <h3>Engagement Automation</h3>
              <p>Automatically engage with relevant content in your network to increase your visibility and build meaningful professional relationships.</p>
            </div>

            <div className="benefit-card loading">
              <div className="benefit-icon">
                <i className="fas fa-search"></i>
              </div>
              <h3>Lead Research</h3>
              <p>Research potential leads and clients with AI-powered insights about their business needs, challenges, and decision-making patterns.</p>
            </div>

            <div className="benefit-card loading">
              <div className="benefit-icon">
                <i className="fas fa-paper-plane"></i>
              </div>
              <h3>Outreach Campaigns</h3>
              <p>Create and manage personalized outreach campaigns that convert prospects into clients with AI-crafted messaging.</p>
            </div>

            <div className="benefit-card loading">
              <div className="benefit-icon">
                <i className="fas fa-brain"></i>
              </div>
              <h3>AI Learning & Adaptation</h3>
              <p>Our AI continuously learns from your interactions and results, becoming more effective at generating content and identifying opportunities.</p>
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
