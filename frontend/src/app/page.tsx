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
  UsersIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push(user.role === 'company' ? '/company/discover' : '/va/matches');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'Vetted Professionals',
      description: 'All VAs undergo rigorous screening and verification process to ensure quality and reliability.',
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Transparent Pricing',
      description: 'Fair pricing with $29.99 per successful connection. No hidden fees or subscriptions.',
    },
    {
      icon: RocketLaunchIcon,
      title: 'Quick Matching',
      description: 'Our smart algorithm matches you with qualified VAs in minutes, not weeks.',
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium mb-6">
                <SparklesIcon className="h-4 w-4 mr-2" />
                Trusted by 500+ companies
              </div>
              
              <h1 className="text-6xl font-bold mb-6">
                <span className="block text-gray-900">Hire Professional</span>
                <span className="block text-blue-600">Virtual Assistants</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-2xl">
                Connect with pre-vetted VAs from around the world. Scale your business with top talent in days, not months.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  href="/auth"
                  className="btn-primary group inline-flex items-center"
                >
                  Get Started
                  <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <button className="btn-secondary inline-flex items-center">
                  <PlayIcon className="h-5 w-5 mr-2" />
                  Watch Demo
                </button>
              </div>

              <div className="flex items-center gap-8">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" />
                  ))}
                  <span className="ml-2 text-sm font-medium text-gray-900">4.9/5</span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">2,000+</span> successful hires
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-4 -left-4 bg-white rounded-lg shadow-lg p-4 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">New VA Match</p>
                    <p className="text-xs text-gray-500">Just now</p>
                  </div>
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-100">
                <img
                  className="w-full h-auto"
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Professional virtual assistant working"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Scale
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform provides all the tools and features you need to find, hire, and manage virtual assistants effectively.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={feature.title} className="card bg-white hover:shadow-lg transition-shadow duration-300">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-blue-100 mb-4">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of companies already using BlytzHire to find world-class virtual assistants.
          </p>
          <Link
            href="/auth"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
          >
            Start Hiring Today
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}