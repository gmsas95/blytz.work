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
import { getToken } from "@/lib/auth";

export default function EmployerOnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    country: "",
    industry: "",
    description: "",
    mission: "",
    website: "",
  });

  const validateForm = () => {
    const errors = [];

    if (!formData.name.trim()) {
      errors.push("Company name is required");
    } else if (formData.name.length < 2) {
      errors.push("Company name must be at least 2 characters");
    }

    if (!formData.country.trim()) {
      errors.push("Country is required");
    } else if (formData.country.length < 2) {
      errors.push("Country must be at least 2 characters");
    }

    if (!formData.industry.trim()) {
      errors.push("Industry is required");
    } else if (formData.industry.length < 2) {
      errors.push("Industry must be at least 2 characters");
    }

    if (formData.description.trim() && formData.description.length < 20) {
      errors.push("Company description must be at least 20 characters");
    }

    if (formData.mission.trim() && formData.mission.length < 10) {
      errors.push("Mission statement must be at least 10 characters");
    }

    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      toast.error("Please fix the following errors", {
        description: errors.join(", "),
      });
      return;
    }

    try {
      await apiCall('/company/profile', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name,
          country: formData.country,
          industry: formData.industry,
          description: formData.description,
          mission: formData.mission,
          website: formData.website,
        })
      });

      toast.success("Company profile created!", {
        description: "Welcome to BlytzWork as an Employer",
      });
      
      setTimeout(() => {
        router.push("/employer/dashboard");
      }, 500);
    } catch (error) {
      toast.error("Failed to create company profile", {
        description: "Please try again",
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
                {currentStep === 1 && "Let's start with the basics about your company"}
                {currentStep === 2 && "Help us understand your team and needs"}
                {currentStep === 3 && "Review your information and complete setup"}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {/* Step 1: Company Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Company Name *</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="e.g., Acme Technologies"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Country *</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    >
                      <option value="">Select a country</option>
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="GB">United Kingdom</option>
                      <option value="AU">Australia</option>
                      <option value="DE">Germany</option>
                      <option value="PH">Philippines</option>
                      <option value="IN">India</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Industry *</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    >
                      <option value="">Select an industry</option>
                      <option value="Technology">Technology</option>
                      <option value="Finance">Finance & Banking</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Education">Education</option>
                      <option value="Retail">Retail & E-commerce</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Real Estate">Real Estate</option>
                      <option value="Marketing">Marketing & Advertising</option>
                      <option value="Consulting">Consulting</option>
                      <option value="Legal">Legal Services</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Company Description</label>
                    <textarea
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black min-h-[120px]"
                      placeholder="Describe what your company does (at least 20 characters if provided)"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Mission Statement</label>
                    <textarea
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black min-h-[100px]"
                      placeholder="What's your company's mission? (at least 10 characters if provided)"
                      value={formData.mission}
                      onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Website (Optional)</label>
                    <input
                      type="url"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="https://www.yourcompany.com"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: About Team */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center py-8">
                    <Building className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold mb-2">Team Information Coming Soon</h3>
                    <p className="text-gray-600">
                      This section will include team size, structure, and specific requirements.
                      For now, continue to review your company profile.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
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
