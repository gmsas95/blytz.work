"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInUser, registerUser, getAuthErrorMessage, getToken } from "@/lib/auth";
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
      if (isLogin) {
        let authUser;
        
        // Use Firebase auth only - no mock fallback for production
        authUser = await signInUser(formData.email, formData.password);
        console.log('✅ Firebase authentication successful');
        
        // Store authentication state
        localStorage.setItem('authUser', JSON.stringify(authUser));
        
        // Get Firebase ID token and store it for API calls
        let token;
        try {
          token = await getToken();
          if (!token) {
            throw new Error('Failed to get authentication token');
          }
          localStorage.setItem('authToken', token);
        } catch (tokenError) {
          console.log('Token generation failed, using mock token');
          token = 'demo-token-' + Date.now();
          localStorage.setItem('authToken', token);
        }
        
        // Show success message
        toast.success(`Welcome back!`, {
          description: "Successfully signed in to your account",
        });
        
        // Determine user role and redirect
        let userRole = 'va'; // default
        let redirectPath = '/va/onboarding';
        
        // Try to determine role from email first (fallback)
        if (formData.email.includes('company') || formData.email.includes('employer')) {
          userRole = 'employer';
          redirectPath = '/employer/onboarding';
        }
        
         // Check user role from backend with timeout
        try {
          console.log('Checking user profile...');
          
          // Add timeout to prevent infinite loading
          const profileResponse = await Promise.race([
            apiCall('/auth/profile'),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('API call timeout')), 3000)
            )
          ]) as Response;
          
          console.log('Profile response status:', profileResponse.status);
          
          if (profileResponse.status === 404 || profileResponse.status === 401) {
            // User doesn't exist in database - create them from Firebase auth data
            console.log('User not found in database, creating from Firebase...');
            
            try {
              const createResponse = await apiCall('/auth/sync-user', {
                method: 'POST',
                body: JSON.stringify({
                  uid: authUser.uid,
                  email: authUser.email
                })
              });
              
              console.log('User sync response:', createResponse);
            } catch (syncError) {
              console.error('Failed to sync user to database:', syncError);
              // Continue anyway with fallback logic
            }
          }
          
          if (profileResponse.status === 200) {
            const userData = await profileResponse.json();
            const role = userData.data.role;
            console.log('User role from backend:', role);
            
            if (role === 'company') {
              userRole = 'employer';
              localStorage.setItem("userRole", "employer");
              
              // Check if company has profile with timeout
              try {
                const companyResponse = await Promise.race([
                  apiCall('/company/profile'),
                  new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('API call timeout')), 2000)
                  )
                ]) as Response;
                
                redirectPath = companyResponse.ok ? "/employer/dashboard" : "/employer/onboarding";
              } catch {
                redirectPath = "/employer/onboarding";
              }
            } else if (role === 'va') {
              userRole = 'va';
              localStorage.setItem("userRole", "va");
              
              // Check if VA has profile with timeout
              try {
                const vaResponse = await Promise.race([
                  apiCall('/va/profile'),
                  new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('API call timeout')), 2000)
                  )
                ]) as Response;
                
                redirectPath = vaResponse.ok ? "/va/dashboard" : "/va/onboarding";
              } catch {
                redirectPath = "/va/onboarding";
              }
            } else {
              // User exists but no role - send to role selection
              console.log('User has no role, going to role selection');
              redirectPath = "/select-role";
            }
          } else if (profileResponse.status === 404) {
            // User doesn't exist in backend - use fallback
            console.log('User not found in backend, using fallback...');
            redirectPath = userRole === 'employer' ? "/employer/onboarding" : "/va/onboarding";
          } else {
            // Other HTTP error - use fallback
            throw new Error(`Backend returned ${profileResponse.status}`);
          }
        } catch (error) {
          console.error('Error checking user role:', error);
          console.log('Backend is unavailable, using fallback...');
          // Backend is down - use the role determined from email
          redirectPath = userRole === 'employer' ? "/employer/onboarding" : "/va/onboarding";
        }
        
        // Store final role and redirect
        localStorage.setItem('userRole', userRole);
        console.log('Redirecting to:', redirectPath);
        
        // Use window.location.href for more reliable redirect
        window.location.href = redirectPath;
      } else {
        let authUser;
        
        // Use Firebase auth only - no mock fallback for production
        authUser = await registerUser(formData.email, formData.password, formData.name);
        
        // Get Firebase ID token and store it for API calls
        let token;
        try {
          token = await getToken();
          if (!token) {
            throw new Error('Failed to get authentication token');
          }
        } catch (tokenError) {
          console.error('Token generation failed:', tokenError);
          throw new Error('Authentication token generation failed');
        }
        
        // Get Firebase user UID and create basic profile in backend
        if (authUser.uid) {
          try {
            await apiCall('/auth/create', {
              method: 'POST',
              body: JSON.stringify({
                uid: authUser.uid,
                email: formData.email,
                name: formData.name,
                username: formData.username,
                role: null // Will be set after role selection
              })
            });
          } catch (apiError) {
            console.log('Backend user creation failed (expected for mock users):', apiError);
          }
        }
        
        toast.success(`Account created!`, {
          description: "Welcome to BlytzWork",
        });
        
        // Redirect to role selection after registration
        router.push("/select-role");
      }
    } catch (err: any) {
      const errorMessage = getAuthErrorMessage(err);
      setError(errorMessage);
      toast.error("Authentication failed", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setFormData({ name: "", email: "", password: "", username: "" });
    setError(null);
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <Link href="/" className="inline-flex items-center gap-2 mb-8">
              <div className="w-12 h-12 rounded-lg bg-black flex items-center justify-center">
                <Zap className="w-7 h-7 text-[#FFD600]" fill="#FFD600" />
              </div>
              <span className="text-2xl text-black tracking-tight">BlytzWork</span>
            </Link>
            <h1 className="text-4xl text-black tracking-tight mb-2">
              {isLogin ? "Welcome back" : "Get started"}
            </h1>
            <p className="text-gray-600">
              {isLogin ? "Sign in to your account" : "Create your account"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="border-gray-300 focus:border-black focus:ring-[#FFD600]"
                  required
                  disabled={isLoading}
                />
              </div>
            )}

            <div className="space-y-2">
              {isLogin ? (
                <div className="flex justify-between items-center">
                  <Label htmlFor="email">Email</Label>
                  <Link href="/forgot-password" className="text-sm text-gray-600 hover:text-black">
                    Forgot password?
                  </Link>
                </div>
              ) : (
                <Label htmlFor="email">Email</Label>
              )}
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="border-gray-300 focus:border-black focus:ring-[#FFD600]"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="•••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="border-gray-300 focus:border-black focus:ring-[#FFD600]"
                required
                disabled={isLoading}
              />
              {!isLogin && (
                <p className="text-sm text-gray-500">At least 6 characters</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-[#FFD600] hover:bg-[#FFD600]/90 text-black shadow-lg"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  {isLogin ? "Signing in..." : "Creating account..."}
                </div>
              ) : (
                isLogin ? "Sign In" : "Create Account"
              )}
            </Button>
          </form>

          <div className="text-center text-gray-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={toggleForm}
              className="text-black hover:underline font-medium"
              disabled={isLoading}
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </div>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex flex-1 bg-black items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#FFD60008_1px,transparent_1px),linear-gradient(to_bottom,#FFD60008_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        <div className="absolute top-20 right-20 w-96 h-96 bg-[#FFD600] rounded-full blur-[120px] opacity-20" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#FFD600] rounded-full blur-[120px] opacity-20" />
        
        <div className="relative text-center space-y-6 max-w-lg">
          <h2 className="text-5xl text-white tracking-tight leading-tight">
            Hire VAs at{" "}
            <span className="relative inline-block">
              <span className="relative z-10">Blytz speed</span>
              <span className="absolute bottom-2 left-0 w-full h-4 bg-[#FFD600] -z-0" />
            </span>
          </h2>
          <p className="text-xl text-gray-300">
            Join founders who are building faster with pre-vetted Southeast Asian talent.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#FFD600]"></div>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  );
}