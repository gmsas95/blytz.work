'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isFirebaseAvailable } from '@/lib/firebase-v10';
import { useAuth } from '@/components/AuthProvider';

export function Navbar() {
  const pathname = usePathname();
  const { user, signOut: handleSignOut } = useAuth();

  const handleSignOutClick = async () => {
    try {
      await handleSignOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Don't show navbar on auth pages
  if (pathname === '/auth') {
    return null;
  }

  return (
    <nav className="bg-white shadow-md border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">BlytzHire</h1>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  href={user.role === 'company' ? '/company/profile' : '/va/profile'}
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Profile
                </Link>
                <Link
                  href="/contracts"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Contracts
                </Link>
                <button
                  onClick={handleSignOutClick}
                  className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}