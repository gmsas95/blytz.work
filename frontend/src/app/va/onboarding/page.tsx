"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, User, Briefcase, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { apiCall } from "@/lib/api";
import { getToken } from "@/lib/auth";

export default function VAOnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    country: "",
    bio: "",
    skills: "",
    hourlyRate: "",
    availability: true,
  });

  const validateForm = () => {
    const errors = [];
    
    if (formData.name.length < 2) {
      errors.push("Name must be at least 2 characters");
    }
    
    if (formData.country.length < 2) {
      errors.push("Country must be at least 2 characters");
    }
    
    if (formData.bio.length < 10) {
      errors.push("Bio must be at least 10 characters");
    }
    
    if (!formData.skills.trim()) {
      errors.push("At least one skill is required");
    }
    
    if (!formData.hourlyRate || parseInt(formData.hourlyRate) <= 0) {
      errors.push("Hourly rate must be greater than 0");
    }
    
    return errors;
  };

  const handleSubmit = async () => {
    try {
      // Validate form first
      const errors = validateForm();
      if (errors.length > 0) {
        toast.error("Please fix the following errors", {
          description: errors.join(", "),
        });
        return;
      }

      // Ensure we have a fresh token before making API call
      const token = await getToken();
      if (!token) {
        toast.error("Authentication error", {
          description: "Please sign in again",
        });
        router.push("/auth");
        return;
      }

      // Create VA profile
      await apiCall('/va/profile', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name,
          country: formData.country,
          bio: formData.bio,
          skills: formData.skills.split(',').map(skill => skill.trim()),
          hourlyRate: parseInt(formData.hourlyRate),
          availability: formData.availability,
        })
      });

      toast.success("Profile created successfully!", {
        description: "Welcome to BlytzWork as a Virtual Assistant",
      });

      console.log('Profile created successfully');
      
      // Sync user role before redirecting
      await syncUserRole('va');
      
      // Add a small delay to ensure profile is created before redirecting
      setTimeout(() => {
        router.push("/va/dashboard");
      }, 1000);
    } catch (error) {
      console.error('VA Profile creation error:', error);
      toast.error("Failed to create profile", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    }
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const syncUserRole = async (role: 'company' | 'va') => {
    const token = await getToken();
    if (!token) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role })
      });
      
      if (response.ok) {
        console.log('✅ User role updated to:', role);
        const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
        authUser.role = role;
        localStorage.setItem('authUser', JSON.stringify(authUser));
      }
    } catch (error) {
      console.error('Failed to update user role:', error);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="absolute top-20 right-20 w-96 h-96 bg-[#FFD600] rounded-full blur-[120px] opacity-20" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#FFD600] rounded-full blur-[120px] opacity-20" />

      <div className="relative w-full max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 1 ? 'bg-black text-[#FFD600]' : 'bg-gray-200'
              }`}>
                <User className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">About You</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 2 ? 'bg-black text-[#FFD600]' : 'bg-gray-200'
              }`}>
                <Briefcase className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Skills & Rate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 3 ? 'bg-black text-[#FFD600]' : 'bg-gray-200'
              }`}>
                <CheckCircle className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Complete</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-black h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Onboarding Steps */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader className="text-center">
              <a href="/" className="inline-flex items-center gap-2 mb-4">
                <div className="w-12 h-12 rounded-lg bg-black flex items-center justify-center">
                  <Zap className="w-7 h-7 text-[#FFD600]" fill="#FFD600" />
                </div>
                <span className="text-2xl text-black tracking-tight">BlytzWork</span>
              </a>
              <CardTitle className="text-3xl">
                {currentStep === 1 && "Tell us about yourself"}
                {currentStep === 2 && "Skills & Hourly Rate"}
                {currentStep === 3 && "Review & Complete"}
              </CardTitle>
              <CardDescription>
                {currentStep === 1 && "Help clients understand who you are and what you do"}
                {currentStep === 2 && "Showcase your skills and set your rates"}
                {currentStep === 3 && "Review your profile and start getting hired"}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-black focus:ring-[#FFD600]"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Country</label>
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-black focus:ring-[#FFD600]"
                      placeholder="United States"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Professional Bio</label>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-black focus:ring-[#FFD600]"
                      rows={6}
                      placeholder="Describe your experience, expertise, and what makes you a great virtual assistant..."
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Skills</label>
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-black focus:ring-[#FFD600]"
                      placeholder="e.g., Social Media Management, Customer Service, Data Entry (comma-separated)"
                      value={formData.skills}
                      onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Hourly Rate (USD)</label>
                    <input
                      type="number"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-black focus:ring-[#FFD600]"
                      placeholder="25"
                      value={formData.hourlyRate}
                      onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="availability"
                      checked={formData.availability}
                      onChange={(e) => setFormData({ ...formData, availability: e.target.checked })}
                    />
                    <label htmlFor="availability">I am available for new projects</label>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-semibold mb-4">Profile Review</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600">Bio:</span>
                        <p className="text-sm">{formData.bio || "Not provided"}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Skills:</span>
                        <p className="text-sm">{formData.skills || "Not provided"}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Hourly Rate:</span>
                        <p className="text-sm">${formData.hourlyRate || "Not set"}/hour</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Available:</span>
                        <p className="text-sm">{formData.availability ? "Yes" : "No"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-6">
                {currentStep > 1 && (
                  <Button variant="outline" onClick={prevStep}>
                    Previous
                  </Button>
                )}
                <div className="ml-auto">
                  {currentStep < 3 ? (
                    <Button onClick={nextStep} className="bg-black text-[#FFD600] hover:bg-gray-900">
                      Continue
                    </Button>
                  ) : (
                    <Button onClick={handleSubmit} className="bg-black text-[#FFD600] hover:bg-gray-900">
                      Complete Setup
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}