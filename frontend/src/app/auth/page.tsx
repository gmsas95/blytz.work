// Complete Authentication Page
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase';
import { ChevronLeft, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAlert } from '@/components/ui/Alert';

type AuthMode = 'signin' | 'signup' | 'forgot';
type UserRole = 'company' | 'va';

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [role, setRole] = useState<UserRole>('company');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  const { 
    user, 
    signInWithGoogle, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    sendEmailVerification,
    sendPasswordReset
  } = useAuth();

  const { addAlert } = useAlert();

  // Redirect if already logged in
  useEffect(() => {
    if (user && user.emailVerified) {
      const redirectUrl = user.role === 'company' ? '/company/jobs' : '/va/profile';
      window.location.href = redirectUrl;
    }
  }, [user]);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const signedInUser = await signInWithGoogle();
      addAlert('success', `Welcome back, ${signedInUser.email}!`);
    } catch (error: any) {
      addAlert('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      addAlert('error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      
      if (mode === 'signin') {
        const signedInUser = await signInWithEmailAndPassword(
          formData.email, 
          formData.password
        );
        addAlert('success', `Welcome back, ${signedInUser.email}!`);
      } else {
        if (formData.password !== formData.confirmPassword) {
          addAlert('error', 'Passwords do not match');
          return;
        }

        if (!formData.agreeToTerms) {
          addAlert('error', 'Please agree to the terms of service');
          return;
        }

        const newUser = await createUserWithEmailAndPassword(
          formData.email, 
          formData.password, 
          role
        );
        addAlert('success', `Account created! Please check your email for verification.`);
        setMode('signin');
      }
    } catch (error: any) {
      addAlert('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email) {
      addAlert('error', 'Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      await sendPasswordReset(formData.email);
      addAlert('success', 'Password reset link sent to your email');
      setMode('signin');
    } catch (error: any) {
      addAlert('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!user) return;
    
    try {
      await sendEmailVerification();
      addAlert('success', 'Verification email sent! Please check your inbox.');
    } catch (error: any) {
      addAlert('error', error.message);
    }
  };

  return (
    <>
      <AlertContainer />
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Back Button */}
          <div className="mb-8">
            <button
              onClick={() => window.location.href = '/'}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Home
            </button>
          </div>

          {/* Auth Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Logo and Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {mode === 'forgot' ? 'Reset Password' : 
                 mode === 'signup' ? 'Create Account' : 'Sign In'}
              </h1>
              <p className="text-gray-600">
                {mode === 'forgot' ? 'Enter your email to receive a reset link' :
                 mode === 'signup' ? 'Join the Blytz Hire platform' :
                 'Welcome back to Blytz Hire'}
              </p>
            </div>

            {/* Email Verification Alert */}
            {user && !user.emailVerified && mode !== 'forgot' && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 mr-3" />
                  <div>
                    <p className="text-amber-800 font-medium">Email Verification Required</p>
                    <p className="text-amber-700 text-sm mt-1">
                      Please verify your email address to continue.
                    </p>
                    <button
                      onClick={handleResendVerification}
                      className="text-amber-800 text-sm font-medium hover:text-amber-900 mt-2"
                    >
                      Resend Verification Email
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Google Sign In */}
            {mode !== 'forgot' && (
              <div className="mb-6">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
              </div>
            )}

            {/* Divider */}
            {mode !== 'forgot' && (
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or</span>
                </div>
              </div>
            )}

            {/* Email Form */}
            {mode !== 'forgot' ? (
              <form onSubmit={handleEmailSignIn} className="space-y-4">
                {/* Role Selection for Sign Up */}
                {mode === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      I am a
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setRole('company')}
                        className={`px-4 py-2 rounded-lg border-2 font-medium transition-colors ${
                          role === 'company'
                            ? 'border-primary-600 bg-primary-50 text-primary-600'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        Company
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('va')}
                        className={`px-4 py-2 rounded-lg border-2 font-medium transition-colors ${
                          role === 'va'
                            ? 'border-primary-600 bg-primary-50 text-primary-600'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        Virtual Assistant
                      </button>
                    </div>
                  </div>
                )}

                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password for Sign Up */}
                {mode === 'signup' && (
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Confirm your password"
                      required
                    />
                  </div>
                )}

                {/* Terms Agreement for Sign Up */}
                {mode === 'signup' && (
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.agreeToTerms}
                        onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        required
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        I agree to the{' '}
                        <a href="/terms" className="text-primary-600 hover:text-primary-700">
                          Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="/privacy" className="text-primary-600 hover:text-primary-700">
                          Privacy Policy
                        </a>
                      </span>
                    </label>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 font-medium"
                >
                  {loading ? 'Please wait...' : 
                   mode === 'signup' ? 'Create Account' : 'Sign In'}
                </button>
              </form>
            ) : (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                {/* Email Input for Password Reset */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                {/* Reset Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 font-medium"
                >
                  {loading ? 'Please wait...' : 'Send Reset Link'}
                </button>
              </form>
            )}

            {/* Footer Links */}
            <div className="mt-6 text-center text-sm">
              {mode === 'signin' ? (
                <>
                  <span className="text-gray-600">Don't have an account? </span>
                  <button
                    onClick={() => setMode('signup')}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Sign up
                  </button>
                </>
              ) : mode === 'signup' ? (
                <>
                  <span className="text-gray-600">Already have an account? </span>
                  <button
                    onClick={() => setMode('signin')}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Sign in
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setMode('signin')}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Back to Sign In
                </button>
              )}
            </div>

            {/* Forgot Password Link */}
            {mode === 'signin' && (
              <div className="mt-4 text-center text-sm">
                <button
                  onClick={() => setMode('forgot')}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Forgot your password?
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}