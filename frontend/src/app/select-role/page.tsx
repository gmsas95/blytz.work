"use client";

import { Button } from "@/components/ui/button";
import { Zap, Briefcase, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { apiCall } from "@/lib/api";
import { useState } from "react";

export default function SelectRolePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<"employer" | "va" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleSelect = async (role: "employer" | "va") => {
    if (!user) {
      toast.error("Please sign in first");
      router.push("/auth");
      return;
    }

    setSelectedRole(role);
    setIsLoading(true);
    setError(null);

    try {
      // Store role in localStorage as backup first
      localStorage.setItem("userRole", role);

      // Update role in backend
      const backendRole = role === 'employer' ? 'company' : 'va';
      const response = await apiCall('/auth/profile', {
        method: 'PUT', 
        body: JSON.stringify({ role: backendRole })
      });
      
      toast.success(`Welcome as ${role === "employer" ? "Employer" : "Virtual Assistant"}!`, {
        description: "Redirecting to your dashboard...",
      });
      
      // Redirect to appropriate onboarding
      setTimeout(() => {
        if (role === "employer") {
          router.push("/employer/onboarding");
        } else {
          router.push("/va/onboarding");
        }
      }, 1000);
      
    } catch (err: any) {
      setIsLoading(false);
      setSelectedRole(null);
      
      let errorMessage = "Failed to set role. Please try again.";
      
      if (err?.message?.includes('fetch') || err?.name === 'TypeError') {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (err?.status === 401 || err?.response?.status === 401) {
        errorMessage = "Session expired. Please sign in again.";
        localStorage.removeItem("userRole");
        setTimeout(() => router.push("/auth"), 2000);
      } else if (err?.status === 403 || err?.response?.status === 403) {
        errorMessage = "Permission denied. Please contact support.";
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleRetry = () => {
    if (selectedRole) {
      handleRoleSelect(selectedRole);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:3rem_3rem]" />
      <div className="absolute top-20 right-20 w-96 h-96 bg-[#FFD600] rounded-full blur-[120px] opacity-20" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#FFD600] rounded-full blur-[120px] opacity-20" />

      <div className="relative w-full max-w-5xl space-y-12">
        <div className="text-center space-y-4">
          <a href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-lg bg-black flex items-center justify-center">
              <Zap className="w-7 h-7 text-[#FFD600]" fill="#FFD600" />
            </div>
            <span className="text-2xl text-black tracking-tight">BlytzWork</span>
          </a>
          <h1 className="text-5xl lg:text-6xl text-black tracking-tight">
            What brings you to BlytzWork?
          </h1>
          <p className="text-xl text-gray-600">Choose your role to get started</p>
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border-2 border-red-200 rounded-xl p-6 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-red-900">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
            <Button
              onClick={handleRetry}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              Try Again
            </Button>
          </motion.div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Employer Card */}
          <motion.div
            className={`group relative p-10 rounded-2xl border-2 transition-all bg-white cursor-pointer ${
              isLoading && selectedRole === 'employer' ? 'border-black opacity-60 cursor-not-allowed' : 'border-gray-200 hover:border-black'
            }`}
            whileHover={isLoading && selectedRole === 'employer' ? {} : { y: -8 }}
            onClick={() => !isLoading && handleRoleSelect("employer")}
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-[#FFD600] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-t-2xl" />
            
            <div className="space-y-6">
              <div className="w-20 h-20 rounded-2xl bg-black group-hover:bg-[#FFD600] flex items-center justify-center transition-all">
                <Briefcase className="w-10 h-10 text-[#FFD600] group-hover:text-black transition-all" />
              </div>
              
              <div className="space-y-3">
                <h2 className="text-4xl text-black tracking-tight">I want to hire</h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  I'm a founder, entrepreneur, or business owner looking to hire virtual assistants.
                </p>
              </div>

              <ul className="space-y-3 pt-4">
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 rounded-full bg-[#FFD600]" />
                  Browse pre-vetted VAs
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 rounded-full bg-[#FFD600]" />
                  Swipe-based hiring
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 rounded-full bg-[#FFD600]" />
                  Weekly contracts from $8/hr
                </li>
              </ul>

              <Button 
                className="w-full bg-black text-[#FFD600] hover:bg-gray-900 mt-6" 
                size="lg"
                disabled={isLoading && selectedRole === 'employer'}
              >
                {isLoading && selectedRole === 'employer' ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#FFD600]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Setting up your account...
                  </>
                ) : "Continue as Employer"}
              </Button>
            </div>
          </motion.div>

          {/* VA Card */}
          <motion.div
            className={`group relative p-10 rounded-2xl border-2 transition-all bg-white cursor-pointer ${
              isLoading && selectedRole === 'va' ? 'border-black opacity-60 cursor-not-allowed' : 'border-gray-200 hover:border-black'
            }`}
            whileHover={isLoading && selectedRole === 'va' ? {} : { y: -8 }}
            onClick={() => !isLoading && handleRoleSelect("va")}
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-[#FFD600] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-t-2xl" />
            
            <div className="space-y-6">
              <div className="w-20 h-20 rounded-2xl bg-black group-hover:bg-[#FFD600] flex items-center justify-center transition-all">
                <Users className="w-10 h-10 text-[#FFD600] group-hover:text-black transition-all" />
              </div>
              
              <div className="space-y-3">
                <h2 className="text-4xl text-black tracking-tight">I want to work</h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  I'm a virtual assistant looking to work with international clients and build my career.
                </p>
              </div>

              <ul className="space-y-3 pt-4">
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 rounded-full bg-[#FFD600]" />
                  Get matched with top founders
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 rounded-full bg-[#FFD600]" />
                  Flexible weekly contracts
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 rounded-full bg-[#FFD600]" />
                  Secure payment processing
                </li>
              </ul>

              <Button 
                className="w-full bg-black text-[#FFD600] hover:bg-gray-900 mt-6" 
                size="lg"
                disabled={isLoading && selectedRole === 'va'}
              >
                {isLoading && selectedRole === 'va' ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#FFD600]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Setting up your account...
                  </>
                ) : "Continue as VA"}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}