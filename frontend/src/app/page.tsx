'use client';

import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  RocketLaunchIcon,
  SparklesIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push(user.role === 'company' ? '/company/discover' : '/va/matches');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"
          />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233b82f6' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            <div className="lg:col-span-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 mb-6">
                  <SparklesIcon className="h-4 w-4 mr-1" />
                  Trusted by 500+ companies
                </div>
                
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Hire Professional</span>
                  <span className="block text-blue-600">Virtual Assistants</span>
                </h1>
                
                <p className="mt-6 text-lg text-gray-600 max-w-2xl">
                  Connect with pre-vetted VAs from around the world. Find skilled professionals for your business needs in minutes, not weeks.
                </p>
                
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/auth"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md"
                  >
                    Get Started
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </Link>
                  
                  <button className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                    <span className="flex items-center">
                      <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      Watch Demo
                    </span>
                  </button>
                </div>

                {/* Social Proof */}
                <div className="mt-8 flex items-center space-x-6">
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
              </motion.div>
            </div>

            <div className="lg:col-span-6 mt-12 lg:mt-0">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <div className="relative mx-auto w-full max-w-lg">
                  {/* Floating Elements */}
                  <div className="absolute -top-4 -left-4 bg-white rounded-lg shadow-md p-3 flex items-center space-x-2 animate-pulse">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-900">VA Matched</p>
                      <p className="text-xs text-gray-500">2 min ago</p>
                    </div>
                  </div>

                  {/* Main Image */}
                  <div className="relative overflow-hidden rounded-2xl shadow-lg border border-gray-100">
                    <img
                      className="w-full h-auto"
                      src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                      alt="Remote work setup with professional virtual assistant"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to hire talent
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform provides all the tools and features you need to find, hire, and manage virtual assistants effectively.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: ShieldCheckIcon,
                title: 'Vetted Professionals',
                description: 'All VAs undergo rigorous screening and verification process to ensure quality and reliability.',
                color: 'blue'
              },
              {
                icon: CurrencyDollarIcon,
                title: 'Fair Pricing',
                description: 'Transparent pricing with $29.99 per successful connection. No hidden fees or subscriptions.',
                color: 'green'
              },
              {
                icon: RocketLaunchIcon,
                title: 'Quick Matching',
                description: 'Our smart algorithm matches you with qualified VAs in minutes, not weeks.',
                color: 'yellow'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100"
              >
                <div className={`inline-flex items-center justify-center h-12 w-12 rounded-lg bg-${feature.color}-100 mb-4`}>
                  <feature.icon className={`h-6 w-6 text-${feature.color}-600`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to scale your business?
            </h2>
            <p className="mt-4 text-xl text-blue-100 max-w-2xl mx-auto">
              Join thousands of companies already using BlytzHire to find world-class virtual assistants.
            </p>
            <div className="mt-8">
              <Link
                href="/auth"
                className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-white text-blue-600 hover:bg-blue-50 transition-colors shadow-lg"
              >
                Start Hiring Today
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}