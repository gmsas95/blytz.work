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
    <Disclosure as="nav" className="sticky top-0 z-40 bg-white shadow-md border-b border-gray-200">
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              {/* Logo */}
              <div className="flex">
                <Link href="/" className="flex items-center">
                  <div className="flex items-center space-x-3">
                    <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center">
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
              <div className="hidden sm:flex sm:items-center sm:space-x-1">
                {user && navigation.map((item) => {
                  const isActive = pathname === item.href;
                  if (item.role !== 'all' && item.role !== user.role) return null;
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Right side */}
              <div className="hidden sm:flex sm:items-center sm:space-x-3">
                {user ? (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
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
                      className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/auth"
                    className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Get Started
                  </Link>
                )}
              </div>

              {/* Mobile menu button */}
              <div className="sm:hidden flex items-center space-x-3">
                {user && (
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.email?.charAt(0).toUpperCase() || user.displayName?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                <Disclosure.Button className="flex items-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
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
            <div className="sm:hidden border-t border-gray-200 bg-white">
              <div className="px-4 pt-4 pb-3 space-y-3">
                {user && navigation.map((item) => {
                  const isActive = pathname === item.href;
                  if (item.role !== 'all' && item.role !== user.role) return null;
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="text-base">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
              
              {user && (
                <div className="pt-3 pb-4 border-t border-gray-200 px-4">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-3 w-full px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    <span className="text-base">Sign Out</span>
                  </button>
                </div>
              )}

              {!user && (
                <div className="pt-3 pb-4 border-t border-gray-200 px-4">
                  <Link
                    href="/auth"
                    className="flex items-center justify-center w-full px-4 py-2 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </Disclosure>
  );
}