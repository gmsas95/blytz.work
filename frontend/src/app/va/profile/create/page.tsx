"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Upload, X, Plus, Check, AlertCircle } from 'lucide-react';

// Form field types
interface VAProfileFormData {
  name: string;
  bio: string;
  country: string;
  timezone: string;
  hourlyRate: number;
  skills: string[];
  availability: boolean;
  email?: string;
  phone?: string;
  languages?: Array<{ language: string; proficiency: string }>;
  workExperience?: Array<{ company: string; position: string; startDate: string; endDate?: string; current: boolean; description: string }>;
  education?: Array<{ institution: string; degree: string; field: string; startDate: string; endDate?: string; current: boolean }>;
  avatarUrl?: string;
  resumeUrl?: string;
  videoIntroUrl?: string;
  verificationLevel: 'basic' | 'professional' | 'premium';
  backgroundCheckPassed: boolean;
  featuredProfile: boolean;
}

// Comprehensive VA Profile Schema
const vaProfileSchema = z.object({
  // Basic Information
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().min(50, "Bio must be at least 50 characters").max(2000, "Bio must be less than 2000 characters"),
  country: z.string().min(2, "Country is required"),
  timezone: z.string().min(1, "Timezone is required"),
  
  // Professional Details
  hourlyRate: z.number().min(5, "Hourly rate must be at least $5").max(500, "Hourly rate must be less than $500"),
  skills: z.array(z.string()).min(1, "At least one skill is required").max(20, "Maximum 20 skills allowed"),
  availability: z.boolean().default(true),
  
  // Contact Information
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().min(10, "Phone must be at least 10 digits").max(20, "Phone must be less than 20 digits").optional().or(z.literal("")),
  
  // Language & Experience
  languages: z.array(z.object({
    language: z.string(),
    proficiency: z.enum(['basic', 'conversational', 'fluent', 'native'])
  })).optional(),
  
  workExperience: z.array(z.object({
    company: z.string(),
    position: z.string(),
    startDate: z.string(),
    endDate: z.string().optional(),
    current: z.boolean().default(false),
    description: z.string()
  })).optional(),
  
  education: z.array(z.object({
    institution: z.string(),
    degree: z.string(),
    field: z.string(),
    startDate: z.string(),
    endDate: z.string().optional(),
    current: z.boolean().default(false)
  })).optional(),
  
  // Portfolio & Media
  avatarUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  resumeUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  videoIntroUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  
  // Verification & Settings
  verificationLevel: z.enum(['basic', 'professional', 'premium']).default('basic'),
  backgroundCheckPassed: z.boolean().default(false),
  featuredProfile: z.boolean().default(false)
});

