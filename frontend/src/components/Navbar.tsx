'use client';

import { Fragment, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu,
  X,
  LogOut,
  FileText,
  Sparkles,
  Building,
  Briefcase,
  User,
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

export function Navbar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Don't show navbar on auth page
  if (pathname === '/auth') {
    return null;
  }

  const navigation = [
    { name: 'Discover', href: '/company/discover', icon: Sparkles, role: 'company' },
    { name: 'Jobs', href: '/company/jobs', icon: Briefcase, role: 'company' },
    { name: 'Jobs', href: '/va/jobs', icon: Briefcase, role: 'va' },
    { name: 'Profile', href: '/va/profile', icon: User, role: 'va' },
    { name: 'Matches', href: '/va/matches', icon: Sparkles, role: 'va' },
    { name: 'Contracts', href: '/contracts', icon: FileText, role: 'all' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-content">
          {/* Logo */}
          <div>
            <Link href="/" className="navbar-logo">
              <div className="navbar-logo-group">
                <div className="navbar-logo-box">
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                <div>
                  <h1 className="navbar-logo-text">BlytzHire</h1>
                  <p className="navbar-logo-subtext">VA Marketplace</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="navbar-desktop-nav">
            {user && navigation.map((item) => {
              const isActive = pathname === item.href;
              if (item.role !== 'all' && item.role !== user.role) return null;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`navbar-nav-link ${
                    isActive ? 'navbar-nav-link-active' : 'navbar-nav-link-inactive'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="navbar-desktop-actions">
            {user ? (
              <div className="navbar-user-info">
                <div className="navbar-user-info">
                  <div className="navbar-user-avatar">
                    <span className="text-white text-sm font-medium">
                      {user.email?.charAt(0).toUpperCase() || user.displayName?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="navbar-user-name">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="navbar-btn navbar-btn-secondary"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                className="navbar-btn navbar-btn-primary"
              >
                Get Started
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="navbar-mobile-section">
            {user && (
              <div className="navbar-user-avatar">
                <span className="text-white text-sm font-medium">
                  {user.email?.charAt(0).toUpperCase() || user.displayName?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            )}
            <button 
              className="navbar-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileMenuOpen && (
        <div className={`navbar-mobile-menu show`}>
          <div className="navbar-mobile-content">
            {user && navigation.map((item) => {
              const isActive = pathname === item.href;
              if (item.role !== 'all' && item.role !== user.role) return null;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`navbar-mobile-link ${
                    isActive ? 'navbar-mobile-link-active' : ''
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-base">{item.name}</span>
                </Link>
              );
            })}
          </div>
          
          {user && (
            <div className="navbar-mobile-divider">
              <button
                onClick={handleSignOut}
                className="navbar-mobile-btn"
              >
                <LogOut className="h-5 w-5" />
                <span className="text-base">Sign Out</span>
              </button>
            </div>
          )}

          {!user && (
            <div className="navbar-mobile-divider">
              <Link
                href="/auth"
                className="navbar-mobile-btn navbar-btn-primary"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;