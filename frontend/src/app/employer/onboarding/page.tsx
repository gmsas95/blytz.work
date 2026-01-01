"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Building, Users, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { apiCall } from "@/lib/api";

export default function EmployerOnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    country: "",
    industry: "",
    description: "",
    website: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.name.trim()) {
      errors.push("Company name is required");
    }
    if (!formData.country.trim()) {
      errors.push("Country is required");
    }
    if (!formData.industry) {
      errors.push("Industry is required");
    }
    if (!formData.description.trim()) {
      errors.push("Company description is required");
    }

    return errors;
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      toast.error("Please fix the following errors", {
        description: validationErrors.join(", "),
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const companyResponse = await apiCall('/company/profile', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name,
          country: formData.country,
          industry: formData.industry,
          description: formData.description,
          website: formData.website,
        })
      });

      const companyData = await companyResponse.json();

      if (!companyData.success) {
        throw new Error(companyData.error || "Failed to create company profile");
      }

      try {
        await apiCall('/auth/profile', {
          method: 'PUT',
          body: JSON.stringify({
            role: 'company',
            profileComplete: true,
          })
        });
      } catch (roleError) {
        console.error("Failed to update user role:", roleError);
        toast.warning("Company profile created, but role update failed", {
          description: "You may need to contact support to fix your account role",
        });
      }

      toast.success("Company profile created!", {
        description: "Welcome to BlytzWork as an Employer",
      });

      router.push("/employer/dashboard");
    } catch (error: any) {
      console.error("Company creation error:", error);
      
      const errorMessage = error?.details || error?.message || "Failed to create company profile";
      const errorCode = error?.code;
      
      if (errorCode === "VALIDATION_ERROR") {
        toast.error("Validation error", {
          description: "Please check all required fields and try again",
        });
      } else if (errorCode === "COMPANY_EXISTS") {
        toast.error("Company already exists", {
          description: "You already have a company profile",
        });
      } else if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
        toast.error("Network error", {
          description: "Please check your connection and try again",
        });
      } else {
        toast.error("Failed to create company profile", {
          description: errorMessage,
        });
      }
    } finally {
      setIsSubmitting(false);
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
                <Building className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Company Info</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 2 ? 'bg-black text-[#FFD600]' : 'bg-gray-200'
              }`}>
                <Users className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">About Your Team</span>
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
                {currentStep === 1 && "Company Information"}
                {currentStep === 2 && "Tell us about your team"}
                {currentStep === 3 && "Review & Complete"}
              </CardTitle>
              <CardDescription>
                {currentStep === 1 && "Help us understand your company and what you do"}
                {currentStep === 2 && "Let us know what kind of talent you're looking for"}
                {currentStep === 3 && "Review your company profile and start hiring"}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Company Name</label>
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-black focus:ring-[#FFD600]"
                      placeholder="Acme Corp"
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
                    <label className="block text-sm font-medium mb-2">Industry</label>
                    <select
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-black focus:ring-[#FFD600]"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    >
                      <option value="">Select an industry</option>
                      <option value="technology">Technology</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="finance">Finance</option>
                      <option value="ecommerce">E-commerce</option>
                      <option value="education">Education</option>
                      <option value="consulting">Consulting</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Website (Optional)</label>
                    <input
                      type="url"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-black focus:ring-[#FFD600]"
                      placeholder="https://example.com"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Company Description</label>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-black focus:ring-[#FFD600]"
                      rows={6}
                      placeholder="Describe your company, culture, and what makes it a great place to work..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Team Size</label>
                    <select className="w-full p-3 border border-gray-300 rounded-lg focus:border-black focus:ring-[#FFD600]">
                      <option value="">Select team size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201+">201+ employees</option>
                    </select>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-semibold mb-4">Company Profile Review</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600">Company Name:</span>
                        <p className="text-sm">{formData.name || "Not provided"}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Industry:</span>
                        <p className="text-sm">{formData.industry || "Not selected"}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Description:</span>
                        <p className="text-sm">{formData.description || "Not provided"}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Website:</span>
                        <p className="text-sm">{formData.website || "Not provided"}</p>
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
                    <Button 
                      onClick={handleSubmit} 
                      disabled={isSubmitting}
                      className="bg-black text-[#FFD600] hover:bg-gray-900"
                    >
                      {isSubmitting ? "Creating Profile..." : "Complete Setup"}
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