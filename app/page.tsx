import Link from 'next/link';

export default function Home() {
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
              Transform your LinkedIn presence with cutting-edge AI. Improve your profile visibility, create engaging content that converts, and connect with prospects who are ready to work with you.
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
          <div className="hero-visual">
            <div className="visual-card visual-card-main">
              <i className="fab fa-linkedin"></i>
              <h3>AI-Powered Growth</h3>
              <p>Transform your LinkedIn presence</p>
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
              <div className="benefit-icon">
                <i className="fas fa-eye"></i>
              </div>
              <h3>Get Noticed</h3>
              <p>AI optimizes your LinkedIn profile - headline, about section, experience, and featured content to improve visibility and attract your ideal prospects.</p>
            </div>
            <div className="benefit-card loading">
              <div className="benefit-icon">
                <i className="fas fa-bullseye"></i>
              </div>
              <h3>Stay Relevant</h3>
              <p>Create engaging, topic-specific content that positions you as an expert. Our AI generates posts, articles, and updates tailored to your niche and audience.</p>
            </div>
            <div className="benefit-card loading">
              <div className="benefit-icon">
                <i className="fas fa-handshake"></i>
              </div>
              <h3>Be Chosen</h3>
              <p>Connect with prospects who engage with your content and match your ideal customer profile. Reach out at the perfect moment when they're most interested.</p>
            </div>
            <div className="benefit-card loading">
              <div className="benefit-icon">
                <i className="fas fa-robot"></i>
              </div>
              <h3>AI-Powered</h3>
              <p>State-of-the-art artificial intelligence analyzes LinkedIn trends, optimizes your content strategy, and identifies high-potential connections.</p>
            </div>
            <div className="benefit-card loading">
              <div className="benefit-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3>Data-Driven</h3>
              <p>Track your performance with detailed analytics. See which content performs best, monitor profile views, and measure connection success rates.</p>
            </div>
            <div className="benefit-card loading">
              <div className="benefit-icon">
                <i className="fas fa-clock"></i>
              </div>
              <h3>Time-Saving</h3>
              <p>Automate your LinkedIn strategy. Spend minutes, not hours, maintaining a professional presence that generates real business opportunities.</p>
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

      {/* Stats Section */}
      <section className="stats">
        <div className="stats-container">
          <div className="stat-item loading">
            <div className="stat-number">3x</div>
            <div className="stat-label">More Profile Views</div>
          </div>
          <div className="stat-item loading">
            <div className="stat-number">5x</div>
            <div className="stat-label">Higher Engagement</div>
          </div>
          <div className="stat-item loading">
            <div className="stat-number">200%</div>
            <div className="stat-label">More Connections</div>
          </div>
          <div className="stat-item loading">
            <div className="stat-number">80%</div>
            <div className="stat-label">Time Saved</div>
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
              <div className="pricing-header">
                <div className="pricing-icon">
                  <i className="fas fa-seedling"></i>
                </div>
                <h3>Free Trial</h3>
                <div className="price">
                  <span className="currency">$</span>
                  <span className="amount">0</span>
                  <span className="period">/14 days</span>
                </div>
              </div>
              <div className="pricing-features">
                <div className="feature">
                  <i className="fas fa-check"></i>
                  <span>Profile optimization</span>
                </div>
                <div className="feature">
                  <i className="fas fa-check"></i>
                  <span>5 AI-generated posts</span>
                </div>
                <div className="feature">
                  <i className="fas fa-check"></i>
                  <span>Basic analytics</span>
                </div>
                <div className="feature">
                  <i className="fas fa-check"></i>
                  <span>Connection insights</span>
                </div>
                <div className="feature">
                  <i className="fas fa-check"></i>
                  <span>Email support</span>
                </div>
                <div className="feature">
                  <i className="fas fa-check"></i>
                  <span>No credit card required</span>
                </div>
              </div>
              <Link href="/login" className="pricing-button free-button" aria-label="Start Free Trial">
                Start Free Trial
                <i className="fas fa-rocket" aria-hidden="true"></i>
              </Link>
            </div>

            <div className="pricing-card elite-card loading">
              <div className="pricing-badge">Most Popular</div>
              <div className="pricing-header">
                <div className="pricing-icon">
                  <i className="fas fa-crown"></i>
                </div>
                <h3>Pro Plan</h3>
                <div className="price">
                  <span className="currency">$</span>
                  <span className="amount">29</span>
                  <span className="period">/month</span>
                </div>
              </div>
              <div className="pricing-features">
                <div className="feature">
                  <i className="fas fa-check"></i>
                  <span>Everything in Free</span>
                </div>
                <div className="feature">
                  <i className="fas fa-check"></i>
                  <span>Unlimited AI content</span>
                </div>
                <div className="feature">
                  <i className="fas fa-check"></i>
                  <span>Advanced analytics</span>
                </div>
                <div className="feature">
                  <i className="fas fa-check"></i>
                  <span>Smart prospect targeting</span>
                </div>
                <div className="feature">
                  <i className="fas fa-check"></i>
                  <span>Automated outreach</span>
                </div>
                <div className="feature">
                  <i className="fas fa-check"></i>
                  <span>Priority support</span>
                </div>
                <div className="feature">
                  <i className="fas fa-check"></i>
                  <span>Content scheduling</span>
                </div>
                <div className="feature">
                  <i className="fas fa-check"></i>
                  <span>API access</span>
                </div>
              </div>
              <Link href="/login" className="pricing-button elite-button" aria-label="Upgrade to Pro Plan">
                Start Pro Trial
                <i className="fas fa-crown" aria-hidden="true"></i>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
