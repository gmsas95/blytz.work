'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getAuth, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function Navbar() {
  const pathname = usePathname();
  const user = auth?.currentUser;

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
      window.location.href = '/';
    }
  };

  return (
    <nav className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-primary-600">
              VA Match
            </Link>
          </div>

          {user && (
            <div className="flex items-center space-x-4">
              {(user as any)?.role === 'va' && (
                <>
                  <Link
                    href="/va/profile"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      pathname === '/va/profile'
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    My Profile
                  </Link>
                  <Link
                    href="/va/matches"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      pathname === '/va/matches'
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Matches
                  </Link>
                </>
              )}

              {(user as any)?.role === 'company' && (
                <>
                  <Link
                    href="/company/profile"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      pathname === '/company/profile'
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Company
                  </Link>
                  <Link
                    href="/company/jobs"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      pathname === '/company/jobs'
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Job Postings
                  </Link>
                  <Link
                    href="/company/discover"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      pathname === '/company/discover'
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Discover VAs
                  </Link>
                </>
              )}

              <button
                onClick={handleSignOut}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}