"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInUser, registerUser, getAuthErrorMessage } from "@/lib/auth";
import { getToken, setupTokenRefresh } from "@/lib/auth-utils";
import { apiCall } from "@/lib/api";
import { toast } from "sonner";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    username: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const checkUserProfileWithRetry = async (retries = 2): Promise<{ role: string | null; needsOnboarding: boolean }> => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        console.log(`Checking user profile (attempt ${attempt + 1}/${retries + 1})...`);
        
        const profileResponse = await Promise.race([
          apiCall('/auth/profile'),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('API call timeout')), 10000)
          )
        ]) as Response;
        
        console.log('Profile response status:', profileResponse.status);
        
        if (profileResponse.status === 200) {
          const userData = await profileResponse.json();
          const role = userData.data.role;
          console.log('User role from backend:', role);
          
          if (role === 'company') {
            localStorage.setItem("userRole", "employer");
            try {
              const companyResponse = await Promise.race([
                apiCall('/company/profile'),
                new Promise<never>((_, reject) => 
                  setTimeout(() => reject(new Error('API call timeout')), 5000)
                )
              ]) as Response;
              
              return { role, needsOnboarding: !companyResponse.ok };
            } catch {
              return { role, needsOnboarding: true };
            }
          } else if (role === 'va') {
            localStorage.setItem("userRole", "va");
            try {
              const vaResponse = await Promise.race([
                apiCall('/va/profile'),
                new Promise<never>((_, reject) => 
                  setTimeout(() => reject(new Error('API call timeout')), 5000)
                )
              ]) as Response;
              
              return { role, needsOnboarding: !vaResponse.ok };
            } catch {
              return { role, needsOnboarding: true };
            }
          } else {
            return { role: null, needsOnboarding: false };
          }
        } else if (profileResponse.status === 404) {
          console.log('User not found in backend (404)');
          return { role: null, needsOnboarding: true };
        } else {
          const errorText = await profileResponse.text().catch(() => 'Unknown error');
          throw new Error(`Backend returned ${profileResponse.status}: ${errorText}`);
        }
      } catch (error: any) {
        if (attempt < retries) {
          console.log(`Retrying profile check after error: ${error.message}`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          throw error;
        }
      }
    }
    throw new Error('Failed to check user profile after all retries');
  };

  const createUserInBackend = async (authUser: any): Promise<void> => {
    const createUserWithRetry = async (retries = 2): Promise<void> => {
      try {
        const response = await apiCall('/auth/create', {
          method: 'POST',
          body: JSON.stringify({
            uid: authUser.uid,
            email: formData.email,
            name: authUser.displayName || formData.email.split('@')[0],
            username: authUser.displayName || formData.email.split('@')[0],
            role: null
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
          throw new Error(errorData.message || `Backend returned ${response.status}`);
        }
      } catch (apiError: any) {
        if (retries > 0) {
          console.log(`Retrying user creation, attempts left: ${retries}`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return createUserWithRetry(retries - 1);
        }
        throw apiError;
      }
    };

    await createUserWithRetry();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    setRetryCount(0);

    try {
      if (isLogin) {
        const authUser = await signInUser(formData.email, formData.password);
        
        const token = await getToken();
        if (!token) {
          throw new Error('Failed to get authentication token');
        }
        
        toast.success(`Welcome back!`, {
          description: "Successfully signed in to your account",
        });
        
        try {
          const { role, needsOnboarding } = await checkUserProfileWithRetry(2);
          
          if (role === 'company') {
            router.push(needsOnboarding ? "/employer/onboarding" : "/employer/dashboard");
          } else if (role === 'va') {
            router.push(needsOnboarding ? "/va/onboarding" : "/va/dashboard");
          } else {
            router.push("/select-role");
          }
        } catch (profileError: any) {
          console.error('Error checking user profile:', profileError);
          
          if (profileError.message.includes('timeout')) {
            setError('Connection is slow. Please try again.');
            toast.error('Connection slow', {
              description: 'Please check your internet connection and try again',
            });
          } else {
            setError(`Failed to load your profile: ${profileError.message}`);
            toast.error('Profile check failed', {
              description: profileError.message,
            });
          }
        }
      } else {
        const authUser = await registerUser(formData.email, formData.password, formData.name);
        
        const token = await getToken();
        if (!token) {
          throw new Error('Failed to get authentication token');
        }
        
        if (authUser.uid) {
          try {
            await createUserInBackend(authUser);
            
            toast.success(`Account created!`, {
              description: "Welcome to BlytzWork",
            });
            
            router.push("/select-role");
          } catch (apiError: any) {
            const errorMessage = apiError.message || 'Failed to create your account. Please try again.';
            
            try {
              const { signOut } = await import('firebase/auth');
              const { auth } = await import('@/lib/firebase-safe');
              await signOut(auth());
            } catch (signOutError) {
              console.error('Failed to sign out:', signOutError);
            }
            
            setError(errorMessage);
            toast.error("Account creation failed", {
              description: errorMessage,
            });
            return;
          }
        }
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
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md space-y-2">
                <p>{error}</p>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setRetryCount(prev => prev + 1);
                  }}
                  className="text-sm font-medium underline hover:no-underline"
                  disabled={isLoading}
                >
                  Try again
                </button>
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

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
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