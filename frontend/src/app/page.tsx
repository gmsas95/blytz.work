'use client';

import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowRightIcon,
  PlayIcon,
  CheckCircleIcon,
  StarIcon,
  SparklesIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Only redirect when NOT loading and user exists
  useEffect(() => {
    if (!loading && user) {
      router.push(user.role === 'company' ? '/company/discover' : '/va/matches');
    }
  }, [user, loading, router]);

  // Show loading ONLY during initial auth check
  if (loading) {
    return (
      <div className="loading-wrapper" style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb'}}>
        <div className="text-center">
          <div className="loading-spinner" style={{margin: '0 auto 1rem'}}></div>
          <p style={{color: '#6b7280'}}>Loading...</p>
        </div>
      </div>
    );
  }

  // ALWAYS show homepage for unauthenticated users
  return (
    <div className="min-h-screen" style={{background: 'white'}}>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <div className="badge">
              <SparklesIcon style={{width: '16px', height: '16px', marginRight: '8px'}} />
              Trusted by 500+ companies
            </div>
            
            <h1 className="heading">
              <span style={{display: 'block', color: '#111827'}}>Hire Professional</span>
              <span style={{display: 'block', color: '#2563eb'}}>Virtual Assistants</span>
            </h1>
            
            <p className="subheading">
              Connect with pre-vetted VAs from around the world. Scale your business with top talent in days, not months.
            </p>
            
            <div className="btn-group">
              <Link
                href="/auth"
                className="btn btn-primary"
              >
                Get Started
                <ArrowRightIcon style={{width: '20px', height: '20px', marginLeft: '8px'}} />
              </Link>
              
              <button className="btn btn-secondary">
                <PlayIcon style={{width: '20px', height: '20px', marginRight: '8px'}} />
                Watch Demo
              </button>
            </div>

            <div className="social-proof">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} style={{width: '20px', height: '20px', color: '#fbbf24'}} fill="currentColor" />
                ))}
                <span className="rating-text">4.9/5</span>
              </div>
              <div className="hires-count">
                <span style={{fontWeight: '600', color: '#111827'}}>2,000+</span> successful hires
              </div>
            </div>
          </div>

          <div className="hero-image">
            <div className="floating-card floating-card-top">
              <div className="avatar-small avatar-green">
                <CheckCircleIcon style={{width: '20px', height: '20px', color: '#16a34a'}} />
              </div>
              <div>
                <p style={{fontSize: '14px', fontWeight: '500', color: '#111827', margin: '0 0 2px 0'}}>New VA Match</p>
                <p style={{fontSize: '12px', color: '#6b7280', margin: '0'}}>Just now</p>
              </div>
            </div>

            <div className="main-image">
              <img
                style={{width: '100%', height: 'auto', display: 'block'}}
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Professional virtual assistant working"
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.2) 0%, transparent 100%)'
              }} />
            </div>

            <div className="floating-card floating-card-bottom">
              <div className="avatar-small avatar-blue">
                <span>U</span>
              </div>
              <div>
                <p style={{fontSize: '14px', fontWeight: '500', color: '#111827', margin: '0 0 2px 0'}}>500+ VAs Online</p>
                <p style={{fontSize: '12px', color: '#6b7280', margin: '0'}}>Available now</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section section-light">
        <div className="section-header">
          <h2 className="section-title">Everything You Need to Scale</h2>
          <p className="section-subtitle">
            Our platform provides all tools and features you need to find, hire, and manage virtual assistants effectively.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <ShieldCheckIcon style={{width: '24px', height: '24px'}} />
            </div>
            <h3 className="feature-title">Vetted Professionals</h3>
            <p className="feature-description">
              All VAs undergo rigorous screening and verification process to ensure quality and reliability.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <RocketLaunchIcon style={{width: '24px', height: '24px'}} />
            </div>
            <h3 className="feature-title">Transparent Pricing</h3>
            <p className="feature-description">
              Fair pricing with $29.99 per successful connection. No hidden fees or subscriptions.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <SparklesIcon style={{width: '24px', height: '24px'}} />
            </div>
            <h3 className="feature-title">Quick Matching</h3>
            <p className="feature-description">
              Our smart algorithm matches you with qualified VAs in minutes, not weeks.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section section">
        <h2 className="cta-title">Ready to Transform Your Business?</h2>
        <p className="cta-subtitle">
          Join thousands of companies already using BlytzHire to find world-class virtual assistants.
        </p>
        <Link
          href="/auth"
          className="btn btn-white"
        >
          Start Hiring Today
          <ArrowRightIcon style={{width: '20px', height: '20px', marginLeft: '8px'}} />
        </Link>
      </section>
    </div>
  );
}