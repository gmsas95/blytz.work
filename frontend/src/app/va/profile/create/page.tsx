"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  User, 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign,
  Mail, 
  Phone,
  Globe,
  GraduationCap,
  Building2,
  FileText,
  Video,
  Award,
  ShieldCheck,
  Star,
  Upload,
  X,
  Check,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiCall } from '@/lib/api';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

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

const VAProfileCreation = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState('');

  const [formData, setFormData] = useState<VAProfileFormData>({
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
  });

  const watchedSkills = formData.skills || [];
  const watchedLanguages = formData.languages || [];
  const watchedWorkExperience = formData.workExperience || [];
  const watchedEducation = formData.education || [];

  // Common data
  const countries = [
    { value: 'us', label: 'United States' },
    { value: 'ph', label: 'Philippines' },
    { value: 'in', label: 'India' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'ca', label: 'Canada' },
    { value: 'au', label: 'Australia' },
    { value: 'de', label: 'Germany' },
    { value: 'jp', label: 'Japan' },
    { value: 'kr', label: 'South Korea' },
    { value: 'sg', label: 'Singapore' },
    { value: 'th', label: 'Thailand' },
    { value: 'my', label: 'Malaysia' },
    { value: 'hk', label: 'Hong Kong' }
  ];

  const timezones = [
    { value: 'UTC', label: 'UTC' },
    { value: 'EST', label: 'EST (UTC-5)' },
    { value: 'CST', label: 'CST (UTC-6)' },
    { value: 'MST', label: 'MST (UTC-7)' },
    { value: 'PST', label: 'PST (UTC-8)' },
    { value: 'JST', label: 'JST (UTC+9)' },
    { value: 'IST', label: 'IST (UTC+5:30)' },
    { value: 'PHT', label: 'PHT (UTC+8)' }
  ];

  const commonSkills = [
    'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'Python',
    'Virtual Assistance', 'Customer Service', 'Project Management',
    'Content Writing', 'Social Media Marketing', 'Email Marketing',
    'Data Entry', 'Bookkeeping', 'Administrative Support',
    'UI/UX Design', 'Figma', 'Adobe Creative Suite',
    'Salesforce', 'HubSpot', 'CRM Management'
  ];

  const languages = [
    { value: 'english', label: 'English' },
    { value: 'spanish', label: 'Spanish' },
    { value: 'french', label: 'French' },
    { value: 'german', label: 'German' },
    { value: 'filipino', label: 'Filipino' },
    { value: 'hindi', label: 'Hindi' },
    { value: 'japanese', label: 'Japanese' },
    { value: 'korean', label: 'Korean' },
    { value: 'mandarin', label: 'Mandarin Chinese' }
  ];

  const verificationLevels = [
    { 
      value: 'basic', 
      label: 'Basic (Free)', 
      price: '$0',
      features: ['Email verification', 'Basic visibility', 'Standard support']
    },
    { 
      value: 'professional', 
      label: 'Professional ($20)', 
      price: '$20',
      features: ['Everything in Basic', 'ID verification', 'Background check', 'Priority search', 'Verified badge']
    },
    { 
      value: 'premium', 
      label: 'Premium ($100)', 
      price: '$100',
      features: ['Everything in Professional', 'Skills assessment', 'Portfolio showcase', 'Featured placement', 'Dedicated support', 'Advanced analytics']
    }
  ];

  // Handlers
  const addSkill = () => {
    if (newSkill.trim() && !watchedSkills.includes(newSkill.trim())) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const addLanguage = () => {
    setFormData(prev => ({ 
      ...prev, 
      languages: [...(prev.languages || []), { language: '', proficiency: 'basic' }] 
    }));
  };

  const updateLanguage = (index: number, field: 'language' | 'proficiency', value: string) => {
    setFormData(prev => {
      const updated = [...(prev.languages || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, languages: updated };
    });
  };

  const removeLanguage = (index: number) => {
    setFormData(prev => ({ 
      ...prev, 
      languages: (prev.languages || []).filter((_, i) => i !== index) 
    }));
  };

  const addWorkExperience = () => {
    setFormData(prev => ({
      ...prev,
      workExperience: [...(prev.workExperience || []), {
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        current: false,
        description: ''
      }]
    }));
  };

  const updateWorkExperience = (index: number, field: string, value: string | boolean) => {
    setFormData(prev => {
      const updated = [...(prev.workExperience || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, workExperience: updated };
    });
  };

  const removeWorkExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      workExperience: (prev.workExperience || []).filter((_, i) => i !== index)
    }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...(prev.education || []), {
        institution: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        current: false
      }]
    }));
  };

  const updateEducation = (index: number, field: string, value: string | boolean) => {
    setFormData(prev => {
      const updated = [...(prev.education || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, education: updated };
    });
  };

  const removeEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      education: (prev.education || []).filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = async (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setUploadProgress(0);
      setIsLoading(true);
      
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return Math.min(prev + 10, 90);
        });
      }, 200);
      
      try {
        setTimeout(() => {
          const imageUrl = URL.createObjectURL(file);
          setFormData(prev => ({ ...prev, avatarUrl: imageUrl }));
          setProfileImage(imageUrl);
          setUploadProgress(100);
          clearInterval(interval);
          setIsLoading(false);
          toast.success('Profile image uploaded!');
        }, 2000);
      } catch (error: any) {
        clearInterval(interval);
        setIsLoading(false);
        setUploadProgress(0);
        toast.error('Failed to upload image');
      }
    }
  };

  const handleResumeUpload = async (file: File) => {
    if (file && (file.type === 'application/pdf' || file.type === 'application/msword')) {
      setUploadProgress(0);
      setIsLoading(true);
      
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return Math.min(prev + 10, 90);
        });
      }, 200);
      
      try {
        setTimeout(() => {
          const resumeUrl = URL.createObjectURL(file);
          setFormData(prev => ({ ...prev, resumeUrl }));
          setResumeFile(resumeUrl);
          setUploadProgress(100);
          clearInterval(interval);
          setIsLoading(false);
          toast.success('Resume uploaded!');
        }, 2000);
      } catch (error: any) {
        clearInterval(interval);
        setIsLoading(false);
        setUploadProgress(0);
        toast.error('Failed to upload resume');
      }
    } else {
      toast.error('Please upload a PDF or Word document');
    }
  };

  const nextStep = () => {
    if (currentStep < 7) setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      const response = await apiCall('/va/profile', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create profile');
      }
      
      const result = await response.json();
      
      toast.success('🎉 VA Profile created successfully!');
      
      const userResponse = await apiCall('/auth/me', {
        method: 'GET'
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        if (userData.profileComplete) {
          router.push('/va/dashboard');
        } else {
          router.push('/va/profile/complete');
        }
      }
      
    } catch (error: any) {
      console.error('Profile creation error:', error);
      toast.error(error.message || 'Failed to create profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStepTitle = () => {
    const titles = {
      1: 'Basic Information',
      2: 'Location & Availability',
      3: 'Skills & Rate',
      4: 'Contact Details',
      5: 'Work Experience',
      6: 'Education & Media',
      7: 'Verification & Settings'
    };
    return titles[currentStep as keyof typeof titles] || 'Basic Information';
  };

  const getStepDescription = () => {
    const descriptions = {
      1: 'Tell us about yourself and what makes you a great Virtual Assistant',
      2: 'Help employers find you based on your location and availability',
      3: 'Showcase your skills and set your desired hourly rate',
      4: 'Add your contact information and language proficiencies',
      5: 'Share your professional work history and achievements',
      6: 'Add your educational background and professional media',
      7: 'Choose your verification level and profile preferences'
    };
    return descriptions[currentStep as keyof typeof descriptions] || '';
  };

  const getStepIcon = (step: number) => {
    const icons = {
      1: User,
      2: MapPin,
      3: Award,
      4: Mail,
      5: Briefcase,
      6: GraduationCap,
      7: Star
    };
    return icons[step as keyof typeof icons] || User;
  };

  const totalSteps = 7;
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-slate-900">Create Your VA Profile</h1>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span>Step {currentStep} of {totalSteps}</span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-900 font-semibold">{getStepTitle()}</span>
            </div>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex justify-between mt-2 text-xs text-slate-600">
            <span>Basic Info</span>
            <span>Location</span>
            <span>Skills</span>
            <span>Contact</span>
            <span>Experience</span>
            <span>Education</span>
            <span>Verification</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    {React.createElement(getStepIcon(currentStep), { className: "h-5 w-5 text-slate-700" })}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{getStepTitle()}</CardTitle>
                    <CardDescription>{getStepDescription()}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="bio">Professional Bio *</Label>
                      <Textarea
                        id="bio"
                        placeholder="Experienced virtual assistant with 5+ years in customer service, project management, and administrative support..."
                        rows={4}
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        {formData.bio.length} / 2000 characters
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 2: Location & Availability */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="country">Country *</Label>
                      <Select value={formData.country} onValueChange={(value) => setFormData({ ...formData, country: value })}>
                        <SelectTrigger>
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
                    </div>
                    
                    <div>
                      <Label htmlFor="timezone">Timezone *</Label>
                      <Select value={formData.timezone} onValueChange={(value) => setFormData({ ...formData, timezone: value })}>
                        <SelectTrigger>
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
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                      <Checkbox
                        id="availability"
                        checked={formData.availability}
                        onCheckedChange={(checked) => setFormData({ ...formData, availability: Boolean(checked) })}
                      />
                      <Label htmlFor="availability" className="flex items-center gap-2 cursor-pointer">
                        <Clock className="h-4 w-4 text-green-600" />
                        <span className="text-sm">I am available for new projects</span>
                      </Label>
                    </div>
                  </div>
                )}

                {/* Step 3: Skills & Rate */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="hourlyRate">Hourly Rate (USD) *</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium">
                          $
                        </span>
                        <Input
                          id="hourlyRate"
                          type="number"
                          placeholder="25"
                          value={formData.hourlyRate}
                          onChange={(e) => setFormData({ ...formData, hourlyRate: parseInt(e.target.value) || 25 })}
                          className="pl-8"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Skills *</Label>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Type a skill and press Enter..."
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addSkill();
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addSkill}
                            disabled={!newSkill.trim()}
                          >
                            Add
                          </Button>
                        </div>
                        
                        <div>
                          <p className="text-sm text-slate-600 mb-2">Common skills:</p>
                          <div className="flex flex-wrap gap-2">
                            {commonSkills.map(skill => (
                              <Badge
                                key={skill}
                                variant={watchedSkills.includes(skill) ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => {
                                  if (watchedSkills.includes(skill)) {
                                    removeSkill(skill);
                                  } else {
                                    addSkill();
                                    setNewSkill(skill);
                                  }
                                }}
                              >
                                {watchedSkills.includes(skill) && <Check className="h-3 w-3 mr-1" />}
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Contact Details */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Label>Languages</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addLanguage}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Add Language
                        </Button>
                      </div>
                      
                      {watchedLanguages.length > 0 ? (
                        <div className="space-y-3">
                          {watchedLanguages.map((lang, index) => (
                            <div key={index} className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                              <Select
                                value={lang.language}
                                onValueChange={(value) => updateLanguage(index, 'language', value)}
                              >
                                <SelectTrigger className="w-40">
                                  <SelectValue placeholder="Language" />
                                </SelectTrigger>
                                <SelectContent>
                                  {languages.map(l => (
                                    <SelectItem key={l.value} value={l.value}>
                                      {l.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              
                              <Select
                                value={lang.proficiency}
                                onValueChange={(value) => updateLanguage(index, 'proficiency', value)}
                              >
                                <SelectTrigger className="w-40">
                                  <SelectValue placeholder="Level" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="basic">Basic</SelectItem>
                                  <SelectItem value="conversational">Conversational</SelectItem>
                                  <SelectItem value="fluent">Fluent</SelectItem>
                                  <SelectItem value="native">Native</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeLanguage(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-slate-500 text-sm">
                          No languages added. Click "Add Language" to get started.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 5: Work Experience */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-3">
                      <Label>Work Experience</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addWorkExperience}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Add Experience
                      </Button>
                    </div>
                    
                    {watchedWorkExperience.length > 0 ? (
                      <div className="space-y-4">
                        {watchedWorkExperience.map((exp, index) => (
                          <div key={index} className="p-4 border rounded-lg space-y-4 bg-slate-50">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-slate-600" />
                                <span className="font-medium">Position {index + 1}</span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
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
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateWorkExperience(index, 'endDate', e.target.value)}
                                  disabled={exp.current}
                                />
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 mt-2">
                              <Checkbox
                                id={`current-${index}`}
                                checked={exp.current}
                                onCheckedChange={(checked) => updateWorkExperience(index, 'current', checked)}
                              />
                              <Label htmlFor={`current-${index}`} className="text-sm cursor-pointer">
                                I currently work here
                              </Label>
                            </div>
                            
                            <div className="mt-3">
                              <Label>Description</Label>
                              <Textarea
                                placeholder="Describe your responsibilities and achievements..."
                                rows={2}
                                value={exp.description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateWorkExperience(index, 'description', e.target.value)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        No experience added. Click "Add Experience" to get started.
                      </div>
                    )}
                  </div>
                )}

                {/* Step 6: Education & Media */}
                {currentStep === 6 && (
                  <div className="space-y-6">
                    {/* Work Experience */}
                    <div className="flex items-center justify-between mb-3">
                      <Label>Education</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addEducation}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Add Education
                      </Button>
                    </div>
                    
                    {watchedEducation.length > 0 ? (
                      <div className="space-y-4">
                        {watchedEducation.map((edu, index) => (
                          <div key={index} className="p-4 border rounded-lg space-y-4 bg-slate-50">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-2">
                                <GraduationCap className="h-4 w-4 text-slate-600" />
                                <span className="font-medium">Education {index + 1}</span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
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
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateEducation(index, 'institution', e.target.value)}
                                />
                              </div>
                              
                              <div>
                                <Label>Degree</Label>
                                <Input
                                  placeholder="Bachelor's, Master's, etc."
                                  value={edu.degree}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateEducation(index, 'degree', e.target.value)}
                                />
                              </div>
                              
                              <div>
                                <Label>Field of Study</Label>
                                <Input
                                  placeholder="Computer Science, Business, etc."
                                  value={edu.field}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateEducation(index, 'field', e.target.value)}
                                />
                              </div>
                              
                              <div>
                                <Label>Start Date</Label>
                                <Input
                                  type="date"
                                  value={edu.startDate}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateEducation(index, 'startDate', e.target.value)}
                                />
                              </div>
                              
                              <div>
                                <Label>End Date</Label>
                                <Input
                                  type="date"
                                  value={edu.endDate}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateEducation(index, 'endDate', e.target.value)}
                                  disabled={edu.current}
                                />
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 mt-2">
                              <Checkbox
                                id={`edu-current-${index}`}
                                checked={edu.current}
                                onCheckedChange={(checked) => updateEducation(index, 'current', checked)}
                              />
                              <Label htmlFor={`edu-current-${index}`} className="text-sm cursor-pointer">
                                I currently attend here
                              </Label>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        No education added. Click "Add Education" to get started.
                      </div>
                    )}
                    
                    <Separator />
                    
                    {/* Media Uploads */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label>Profile Picture</Label>
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                          {profileImage ? (
                            <div className="space-y-3">
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
                                  setFormData(prev => ({ ...prev, avatarUrl: '' }));
                                }}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Remove
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <User className="h-12 w-12 mx-auto text-slate-400" />
                              <div>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleImageUpload(e.target.files[0])}
                                  className="hidden"
                                  id="profile-image"
                                />
                                <label
                                  htmlFor="profile-image"
                                  className="cursor-pointer text-sm text-slate-600 hover:text-slate-900"
                                >
                                  Click to upload
                                </label>
                              </div>
                              <p className="text-xs text-slate-500">JPG, PNG or GIF (max 5MB)</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <Label>Resume</Label>
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                          {resumeFile ? (
                            <div className="space-y-3">
                              <FileText className="h-12 w-12 mx-auto text-green-600" />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setResumeFile(null);
                                  setFormData(prev => ({ ...prev, resumeUrl: '' }));
                                }}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Remove
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <FileText className="h-12 w-12 mx-auto text-slate-400" />
                              <div>
                                <input
                                  type="file"
                                  accept=".pdf,.doc,.docx"
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleResumeUpload(e.target.files[0])}
                                  className="hidden"
                                  id="resume-file"
                                />
                                <label
                                  htmlFor="resume-file"
                                  className="cursor-pointer text-sm text-slate-600 hover:text-slate-900"
                                >
                                  Click to upload
                                </label>
                              </div>
                              <p className="text-xs text-slate-500">PDF or Word document (max 10MB)</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="videoIntroUrl">Video Introduction URL (Optional)</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 h-4 w-4" />
                        <Input
                          id="videoIntroUrl"
                          type="url"
                          placeholder="https://www.youtube.com/watch?v=..."
                          value={formData.videoIntroUrl}
                          onChange={(e) => setFormData({ ...formData, videoIntroUrl: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Add a link to your video introduction to help employers get to know you better
                      </p>
                    </div>
                    
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Uploading...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} />
                      </div>
                    )}
                  </div>
                )}

                {/* Step 7: Verification & Settings */}
                {currentStep === 7 && (
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="verificationLevel">Verification Level</Label>
                      <div className="grid grid-cols-1 gap-4">
                        {verificationLevels.map(level => {
                          const isSelected = formData.verificationLevel === level.value;
                          return (
                            <div
                              key={level.value}
                              className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                isSelected ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                              }`}
                              onClick={() => setFormData({ ...formData, verificationLevel: level.value as any })}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <div className="text-lg font-bold">{level.label}</div>
                                  <div className="text-sm text-slate-500">One-time payment</div>
                                </div>
                                {isSelected && <Check className="h-5 w-5 text-blue-600" />}
                              </div>
                              
                              <ul className="text-sm text-slate-600 space-y-1">
                                {level.features.map((feature, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                                    {feature}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                        <Checkbox
                          id="backgroundCheckPassed"
                          checked={formData.backgroundCheckPassed}
                          onCheckedChange={(checked) => setFormData({ ...formData, backgroundCheckPassed: Boolean(checked) })}
                        />
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-blue-600" />
                          <Label htmlFor="backgroundCheckPassed" className="text-sm cursor-pointer">
                            I consent to a background check (required for Professional & Premium verification)
                          </Label>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                        <Checkbox
                          id="featuredProfile"
                          checked={formData.featuredProfile}
                          onCheckedChange={(checked) => setFormData({ ...formData, featuredProfile: Boolean(checked) })}
                        />
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <Label htmlFor="featuredProfile" className="text-sm cursor-pointer">
                            Feature my profile (additional $10/month for premium visibility)
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>
                {currentStep === 7 ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="min-w-32"
                  >
                    {isLoading ? 'Creating...' : 'Complete Profile'}
                  </Button>
                ) : (
                  <Button
                    onClick={nextStep}
                    className="min-w-32"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VAProfileCreation;