const VAProfileCreation = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [profileImage, setProfileImage] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [newSkills, setNewSkills] = useState('');
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isValid },
    trigger
  } = useForm<VAProfileFormData>({
    resolver: zodResolver(vaProfileSchema),
    defaultValues: {
      name: '',
      bio: '',
      country: '',
      timezone: '',
      hourlyRate: 25,
      skills: [],
      availability: true,
      email: '',
      phone: '',
      languages: [],
      workExperience: [],
      education: [],
      avatarUrl: '',
      resumeUrl: '',
      videoIntroUrl: '',
      verificationLevel: 'basic',
      backgroundCheckPassed: false,
      featuredProfile: false
    },
    mode: 'onChange'
  });

  const watchedSkills: string[] = watch('skills') || [];
  const watchedLanguages: Array<{ language: string; proficiency: string }> = watch('languages') || [];
  const watchedWorkExperience: Array<{ company: string; position: string; startDate: string; endDate?: string; current: boolean; description: string }> = watch('workExperience') || [];
  const watchedEducation: Array<{ institution: string; degree: string; field: string; startDate: string; endDate?: string; current: boolean }> = watch('education') || [];

  // Common skills suggestions
  const commonSkills = [
    'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'Python',
    'Django', 'Flask', 'PostgreSQL', 'MongoDB', 'Docker', 'Kubernetes',
    'AWS', 'Google Cloud', 'Azure', 'UI/UX Design', 'Figma', 'Adobe Creative Suite',
    'Content Writing', 'Copywriting', 'SEO', 'Social Media Marketing',
    'Email Marketing', 'Salesforce', 'HubSpot', 'Customer Support', 'Virtual Assistance',
    'Project Management', 'Agile', 'Scrum', 'Data Analysis', 'Excel', 'Google Analytics'
  ];

  const languages = [
    { value: 'english', label: 'English' },
    { value: 'spanish', label: 'Spanish' },
    { value: 'french', label: 'French' },
    { value: 'german', label: 'German' },
    { value: 'mandarin', label: 'Mandarin Chinese' },
    { value: 'japanese', label: 'Japanese' },
    { value: 'korean', label: 'Korean' },
    { value: 'portuguese', label: 'Portuguese' },
    { value: 'russian', label: 'Russian' },
    { value: 'arabic', label: 'Arabic' },
    { value: 'hindi', label: 'Hindi' },
    { value: 'italian', label: 'Italian' }
  ];

  const countries = [
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'ca', label: 'Canada' },
    { value: 'au', label: 'Australia' },
    { value: 'de', label: 'Germany' },
    { value: 'fr', label: 'France' },
    { value: 'es', label: 'Spain' },
    { value: 'it', label: 'Italy' },
    { value: 'nl', label: 'Netherlands' },
    { value: 'se', label: 'Sweden' },
    { value: 'no', label: 'Norway' },
    { value: 'dk', label: 'Denmark' },
    { value: 'fi', label: 'Finland' },
    { value: 'ch', label: 'Switzerland' },
    { value: 'at', label: 'Austria' },
    { value: 'be', label: 'Belgium' },
    { value: 'ie', label: 'Ireland' },
    { value: 'nz', label: 'New Zealand' },
    { value: 'sg', label: 'Singapore' },
    { value: 'jp', label: 'Japan' },
    { value: 'kr', label: 'South Korea' },
    { value: 'in', label: 'India' },
    { value: 'ph', label: 'Philippines' },
    { value: 'th', label: 'Thailand' },
    { value: 'my', label: 'Malaysia' },
    { value: 'hk', label: 'Hong Kong' }
  ];

  const timezones = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'EST', label: 'EST (Eastern Standard Time)' },
    { value: 'CST', label: 'CST (Central Standard Time)' },
    { value: 'MST', label: 'MST (Mountain Standard Time)' },
    { value: 'PST', label: 'PST (Pacific Standard Time)' },
    { value: 'GMT', label: 'GMT (Greenwich Mean Time)' },
    { value: 'CET', label: 'CET (Central European Time)' },
    { value: 'EET', label: 'EET (Eastern European Time)' },
    { value: 'JST', label: 'JST (Japan Standard Time)' },
    { value: 'AEST', label: 'AEST (Australian Eastern Standard Time)' },
    { value: 'IST', label: 'IST (India Standard Time)' },
    { value: 'CST_CHINA', label: 'CST (China Standard Time)' }
  ];

  const addSkill = (skill: string) => {
    if (skill && !watchedSkills.includes(skill)) {
      setValue('skills', [...watchedSkills, skill] as string[]);
      setNewSkills('');
      trigger('skills');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setValue('skills', watchedSkills.filter((skill: string) => skill !== skillToRemove) as string[]);
    trigger('skills');
  };

  const addLanguage = () => {
    const newLanguage = { language: '', proficiency: 'basic' };
    setValue('languages', [...(watchedLanguages || []), newLanguage]);
    trigger('languages');
  };

  const updateLanguage = (index: number, field: string, value: string) => {
    const updatedLanguages = [...(watchedLanguages || [])];
    updatedLanguages[index] = { ...updatedLanguages[index], [field]: value };
    setValue('languages', updatedLanguages);
    trigger('languages');
  };

  const removeLanguage = (index: number) => {
    setValue('languages', watchedLanguages.filter((_, i) => i !== index));
    trigger('languages');
  };

  const addWorkExperience = () => {
    const newExperience = {
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    };
    setValue('workExperience', [...(watchedWorkExperience || []), newExperience]);
    trigger('workExperience');
  };

  const updateWorkExperience = (index: number, field: string, value: string) => {
    const updatedExperience = [...(watchedWorkExperience || [])];
    updatedExperience[index] = { ...updatedExperience[index], [field]: value };
    setValue('workExperience', updatedExperience);
    trigger('workExperience');
  };

  const removeWorkExperience = (index: number) => {
    setValue('workExperience', watchedWorkExperience.filter((_, i) => i !== index));
    trigger('workExperience');
  };

  const addEducation = () => {
    const newEducation = {
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      current: false
    };
    setValue('education', [...(watchedEducation || []), newEducation]);
    trigger('education');
  };

  const updateEducation = (index: number, field: string, value: string) => {
    const updatedEducation = [...(watchedEducation || [])];
    updatedEducation[index] = { ...updatedEducation[index], [field]: value };
    setValue('education', updatedEducation);
    trigger('education');
  };

  const removeEducation = (index: number) => {
    setValue('education', watchedEducation.filter((_, i) => i !== index));
    trigger('education');
  };

  const handleImageUpload = async (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setUploadProgress(0);
      setIsLoading(true);
      
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      try {
        // In production, upload to your file storage service
        setTimeout(() => {
          const imageUrl = URL.createObjectURL(file);
          setValue('avatarUrl', imageUrl);
          setProfileImage(imageUrl);
          setUploadProgress(100);
          clearInterval(interval);
          setIsLoading(false);
          toast.success('Profile image uploaded successfully!');
        }, 2000);
      } catch (error) {
        clearInterval(interval);
        setIsLoading(false);
        setUploadProgress(0);
        toast.error('Failed to upload image. Please try again.');
      }
    }
  };

  const handleResumeUpload = async (file) => {
    if (file && (file.type === 'application/pdf' || file.type === 'application/msword')) {
      setUploadProgress(0);
      setIsLoading(true);
      
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      try {
        setTimeout(() => {
          const resumeUrl = URL.createObjectURL(file);
          setValue('resumeUrl', resumeUrl);
          setResumeFile(resumeUrl);
          setUploadProgress(100);
          clearInterval(interval);
          setIsLoading(false);
          toast.success('Resume uploaded successfully!');
        }, 2000);
      } catch (error) {
        clearInterval(interval);
        setIsLoading(false);
        setUploadProgress(0);
        toast.error('Failed to upload resume. Please try again.');
      }
    } else {
      toast.error('Please upload a PDF or Word document.');
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      // Get auth token
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast.error('Please login first to create your profile');
        router.push('/auth');
        return;
      }

      // Create VA profile via API
      const response = await fetch('/api/va/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create profile');
      }

      const result = await response.json();
      
      toast.success('🎉 VA Profile created successfully!');
      
      // Update user profile completion status
      const userResponse = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        if (userData.profileComplete) {
          router.push('/va/dashboard');
        } else {
          router.push('/va/profile/complete');
        }
      }
      
    } catch (error) {
      console.error('Profile creation error:', error);
      toast.error(error.message || 'Failed to create profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = async () => {
    const currentFields = getStepFields(currentStep);
    const isStepValid = await trigger(currentFields, { shouldFocus: true });
    
    if (isStepValid) {
      setCurrentStep(prev => Math.min(prev + 1, 7));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const getStepFields = (step: number) => {
    switch (step) {
      case 1: return ['name', 'bio'];
      case 2: return ['country', 'timezone', 'availability'];
      case 3: return ['hourlyRate', 'skills'];
      case 4: return ['email', 'phone', 'languages'];
      case 5: return ['workExperience'];
      case 6: return ['education', 'avatarUrl', 'resumeUrl', 'videoIntroUrl'];
      case 7: return ['verificationLevel', 'backgroundCheckPassed', 'featuredProfile'];
      default: return [];
    }
  };

  const isStepComplete = (step: number) => {
    const fields = getStepFields(step);
    return fields.every(field => {
      const value = getValues(field);
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== '';
    });
  };

  const totalSteps = 7;
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-slate-900">Create Your VA Profile</h1>
            <span className="text-sm text-slate-600">Step {currentStep} of {totalSteps}</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex justify-between mt-2">
            <span className="text-xs text-slate-600">Basic Info</span>
            <span className="text-xs text-slate-600">Location</span>
            <span className="text-xs text-slate-600">Skills & Rate</span>
            <span className="text-xs text-slate-600">Contact</span>
            <span className="text-xs text-slate-600">Experience</span>
            <span className="text-xs text-slate-600">Education</span>
            <span className="text-xs text-slate-600">Verification</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Tell us about yourself and what makes you a great Virtual Assistant.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    {...register('name')}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="bio">Professional Bio *</Label>
                  <Textarea
                    id="bio"
                    placeholder="Experienced virtual assistant with 5+ years in customer service, project management, and administrative support..."
                    rows={6}
                    {...register('bio')}
                    className={errors.bio ? 'border-red-500' : ''}
                  />
                  <div className="flex justify-between mt-1">
                    <p className="text-sm text-slate-600">
                      {watch('bio')?.length || 0} / 2000 characters
                    </p>
                    {errors.bio && (
                      <p className="text-sm text-red-600">{errors.bio.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="button" onClick={nextStep} className="w-full">
                  Continue to Location
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Step 2: Location & Availability */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Location & Availability</CardTitle>
                <CardDescription>
                  Help employers find you based on your location and availability.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Select value={watch('country')} onValueChange={(value) => setValue('country', value)}>
                    <SelectTrigger className={errors.country ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map(country => (
                        <SelectItem key={country.value} value={country.value}>
                          {country.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.country && (
                    <p className="text-sm text-red-600 mt-1">{errors.country.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="timezone">Timezone *</Label>
                  <Select value={watch('timezone')} onValueChange={(value) => setValue('timezone', value)}>
                    <SelectTrigger className={errors.timezone ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select your timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map(tz => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.timezone && (
                    <p className="text-sm text-red-600 mt-1">{errors.timezone.message}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="availability"
                    checked={watch('availability')}
                    onCheckedChange={(checked) => setValue('availability', checked)}
                  />
                  <Label htmlFor="availability" className="text-sm">
                    I am available for new projects
                  </Label>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>
                  Previous
                </Button>
                <Button type="button" onClick={nextStep}>
                  Continue to Skills & Rate
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Step 3: Skills & Hourly Rate */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Skills & Hourly Rate</CardTitle>
                <CardDescription>
                  Showcase your skills and set your desired hourly rate.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="hourlyRate">Hourly Rate (USD) *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-600">$</span>
                    <Input
                      id="hourlyRate"
                      type="number"
                      placeholder="25"
                      {...register('hourlyRate', { valueAsNumber: true })}
                      className={`pl-8 ${errors.hourlyRate ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.hourlyRate && (
                    <p className="text-sm text-red-600 mt-1">{errors.hourlyRate.message}</p>
                  )}
                </div>

                <div>
                  <Label>Skills *</Label>
                  <div className="space-y-4">
                    {/* Add new skill */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type a skill and press Enter..."
                        value={newSkills}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSkills(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addSkill(newSkills);
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={() => addSkill(newSkills)}
                        disabled={!newSkills.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Common skills suggestions */}
                    <div>
                      <p className="text-sm text-slate-600 mb-2">Common skills:</p>
                      <div className="flex flex-wrap gap-2">
                        {commonSkills.map(skill => (
                          <Button
                            key={skill}
                            type="button"
                            variant={watchedSkills?.includes(skill) ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              if (watchedSkills?.includes(skill)) {
                                removeSkill(skill);
                              } else {
                                addSkill(skill);
                              }
                            }}
                          >
                            {watchedSkills?.includes(skill) && <Check className="h-3 w-3 mr-1" />}
                            {skill}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Selected skills */}
                    {watchedSkills && watchedSkills.length > 0 && (
                      <div>
                        <p className="text-sm text-slate-600 mb-2">Your skills:</p>
                        <div className="flex flex-wrap gap-2">
                          {watchedSkills.map(skill => (
                            <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                              {skill}
                              <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => removeSkill(skill)}
                              />
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {errors.skills && (
                    <p className="text-sm text-red-600 mt-1">{errors.skills.message}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>
                  Previous
                </Button>
                <Button type="button" onClick={nextStep}>
                  Continue to Contact
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Step 4: Contact & Languages */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Contact & Languages</CardTitle>
                <CardDescription>
                  Add your contact information and language proficiencies.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      {...register('email')}
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      {...register('phone')}
                      className={errors.phone ? 'border-red-500' : ''}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Languages</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addLanguage}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Language
                    </Button>
                  </div>
                  
                  {watchedLanguages && watchedLanguages.length > 0 ? (
                    <div className="space-y-3">
                      {watchedLanguages.map((lang, index) => (
                        <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                            <Select
                              value={lang.language}
                              onValueChange={(value) => updateLanguage(index, 'language', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select language" />
                              </SelectTrigger>
                              <SelectContent>
                                {languages.map(language => (
                                  <SelectItem key={language.value} value={language.value}>
                                    {language.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            
                            <Select
                              value={lang.proficiency}
                              onValueChange={(value) => updateLanguage(index, 'proficiency', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Proficiency" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="basic">Basic</SelectItem>
                                <SelectItem value="conversational">Conversational</SelectItem>
                                <SelectItem value="fluent">Fluent</SelectItem>
                                <SelectItem value="native">Native</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeLanguage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600">No languages added. Click "Add Language" to get started.</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>
                  Previous
                </Button>
                <Button type="button" onClick={nextStep}>
                  Continue to Experience
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Step 5: Work Experience */}
          {currentStep === 5 && (
            <Card>
              <CardHeader>
                <CardTitle>Work Experience</CardTitle>
                <CardDescription>
                  Showcase your professional experience and achievements.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <Label>Previous Positions</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addWorkExperience}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Experience
                  </Button>
                </div>
                
                {watchedWorkExperience && watchedWorkExperience.length > 0 ? (
                  <div className="space-y-4">
                    {watchedWorkExperience.map((exp, index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-4">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">Position {index + 1}</h4>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeWorkExperience(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Company</Label>
                            <Input
                              placeholder="Company Name"
                              value={exp.company}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateWorkExperience(index, 'company', e.target.value)}
                            />
                          </div>
                          
                          <div>
                            <Label>Position</Label>
                            <Input
                              placeholder="Job Title"
                              value={exp.position}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateWorkExperience(index, 'position', e.target.value)}
                            />
                          </div>
                          
                          <div>
                            <Label>Start Date</Label>
                            <Input
                              type="date"
                              value={exp.startDate}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateWorkExperience(index, 'startDate', e.target.value)}
                            />
                          </div>
                          
                          <div>
                            <Label>End Date</Label>
                            <Input
                              type="date"
                              value={exp.endDate}
                              onChange={(e: React.ChangeEvent<HTMLInputElement> || React.ChangeEvent<HTMLTextAreaElement>) => updateWorkExperience(index, 'endDate', e.target.value)}
                              disabled={exp.current}
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`current-${index}`}
                            checked={exp.current}
                            onCheckedChange={(checked) => updateWorkExperience(index, 'current', checked)}
                          />
                          <Label htmlFor={`current-${index}`} className="text-sm">
                            I currently work here
                          </Label>
                        </div>
                        
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            placeholder="Describe your responsibilities and achievements..."
                            rows={3}
                            value={exp.description}
                            onChange={(e: React.ChangeEvent<HTMLInputElement> || React.ChangeEvent<HTMLTextAreaElement>) => updateWorkExperience(index, 'description', e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-600 mb-4">No work experience added yet.</p>
                    <Button type="button" onClick={addWorkExperience}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Experience
                    </Button>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>
                  Previous
                </Button>
                <Button type="button" onClick={nextStep}>
                  Continue to Education
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Step 6: Education & Media */}
          {currentStep === 6 && (
            <Card>
              <CardHeader>
                <CardTitle>Education & Media</CardTitle>
                <CardDescription>
                  Add your educational background and professional media.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Education Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label>Education</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addEducation}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Education
                    </Button>
                  </div>
                  
                  {watchedEducation && watchedEducation.length > 0 ? (
                    <div className="space-y-4">
                      {watchedEducation.map((edu, index) => (
                        <div key={index} className="p-4 border rounded-lg space-y-4">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium">Education {index + 1}</h4>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeEducation(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Institution</Label>
                              <Input
                                placeholder="University/College Name"
                                value={edu.institution}
                                onChange={(e: React.ChangeEvent<HTMLInputElement> || React.ChangeEvent<HTMLTextAreaElement>) => updateEducation(index, 'institution', e.target.value)}
                              />
                            </div>
                            
                            <div>
                              <Label>Degree</Label>
                              <Input
                                placeholder="Bachelor's, Master's, etc."
                                value={edu.degree}
                                onChange={(e: React.ChangeEvent<HTMLInputElement> || React.ChangeEvent<HTMLTextAreaElement>) => updateEducation(index, 'degree', e.target.value)}
                              />
                            </div>
                            
                            <div>
                              <Label>Field of Study</Label>
                              <Input
                                placeholder="Computer Science, Business, etc."
                                value={edu.field}
                                onChange={(e: React.ChangeEvent<HTMLInputElement> || React.ChangeEvent<HTMLTextAreaElement>) => updateEducation(index, 'field', e.target.value)}
                              />
                            </div>
                            
                            <div>
                              <Label>Start Date</Label>
                              <Input
                                type="date"
                                value={edu.startDate}
                                onChange={(e: React.ChangeEvent<HTMLInputElement> || React.ChangeEvent<HTMLTextAreaElement>) => updateEducation(index, 'startDate', e.target.value)}
                              />
                            </div>
                            
                            <div>
                              <Label>End Date</Label>
                              <Input
                                type="date"
                                value={edu.endDate}
                                onChange={(e: React.ChangeEvent<HTMLInputElement> || React.ChangeEvent<HTMLTextAreaElement>) => updateEducation(index, 'endDate', e.target.value)}
                                disabled={edu.current}
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`edu-current-${index}`}
                              checked={edu.current}
                              onCheckedChange={(checked) => updateEducation(index, 'current', checked)}
                            />
                            <Label htmlFor={`edu-current-${index}`} className="text-sm">
                              I currently attend here
                            </Label>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600">No education added. Click "Add Education" to get started.</p>
                  )}
                </div>

                <Separator />

                {/* Media Uploads */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Profile Picture</Label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center">
                      {profileImage ? (
                        <div className="space-y-2">
                          <img
                            src={profileImage}
                            alt="Profile preview"
                            className="w-24 h-24 rounded-full mx-auto object-cover"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setProfileImage(null);
                              setValue('avatarUrl', '');
                            }}
                          >
                            Remove Image
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="h-12 w-12 mx-auto text-slate-400" />
                          <div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e: React.ChangeEvent<HTMLInputElement> || React.ChangeEvent<HTMLTextAreaElement>) => handleImageUpload(e.target.files[0])}
                              className="hidden"
                              id="profile-image"
                            />
                            <label
                              htmlFor="profile-image"
                              className="cursor-pointer text-sm text-slate-600 hover:text-slate-900"
                            >
                              Click to upload profile picture
                            </label>
                          </div>
                          <p className="text-xs text-slate-500">JPG, PNG or GIF (max 5MB)</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label>Resume</Label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center">
                      {resumeFile ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-center text-slate-600">
                            <AlertCircle className="h-8 w-8 mr-2" />
                            <span>Resume uploaded</span>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setResumeFile(null);
                              setValue('resumeUrl', '');
                            }}
                          >
                            Remove Resume
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="h-12 w-12 mx-auto text-slate-400" />
                          <div>
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={(e: React.ChangeEvent<HTMLInputElement> || React.ChangeEvent<HTMLTextAreaElement>) => handleResumeUpload(e.target.files[0])}
                              className="hidden"
                              id="resume-file"
                            />
                            <label
                              htmlFor="resume-file"
                              className="cursor-pointer text-sm text-slate-600 hover:text-slate-900"
                            >
                              Click to upload resume
                            </label>
                          </div>
                          <p className="text-xs text-slate-500">PDF or Word document (max 10MB)</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}

                <Separator />

                {/* Video Intro URL */}
                <div>
                  <Label htmlFor="videoIntroUrl">Video Introduction URL (Optional)</Label>
                  <Input
                    id="videoIntroUrl"
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    {...register('videoIntroUrl')}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Add a link to your video introduction to help employers get to know you better.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>
                  Previous
                </Button>
                <Button type="button" onClick={nextStep}>
                  Continue to Verification
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Step 7: Verification & Settings */}
          {currentStep === 7 && (
            <Card>
              <CardHeader>
                <CardTitle>Verification & Settings</CardTitle>
                <CardDescription>
                  Choose your verification level and profile preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="verificationLevel">Verification Level</Label>
                  <Select value={watch('verificationLevel')} onValueChange={(value) => setValue('verificationLevel', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select verification level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic (Free)</SelectItem>
                      <SelectItem value="professional">Professional ($20)</SelectItem>
                      <SelectItem value="premium">Premium ($100)</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="mt-4 space-y-3">
                    <div className={`p-3 rounded-lg border ${watch('verificationLevel') === 'basic' ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}>
                      <h4 className="font-medium">Basic (Free)</h4>
                      <ul className="text-sm text-slate-600 mt-1 space-y-1">
                        <li>✓ Email verification</li>
                        <li>✓ Basic profile visibility</li>
                        <li>✓ Standard support</li>
                      </ul>
                    </div>
                    
                    <div className={`p-3 rounded-lg border ${watch('verificationLevel') === 'professional' ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}>
                      <h4 className="font-medium">Professional ($20 one-time)</h4>
                      <ul className="text-sm text-slate-600 mt-1 space-y-1">
                        <li>✓ Everything in Basic</li>
                        <li>✓ ID verification</li>
                        <li>✓ Background check</li>
                        <li>✓ Priority in search results</li>
                        <li>✓ "Verified" badge on profile</li>
                      </ul>
                    </div>
                    
                    <div className={`p-3 rounded-lg border ${watch('verificationLevel') === 'premium' ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}>
                      <h4 className="font-medium">Premium ($100 one-time)</h4>
                      <ul className="text-sm text-slate-600 mt-1 space-y-1">
                        <li>✓ Everything in Professional</li>
                        <li>✓ Skills assessment testing</li>
                        <li>✓ Portfolio showcase</li>
                        <li>✓ Featured profile placement</li>
                        <li>✓ Dedicated account manager</li>
                        <li>✓ Advanced analytics</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="backgroundCheckPassed"
                      checked={watch('backgroundCheckPassed')}
                      onCheckedChange={(checked) => setValue('backgroundCheckPassed', checked)}
                    />
                    <Label htmlFor="backgroundCheckPassed" className="text-sm">
                      I consent to a background check (required for Professional & Premium verification)
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="featuredProfile"
                      checked={watch('featuredProfile')}
                      onCheckedChange={(checked) => setValue('featuredProfile', checked)}
                    />
                    <Label htmlFor="featuredProfile" className="text-sm">
                      Feature my profile (additional $10/month for premium visibility)
                    </Label>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex justify-between w-full">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Previous
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading || !isValid}
                    className="min-w-32"
                  >
                    {isLoading ? 'Creating Profile...' : 'Complete Profile'}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )}
        </form>
      </div>
    </div>
  );
};

export default VAProfileCreation;