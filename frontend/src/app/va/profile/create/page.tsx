'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { AlertContainer, useAlert } from "@/components/ui/Alert";
import Navbar from "@/components/Navbar";

interface VAProfileData {
  name: string;
  bio: string;
  country: string;
  hourlyRate: number;
  skills: string[];
  availability: boolean;
  email: string;
  phone: string;
  timezone: string;
  languages: Array<{ code: string; level: string }>;
  workExperience: Array<{
    company: string;
    role: string;
    years: number;
    description?: string;
    achievements?: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field?: string;
    startDate: string;
    endDate?: string;
    gpa?: number;
    achievements?: string[];
  }>;
}

const commonSkills = [
  "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Python", "Java", "C++",
  "HTML/CSS", "Vue.js", "Angular", "Swift", "Kotlin", "Go", "Ruby", "PHP",
  "Data Analysis", "Machine Learning", "DevOps", "AWS", "Docker", "Kubernetes",
  "MongoDB", "PostgreSQL", "MySQL", "Project Management", "Agile", "Scrum",
  "Content Writing", "Copywriting", "SEO", "Social Media Marketing", "Email Marketing",
  "Graphic Design", "UI/UX Design", "Video Editing", "Translation", "Customer Support",
  "Virtual Assistance", "Bookkeeping", "Data Entry", "Research", "Telemarketing"
];

const timezones = [
  "UTC-12:00 (Baker Island)", "UTC-11:00 (American Samoa)", "UTC-10:00 (Hawaii)",
  "UTC-09:00 (Alaska)", "UTC-08:00 (Pacific)", "UTC-07:00 (Mountain)",
  "UTC-06:00 (Central)", "UTC-05:00 (Eastern)", "UTC-04:00 (Atlantic)",
  "UTC-03:00 (Buenos Aires)", "UTC-02:00 (Mid-Atlantic)", "UTC-01:00 (Azores)",
  "UTC+00:00 (London)", "UTC+01:00 (Paris)", "UTC+02:00 (Cairo)",
  "UTC+03:00 (Moscow)", "UTC+04:00 (Dubai)", "UTC+05:00 (Karachi)",
  "UTC+05:30 (India)", "UTC+06:00 (Dhaka)", "UTC+07:00 (Bangkok)",
  "UTC+08:00 (Beijing)", "UTC+09:00 (Tokyo)", "UTC+10:00 (Sydney)",
  "UTC+11:00 (Solomon Islands)", "UTC+12:00 (Auckland)"
];

const languageLevels = ['basic', 'conversational', 'fluent', 'native'];

