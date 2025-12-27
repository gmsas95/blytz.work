"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInUser, registerUser, getToken } from "@/lib/auth";
import { apiCall } from "@/lib/api";
import { toast } from "sonner";

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    username: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for expired=true parameter and clear auth state
  useEffect(() => {
    const isExpired = searchParams?.get('expired');
    if (isExpired === 'true') {
      console.log('🔍 Authentication expired, clearing local storage...');
      // Clear all auth-related storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      localStorage.removeItem('userRole');
      localStorage.removeItem('isMockAuth');

      // Show message to user
      toast.error("Session Expired", {
        description: "Please sign in again to continue",
      });
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      let authUser;

      if (isLogin) {
        // Login with Firebase
        authUser = await signInUser(formData.email, formData.password);
        console.log('✅ Firebase authentication successful');
      } else {
        // Register with Firebase
        authUser = await registerUser(formData.email, formData.password, formData.name);
        console.log('✅ Firebase registration successful');
      }

      // Store auth state
      localStorage.setItem('authUser', JSON.stringify(authUser));

      // Get Firebase ID token for API calls
      const token = await getToken();
      if (!token) {
        throw new Error('Failed to get authentication token');
      }
      localStorage.setItem('authToken', token);

      // Show success message
      toast.success(isLogin ? `Welcome back!` : `Account created!`, {
        description: isLogin
          ? "Successfully signed in to your account"
          : "Your account has been created successfully",
      });

      // Get user profile from backend (middleware auto-creates user if needed)
      console.log('🔍 Getting user profile from backend...');
      const profileResponse = await apiCall('/auth/profile');
      const profileData = await profileResponse.json();

      console.log('✅ User profile:', profileData.data);

      // Determine redirect based on user role and profile status
      const role = profileData.data?.role;
      const profileComplete = profileData.data?.profileComplete;
      const hasVAProfile = profileData.data?.vaProfile;
      const hasCompanyProfile = profileData.data?.company;

      let redirectPath = '/select-role'; // Default to role selection

      if (role === 'company') {
        localStorage.setItem('userRole', 'employer');
        if (hasCompanyProfile) {
          redirectPath = '/employer/dashboard';
        } else {
          redirectPath = '/employer/onboarding';
        }
      } else if (role === 'va') {
        localStorage.setItem('userRole', 'va');
        if (hasVAProfile) {
          redirectPath = '/va/dashboard';
        } else {
          redirectPath = '/va/onboarding';
        }
      }

      console.log(`🔍 Redirecting to: ${redirectPath}`);
      router.push(redirectPath);

    } catch (err: any) {
      console.error('Authentication error:', err);
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);

      if (errorMessage.includes('timeout')) {
        toast.error("Connection Timeout", {
          description: "Please check your connection and try again",
        });
      } else if (errorMessage.includes('401') || errorMessage.includes('Authentication')) {
        toast.error("Authentication Failed", {
          description: "Please check your credentials and try again",
        });
      } else {
        toast.error("Error", {
          description: errorMessage,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
              <Zap className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {isLogin ? 'Welcome Back!' : 'Join BlytzWork'}
          </h1>
          <p className="text-white/90">
            {isLogin
              ? 'Sign in to access your dashboard'
              : 'Create your account to get started'}
          </p>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name field (only for signup) */}
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={isLoading}
                  required
                />
              </div>
            )}

            {/* Email field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isLoading}
                required
                autoComplete="email"
              />
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="•••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={isLoading}
                required
                minLength={6}
                autoComplete={isLogin ? "current-password" : "new-password"}
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </Button>
          </form>

          {/* Toggle login/signup */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                }}
                className="text-blue-600 hover:text-blue-700 font-medium ml-1"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

          {/* Forgot password link */}
          {isLogin && (
            <div className="text-center mt-4">
              <Link
                href="/forgot-password"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Forgot your password?
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AuthPageContent />
    </Suspense>
  );
}
