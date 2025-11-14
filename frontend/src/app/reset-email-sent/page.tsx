"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function EmailSentPage() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    // Get email from URL params or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="flex items-center justify-center min-h-[calc(100vh-80px)] py-20">
        <div className="container mx-auto px-6 max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/forgot-password" className="inline-flex items-center text-gray-600 hover:text-black mb-8">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Forgot Password
            </Link>
            
            <div className="w-20 h-20 bg-[#FFD600] rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-black" />
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-black tracking-tight mb-4">
              Reset Link Sent!
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              We've sent password reset instructions to <strong>{email}</strong>. 
              Please check your inbox and follow the link to reset your password.
            </p>
          </div>

          {/* Email Details */}
          <Card className="w-full">
            <CardContent className="text-center py-8">
              <div className="text-sm text-gray-500 space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>Reset instructions sent to:</span>
                </div>
                <div className="font-medium text-black bg-gray-100 rounded-lg px-4 py-3">
                  {email}
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6 mt-6 space-y-3">
                <h3 className="font-semibold text-black mb-3">What happens next?</h3>
                <ul className="text-sm text-gray-600 space-y-2 text-left">
                  <li>• Check your email inbox (including spam folder)</li>
                  <li>• Click the reset link within 24 hours</li>
                  <li>• Create a new password</li>
                  <li>• Sign in with your new password</li>
                </ul>
              </div>
              
              <div className="space-y-3 pt-6">
                <Button asChild variant="outline" className="w-full mb-3">
                  <Link href="mailto:support@blytzhire.com">
                    Contact Support
                  </Link>
                </Button>
                
                <Button asChild className="w-full bg-[#FFD600] hover:bg-[#FFD600]/90 text-black">
                  <Link href="https://hyred.blytz.app/auth">
                    Back to Login
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}