'use client';

import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { LandingNavbar } from '@/components/LandingNavbar';
import { Hero } from '@/components/Hero';
import { HowItWorks } from '@/components/HowItWorks';
import { WhyBlytz } from '@/components/WhyBlytz';
import { Footer } from '@/components/Footer';

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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // ALWAYS show landing page for unauthenticated users
  return (
    <div className="min-h-screen bg-white text-black">
      <LandingNavbar />
      <main>
        <Hero />
        <HowItWorks />
        <WhyBlytz />
      </main>
      <Footer />
    </div>
  );
}