export default function CreateVAProfile() {
  const router = useRouter();
  const { user } = useAuth();
  const { showAlert, Alert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [customSkill, setCustomSkill] = useState('');
  
  const [formData, setFormData] = useState<VAProfileData>({
    name: '',
    bio: '',
    country: '',
    hourlyRate: 25,
    skills: [],
    availability: true,
    email: user?.email || '',
    phone: '',
    timezone: '',
    languages: [],
    workExperience: [],
    education: []
  });

  const handleInputChange = (field: keyof VAProfileData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = (skill: string) => {
    if (!formData.skills.includes(skill)) {
      handleInputChange('skills', [...formData.skills, skill]);
    }
  };

  const removeSkill = (skill: string) => {
    handleInputChange('skills', formData.skills.filter(s => s !== skill));
  };

  const addLanguage = () => {
    handleInputChange('languages', [
      ...formData.languages,
      { code: '', level: 'conversational' }
    ]);
  };

  const updateLanguage = (index: number, field: string, value: string) => {
    const updated = [...formData.languages];
    updated[index] = { ...updated[index], [field]: value };
    handleInputChange('languages', updated);
  };

  const removeLanguage = (index: number) => {
    handleInputChange('languages', formData.languages.filter((_, i) => i !== index));
  };

  const addWorkExperience = () => {
    handleInputChange('workExperience', [
      ...formData.workExperience,
      { company: '', role: '', years: 0, description: '', achievements: [] }
    ]);
  };

  const updateWorkExperience = (index: number, field: string, value: any) => {
    const updated = [...formData.workExperience];
    updated[index] = { ...updated[index], [field]: value };
    handleInputChange('workExperience', updated);
  };

  const removeWorkExperience = (index: number) => {
    handleInputChange('workExperience', formData.workExperience.filter((_, i) => i !== index));
  };

  const addEducation = () => {
    handleInputChange('education', [
      ...formData.education,
      { institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: 0, achievements: [] }
    ]);
  };

  const updateEducation = (index: number, field: string, value: any) => {
    const updated = [...formData.education];
    updated[index] = { ...updated[index], [field]: value };
    handleInputChange('education', updated);
  };

  const removeEducation = (index: number) => {
    handleInputChange('education', formData.education.filter((_, i) => i !== index));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.name && formData.bio && formData.country && formData.hourlyRate > 0);
      case 2:
        return formData.skills.length > 0;
      case 3:
        return !!(formData.email && formData.timezone);
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(Math.min(currentStep + 1, 4));
    } else {
      showAlert('Please fill in all required fields for this step', 'error');
    }
  };

  const prevStep = () => {
    setCurrentStep(Math.max(currentStep - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      showAlert('Please fill in all required fields', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/va/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create profile');
      }

      showAlert('Profile created successfully!', 'success');
      
      // Update user profile completion status
      await fetch('/api/user/profile-complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      setTimeout(() => {
        router.push('/va/profile');
      }, 2000);
    } catch (error: any) {
      showAlert(error.message || 'Failed to create profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <AlertContainer />
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your VA Profile</h1>
              <p className="text-gray-600">Complete your profile to start getting matched with clients</p>
              
              {/* Progress Steps */}
              <div className="mt-6 flex items-center justify-between">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {step}
                    </div>
                    {step < 4 && (
                      <div className={`w-24 h-1 mx-2 ${
                        currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Professional Bio *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe your professional experience, expertise, and what makes you a great VA..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="United States"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hourly Rate (USD) *
                    </label>
                    <input
                      type="number"
                      required
                      min="5"
                      max="200"
                      value={formData.hourlyRate}
                      onChange={(e) => handleInputChange('hourlyRate', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="25"
                    />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills & Expertise</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Skills *
                    </label>
                    <div className="mb-4">
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={customSkill}
                          onChange={(e) => setCustomSkill(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && customSkill.trim()) {
                              e.preventDefault();
                              addSkill(customSkill.trim());
                              setCustomSkill('');
                            }
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Type a skill and press Enter"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (customSkill.trim()) {
                              addSkill(customSkill.trim());
                              setCustomSkill('');
                            }
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Add
                        </button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {commonSkills.map((skill) => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => {
                              if (formData.skills.includes(skill)) {
                                removeSkill(skill);
                              } else {
                                addSkill(skill);
                              }
                            }}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                              formData.skills.includes(skill)
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {skill}
                          </button>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {formData.skills.map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => removeSkill(skill)}
                              className="ml-2 text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.availability}
                        onChange={(e) => handleInputChange('availability', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        I am currently available for work
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact & Languages</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone *
                    </label>
                    <select
                      required
                      value={formData.timezone}
                      onChange={(e) => handleInputChange('timezone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select your timezone</option>
                      {timezones.map((tz) => (
                        <option key={tz} value={tz}>{tz}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Languages
                    </label>
                    <div className="space-y-2">
                      {formData.languages.map((lang, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={lang.code}
                            onChange={(e) => updateLanguage(index, 'code', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Language (e.g., English, Spanish)"
                          />
                          <select
                            value={lang.level}
                            onChange={(e) => updateLanguage(index, 'level', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {languageLevels.map((level) => (
                              <option key={level} value={level}>
                                {level.charAt(0).toUpperCase() + level.slice(1)}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => removeLanguage(index)}
                            className="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addLanguage}
                        className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                      >
                        Add Language
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Experience & Education</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Work Experience
                    </label>
                    <div className="space-y-4">
                      {formData.workExperience.map((exp, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={exp.company}
                              onChange={(e) => updateWorkExperience(index, 'company', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Company Name"
                            />
                            <input
                              type="text"
                              value={exp.role}
                              onChange={(e) => updateWorkExperience(index, 'role', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Job Title"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="number"
                              value={exp.years}
                              onChange={(e) => updateWorkExperience(index, 'years', parseInt(e.target.value) || 0)}
                              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Years"
                              min="0"
                              max="50"
                            />
                            <button
                              type="button"
                              onClick={() => removeWorkExperience(index)}
                              className="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                            >
                              Remove
                            </button>
                          </div>
                          <textarea
                            value={exp.description}
                            onChange={(e) => updateWorkExperience(index, 'description', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Describe your responsibilities and achievements..."
                            rows={2}
                          />
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addWorkExperience}
                        className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                      >
                        Add Work Experience
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Education
                    </label>
                    <div className="space-y-4">
                      {formData.education.map((edu, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={edu.institution}
                              onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Institution"
                            />
                            <input
                              type="text"
                              value={edu.degree}
                              onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Degree"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={edu.field}
                              onChange={(e) => updateEducation(index, 'field', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Field of Study"
                            />
                            <input
                              type="number"
                              value={edu.gpa}
                              onChange={(e) => updateEducation(index, 'gpa', parseFloat(e.target.value) || 0)}
                              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="GPA"
                              min="0"
                              max="4"
                              step="0.1"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="month"
                              value={edu.startDate}
                              onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="flex gap-2">
                              <input
                                type="month"
                                value={edu.endDate}
                                onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <button
                                type="button"
                                onClick={() => removeEducation(index)}
                                className="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addEducation}
                        className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                      >
                        Add Education
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <div className="flex gap-2">
                  {currentStep < 4 && (
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={loading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      Next
                    </button>
                  )}
                  
                  {currentStep === 4 && (
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      {loading ? 'Creating Profile...' : 'Create Profile'}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Alert />
    </>
  );
}