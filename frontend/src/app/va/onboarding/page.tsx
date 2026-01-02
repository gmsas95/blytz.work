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

  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.name.trim()) {
        toast.error("Name is required", {
          description: "Please enter your full name",
        });
        return;
      }

      if (!formData.country || !formData.country.trim()) {
        toast.error("Country is required", {
          description: "Please enter your country",
        });
        return;
      }

      if (!formData.bio || !formData.bio.trim()) {
        toast.error("Bio is required", {
          description: "Please provide a professional bio",
        });
        return;
      }

      if (!formData.skills || !formData.skills.trim()) {
        toast.error("Skills are required", {
          description: "Please list at least one skill",
        });
        return;
      }

      if (!formData.hourlyRate || isNaN(parseInt(formData.hourlyRate))) {
        toast.error("Hourly rate is required", {
          description: "Please enter a valid hourly rate",
        });
        return;
      }

      const hourlyRate = parseInt(formData.hourlyRate);
      if (hourlyRate <= 0) {
        toast.error("Invalid hourly rate", {
          description: "Hourly rate must be greater than 0",
        });
        return;
      }

      const skillsArray = formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
      if (skillsArray.length === 0) {
        toast.error("Invalid skills", {
          description: "Please enter valid skills separated by commas",
        });
        return;
      }

      await apiCall('/va/profile', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name.trim(),
          country: formData.country.trim(),
          bio: formData.bio.trim(),
          skills: skillsArray,
          hourlyRate,
          availability: formData.availability,
        })
      });

      await apiCall('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          role: 'va',
          profileComplete: true,
        })
      });

      try {
      } catch (roleError) {
        console.error("Failed to update user role:", roleError);
      }

      toast.success("Profile created successfully!", {
        description: "Welcome to BlytzWork as a Virtual Assistant",
      });

      router.push("/va/dashboard");
    } catch (error: any) {
      console.error("Profile creation error:", error);
      
      const errorMessage = error?.message || "Unknown error occurred";
      const errorCode = error?.code || "UNKNOWN_ERROR";
      
      let errorDescription = "Please check your input and try again";
      
      if (errorCode === "VALIDATION_ERROR") {
        errorDescription = "Please review your form for errors";
      } else if (errorCode === "NETWORK_ERROR") {
        errorDescription = "Please check your internet connection";
      } else if (errorCode === "AUTH_ERROR") {
        errorDescription = "Please sign in again";
      }
      
      toast.error("Failed to create profile", {
        description: errorDescription,
      });
    }
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
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