'use client';

import { Fragment, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Disclosure } from '@headlessui/react';
import { 
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  DocumentTextIcon,
  SparklesIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/components/AuthProvider';
import { motion } from 'framer-motion';

export function Navbar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

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
    { name: 'Discover', href: '/company/discover', icon: SparklesIcon, role: 'company' },
    { name: 'Jobs', href: '/company/jobs', icon: BriefcaseIcon, role: 'company' },
    { name: 'Matches', href: '/va/matches', icon: SparklesIcon, role: 'va' },
    { name: 'Contracts', href: '/contracts', icon: DocumentTextIcon, role: 'all' },
  ];

  return (
    <Disclosure as="nav" className="sticky top-0 z-40 glass border-b border-gray-200/50 backdrop-blur-md">
      {({ open }) => (
        <>
          <div className="container-modern">
            <div className="flex h-16 justify-between">
              {/* Logo */}
              <div className="flex items-center">
                <Link href="/" className="flex items-center group">
                  <div className="flex items-center space-x-3">
                    <div className="h-9 w-9 rounded-xl bg-primary-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <span className="text-white font-bold text-sm">B</span>
                    </div>
                    <div>
                      <h1 className="text-lg font-bold text-gray-900 leading-none">BlytzHire</h1>
                      <p className="text-xs text-gray-500 leading-none">VA Marketplace</p>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex lg:items-center lg:space-x-1">
                {user && navigation.map((item) => {
                  const isActive = pathname === item.href;
                  if (item.role !== 'all' && item.role !== user.role) return null;
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`nav-link ${
                        isActive ? 'nav-link-active' : 'nav-link-inactive'
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Right side */}
              <div className="hidden lg:flex lg:items-center lg:space-x-3">
                {user ? (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user.email?.charAt(0).toUpperCase() || user.displayName?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {user.displayName || user.email?.split('@')[0]}
                      </span>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="btn-ghost p-2"
                      title="Sign out"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/auth"
                    className="btn-primary group"
                  >
                    Get Started
                    <span className="ml-2 transition-transform group-hover:translate-x-0.5">→</span>
                  </Link>
                )}
              </div>

              {/* Mobile menu button */}
              <div className="flex items-center space-x-3 lg:hidden">
                {user && (
                  <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.email?.charAt(0).toUpperCase() || user.displayName?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                <Disclosure.Button className="btn-ghost p-2">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          {/* Mobile menu panel */}
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="lg:hidden border-t border-gray-200/50 bg-white/95 backdrop-blur-xl"
            >
              <div className="px-4 py-6 space-y-4">
                {user && navigation.map((item) => {
                  const isActive = pathname === item.href;
                  if (item.role !== 'all' && item.role !== user.role) return null;
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-primary-50 text-primary-700 border border-primary-200'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="text-base">{item.name}</span>
                    </Link>
                  );
                })}
                
                {user && (
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                    >
                      <ArrowRightOnRectangleIcon className="h-5 w-5" />
                      <span className="text-base">Sign Out</span>
                    </button>
                  </div>
                )}

                {!user && (
                  <div className="pt-4 border-t border-gray-200">
                    <Link
                      href="/auth"
                      className="btn-primary w-full"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </>
      )}
    </Disclosure>
  );
}