'use client';

import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowRight,
  Play,
  CheckCircle,
  Star,
  Sparkles,
  Shield,
  Rocket,
  Users,
  Clock,
  DollarSign,
  Award,
  BarChart3,
  Headphones,
  FileText,
  Calendar,
  MessageSquare,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui-shadcn/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui-shadcn/card';
import { Badge } from '@/components/ui-shadcn/badge';
import { Separator } from '@/components/ui-shadcn/separator';

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
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // ALWAYS show homepage for unauthenticated users
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"></div>
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge className="bg-yellow-400 text-gray-900 hover:bg-yellow-300">
                <Sparkles className="w-4 h-4 mr-2" />
                Trusted by 500+ companies
              </Badge>
              
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="block text-white">Hire Professional</span>
                <span className="block text-yellow-400">Virtual Assistants</span>
              </h1>
              
              <p className="text-xl text-gray-300 leading-relaxed">
                Connect with pre-vetted VAs from around the world. Scale your business with top talent in days, not months.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth">
                  <Button size="lg" className="bg-yellow-400 text-gray-900 hover:bg-yellow-300 px-8 py-4 text-lg">
                    Get Started
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                
                <Button size="lg" variant="outline" className="border-gray-600 text-white hover:bg-gray-800 px-8 py-4 text-lg">
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                  <span className="ml-2 text-gray-300">4.9/5</span>
                </div>
                <div className="text-gray-300">
                  <span className="font-semibold text-white">2,000+</span> successful hires
                </div>
              </div>
            </div>

            <div className="relative">
              {/* Floating Cards */}
              <div className="absolute -top-4 -left-4 z-10">
                <Card className="bg-gray-800/90 backdrop-blur-lg border-gray-700 p-4">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">New VA Match</p>
                        <p className="text-sm text-gray-400">Just now</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Image */}
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  className="w-full h-auto"
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Professional virtual assistant working"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent"></div>
              </div>

              {/* Second Floating Card */}
              <div className="absolute -bottom-4 -right-4 z-10">
                <Card className="bg-gray-800/90 backdrop-blur-lg border-gray-700 p-4">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-gray-900" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">500+ VAs Online</p>
                        <p className="text-sm text-gray-400">Available now</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Everything You Need to Scale
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our platform provides all tools and features you need to find, hire, and manage virtual assistants effectively.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-gray-900/50 backdrop-blur-lg border-gray-700 hover:border-yellow-400/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-yellow-400/20 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-yellow-400" />
                </div>
                <CardTitle className="text-white">Vetted Professionals</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  All VAs undergo rigorous screening and verification process to ensure quality and reliability.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 backdrop-blur-lg border-gray-700 hover:border-yellow-400/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-green-400/20 rounded-lg flex items-center justify-center mb-4">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
                <CardTitle className="text-white">Transparent Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Fair pricing with $29.99 per successful connection. No hidden fees or subscriptions.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 backdrop-blur-lg border-gray-700 hover:border-yellow-400/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-400/20 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-purple-400" />
                </div>
                <CardTitle className="text-white">Quick Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Our smart algorithm matches you with qualified VAs in minutes, not weeks.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Get started with BlytzHire in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-gray-900">1</span>
              </div>
              <h3 className="text-2xl font-bold text-white">Sign Up</h3>
              <p className="text-gray-300">Create your account and tell us about your needs</p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-gray-900">2</span>
              </div>
              <h3 className="text-2xl font-bold text-white">Get Matched</h3>
              <p className="text-gray-300">Our AI matches you with qualified VAs instantly</p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-gray-900">3</span>
              </div>
              <h3 className="text-2xl font-bold text-white">Start Working</h3>
              <p className="text-gray-300">Connect and start collaborating with your VA</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-yellow-400 mb-2">500+</div>
              <div className="text-gray-300">Companies</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-yellow-400 mb-2">2,000+</div>
              <div className="text-gray-300">VAs Available</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-yellow-400 mb-2">4.9/5</div>
              <div className="text-gray-300">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-yellow-400 mb-2">98%</div>
              <div className="text-gray-300">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-yellow-400 to-yellow-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-gray-800 mb-8">
            Join thousands of companies already using BlytzHire to find world-class virtual assistants.
          </p>
          <Link href="/auth">
            <Button size="lg" className="bg-gray-900 text-white hover:bg-gray-800 px-8 py-4 text-lg">
              Start Hiring Today
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}