"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic email validation
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }
    
      try {
      // API call to check if email exists and send reset
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setIsSubmitted(true);
        setError("");
      } else {
        setError(data.message || "Failed to send reset link");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Password reset error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="flex items-center justify-center min-h-[calc(100vh-80px)] py-20">
        <div className="container mx-auto px-6 max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="https://hyred.blytz.app/auth" className="inline-flex items-center text-gray-600 hover:text-black mb-8">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Link>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-black tracking-tight mb-4">
              Forgot Your Password?
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              No worries! Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {!isSubmitted ? (
            /* Forgot Password Form */
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-center">Reset Password</CardTitle>
                <CardDescription className="text-center">
                  We'll email you instructions to reset your password
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="text-red-600 text-sm mb-4 p-3 bg-red-50 rounded-lg">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
                    disabled={!email.trim()}
                  >
                    Send Reset Link
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            /* Success Message */
            <Card className="w-full">
              <CardContent className="text-center py-12">
                <div className="w-20 h-20 bg-[#FFD600] rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-black" />
                </div>
                
                <h2 className="text-2xl font-bold text-black mb-4">
                  Reset Link Sent!
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  We've sent password reset instructions to <strong>{email}</strong>. 
                  Please check your inbox and follow the link to reset your password.
                </p>
                <div className="text-sm text-gray-500 space-y-2">
                  <p>• The reset link will expire in 24 hours</p>
                  <p>• If you don't receive the email, check your spam folder</p>
                  <p>• Having trouble? Contact support@blytzhire.com</p>
                </div>
                
                <div className="space-y-3 pt-6">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="https://hyred.blytz.app/auth">
                      Back to Login
                    </Link>
                  </Button>
                  
                  <Button asChild className="w-full bg-[#FFD600] hover:bg-[#FFD600]/90 text-black">
                    <Link href="mailto:support@blytzhire.com">
                      Contact Support
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Help */}
          <div className="text-center mt-8">
            <p className="text-gray-600">
              Remember your password?{" "}
              <Link href="https://hyred.blytz.app/auth" className="text-[#FFD600] hover:text-[#FFD600]/80 font-medium transition-colors">
                Back to Login
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}