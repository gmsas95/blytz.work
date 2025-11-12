'use client';

import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'Vetted Professionals',
      description: 'All VAs undergo rigorous screening and verification process to ensure quality and reliability.',
      color: 'primary'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Transparent Pricing',
      description: 'Fair pricing with $29.99 per successful connection. No hidden fees or subscriptions.',
      color: 'success'
    },
    {
      icon: RocketLaunchIcon,
      title: 'Quick Matching',
      description: 'Our smart algorithm matches you with qualified VAs in minutes, not weeks.',
      color: 'warning'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'CEO, TechStart',
      content: 'Found an amazing VA within 24 hours. The quality of candidates is outstanding!',
      rating: 5
    },
    {
      name: 'Mike Chen',
      role: 'Founder, DesignHub',
      content: 'BlytzHire transformed how we hire remote talent. Highly recommend!',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative container-modern pt-20 pb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center badge badge-success mb-6">
                <SparklesIcon className="h-4 w-4 mr-2" />
                Trusted by 500+ companies
              </div>
              
              <h1 className="text-display mb-6">
                <span className="block text-gray-900">Hire World-Class</span>
                <span className="gradient-text block">Virtual Assistants</span>
              </h1>
              
              <p className="text-body text-lg mb-8 max-w-lg">
                Connect with pre-vetted VAs from around the world. Scale your business with top talent in days, not months.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  href="/auth"
                  className="btn-primary group"
                >
                  Get Started
                  <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                
                <button className="btn-outline group">
                  <PlayIcon className="h-4 w-4 mr-2" />
                  Watch Demo
                </button>
              </div>

              <div className="flex items-center gap-8">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-amber-400" fill="currentColor" />
                  ))}
                  <span className="ml-2 font-semibold text-gray-900">4.9/5</span>
                </div>
                <div className="text-gray-600">
                  <span className="font-semibold text-gray-900">2,000+</span> successful hires
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative">
                <div className="absolute -top-4 -left-4 bg-white rounded-xl shadow-md p-4 card-hover animate-float">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-success-100 flex items-center justify-center">
                      <CheckCircleIcon className="h-5 w-5 text-success-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">New VA Match</p>
                      <p className="text-xs text-gray-500">Just now</p>
                    </div>
                  </div>
                </div>

                <div className="relative rounded-2xl overflow-hidden shadow-strong border border-gray-100">
                  <img
                    src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Professional virtual assistant working"
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                </div>

                <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-md p-4 card-hover animate-float-delayed">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <UsersIcon className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">500+ VAs Online</p>
                      <p className="text-xs text-gray-500">Available now</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="container-modern">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-heading mb-4">
              Everything You Need to Scale
            </h2>
            <p className="text-body text-lg max-w-2xl mx-auto">
              Our platform provides all the tools and features you need to find, hire, and manage virtual assistants effectively.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card-hover"
              >
                <div className={`inline-flex items-center justify-center h-12 w-12 rounded-xl bg-${feature.color}-100 mb-6`}>
                  <feature.icon className={`h-6 w-6 text-${feature.color}-600`} />
                </div>
                <h3 className="text-subheading mb-3">{feature.title}</h3>
                <p className="text-body">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white">
        <div className="container-modern">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-heading mb-4">
              Loved by Companies Worldwide
            </h2>
            <p className="text-body text-lg max-w-2xl mx-auto">
              See what our customers have to say about their experience with BlytzHire.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card-hover"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-amber-400" fill="currentColor" />
                  ))}
                </div>
                <p className="text-body mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 gradient-primary">
        <div className="container-modern">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-heading mb-4 text-white">
              Ready to Transform Your Business?
            </h2>
            <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
              Join thousands of companies already using BlytzHire to find world-class virtual assistants.
            </p>
            <Link
              href="/auth"
              className="inline-flex items-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Start Hiring Today
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 3s ease-in-out infinite;
          animation-delay: 1.5s;
        }
        .bg-grid-pattern {
          background-image: linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>
    </div>
  );
}