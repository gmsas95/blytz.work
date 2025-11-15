"use client";

import { Button } from "@/components/ui/button";
import { Zap, Briefcase, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function SelectRolePage() {
  const router = useRouter();
  const { user } = useAuth();

  const handleRoleSelect = async (role: "employer" | "va") => {
    if (!user) {
      toast.error("Please sign in first");
      router.push("/auth");
      return;
    }

    try {
      // TODO: Store role preference in Firebase/Firestore
      console.log("Selected role:", role);
      
      toast.success(`Welcome as ${role === "employer" ? "Employer" : "Virtual Assistant"}!`, {
        description: "Redirecting to your dashboard...",
      });

      // Store role in localStorage for now (will be replaced with Firebase)
      localStorage.setItem("userRole", role);
      
      // Redirect to appropriate dashboard
      if (role === "employer") {
        router.push("/employer/dashboard");
      } else {
        router.push("/va/dashboard");
      }
    } catch (error) {
      toast.error("Failed to set role. Please try again.");
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

        <div className="grid md:grid-cols-2 gap-8">
          {/* Employer Card */}
          <motion.div
            className="group relative p-10 rounded-2xl border-2 border-gray-200 hover:border-black transition-all bg-white cursor-pointer"
            whileHover={{ y: -8 }}
            onClick={() => handleRoleSelect("employer")}
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

              <Button className="w-full bg-black text-[#FFD600] hover:bg-gray-900 mt-6" size="lg">
                Continue as Employer
              </Button>
            </div>
          </motion.div>

          {/* VA Card */}
          <motion.div
            className="group relative p-10 rounded-2xl border-2 border-gray-200 hover:border-black transition-all bg-white cursor-pointer"
            whileHover={{ y: -8 }}
            onClick={() => handleRoleSelect("va")}
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

              <Button className="w-full bg-black text-[#FFD600] hover:bg-gray-900 mt-6" size="lg">
                Continue as VA
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}