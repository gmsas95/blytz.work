'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useImprovedAlert } from "@/contexts/ImprovedAlertContext";
import Navbar from "@/components/Navbar";
import { 
  Edit3,
  Building2,
  Globe,
  ExternalLink,
  TrendingUp,
  Clock,
  DollarSign,
  Star,
  Users,
  Target,
  Award,
  Upload,
  Plus,
  Briefcase,
  UserSearch,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui-shadcn/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui-shadcn/card';
import { Input } from '@/components/ui-shadcn/input';
import { Label } from '@/components/ui-shadcn/label';
import { Textarea } from '@/components/ui-shadcn/textarea';
import { Badge } from '@/components/ui-shadcn/badge';
import { Progress } from '@/components/ui-shadcn/progress';
import { Separator } from '@/components/ui-shadcn/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui-shadcn/select';

interface Company {
  id: string;
  name: string;
  bio: string;
  country: string;
  website?: string;
  industry: string;
  companySize?: string;
  foundedYear?: number;
  description?: string;
  mission?: string;
  values?: string[];
  benefits?: string[];
  email?: string;
  phone?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
  techStack?: string[];
  verificationLevel: string;
  totalSpent?: number;
  completionPercentage?: number;
  logoUrl?: string;
  jobPostings?: any[];
}

interface Analytics {
  conversionRate: number;
  averageTimeToHire: number;
  costPerHire: number;
  averageRating: number;
  responseRate: number;
  satisfactionScore: number;
  trends: Array<{ date: string; jobs: number; matches: number; hires: number }>;
}

const companySizes = ["1-10", "11-50", "51-200", "201+"];
const industries = [
  "Technology", "Healthcare", "Finance", "Education", "Retail", "Manufacturing",
  "Consulting", "Marketing", "Real Estate", "Construction", "Transportation",
  "Hospitality", "Entertainment", "Non-profit", "Government", "Other"
];

const commonTechStack = [
  "JavaScript", "TypeScript", "React", "Node.js", "Python", "Java", "AWS", "Docker",
  "Kubernetes", "MongoDB", "PostgreSQL", "MySQL", "Redis", "GraphQL", "REST API",
  "Microservices", "CI/CD", "Agile", "Scrum", "Jira", "Slack", "Microsoft Teams",
  "Google Workspace", "Salesforce", "HubSpot", "Zendesk", "Stripe", "PayPal"
];

const mockCompany: Company = {
  id: '1',
  name: 'TechCorp Solutions',
  bio: 'Leading technology company specializing in innovative software solutions',
  country: 'United States',
  website: 'https://techcorp.com',
  industry: 'Technology',
  companySize: '51-200',
  foundedYear: 2015,
  mission: 'To transform businesses through cutting-edge technology solutions',
  values: ['Innovation', 'Integrity', 'Excellence', 'Collaboration'],
  benefits: ['Health Insurance', 'Remote Work', 'Professional Development', 'Stock Options'],
  techStack: ['JavaScript', 'React', 'Node.js', 'AWS', 'Docker', 'PostgreSQL'],
  verificationLevel: 'professional',
  totalSpent: 125000,
  completionPercentage: 92,
  logoUrl: 'https://via.placeholder.com/80x80/FFD600/000000?text=TC',
  jobPostings: [
    { id: 1, title: 'Senior Developer', status: 'active' },
    { id: 2, title: 'Product Manager', status: 'active' }
  ]
};

const mockAnalytics: Analytics = {
  conversionRate: 12,
  averageTimeToHire: 18,
  costPerHire: 8500,
  averageRating: 4.7,
  responseRate: 85,
  satisfactionScore: 4.6,
  trends: [
    { date: '2024-01', jobs: 12, matches: 48, hires: 5 },
    { date: '2024-02', jobs: 15, matches: 62, hires: 7 }
  ]
};

export default function CompanyProfile() {
  const router = useRouter();
  const { user } = useAuth();
  const { addAlert } = useImprovedAlert();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  const [editForm, setEditForm] = useState<Company>({
    id: '',
    name: '',
    bio: '',
    country: '',
    website: '',
    industry: '',
    companySize: '',
    foundedYear: new Date().getFullYear(),
    description: '',
    mission: '',
    values: [],
    benefits: [],
    email: '',
    phone: '',
    socialLinks: {},
    techStack: [],
    verificationLevel: 'basic',
    jobPostings: []
  });

  useEffect(() => {
    if (user && user.role === 'company') {
      fetchProfile();
      fetchAnalytics();
    } else if (user) {
      router.push('/va/profile');
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/company/profile');
      
      if (!response.ok) {
        if (response.status === 404) {
          router.push('/company/profile/create');
          return;
        }
        console.warn('Company profile API not available, using mock data');
        setCompany(mockCompany);
        setEditForm(mockCompany);
        return;
      }
      
      const result = await response.json();
      setCompany(result.data);
      setEditForm(result.data);
    } catch (error: any) {
      addAlert(error.message || 'Failed to fetch profile', 'error');
      setCompany(mockCompany);
      setEditForm(mockCompany);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/company/analytics');
      
      if (!response.ok) {
        console.warn('Company analytics API not available, using mock data');
        setAnalytics(mockAnalytics);
        return;
      }
      
      const result = await response.json();
      setAnalytics(result.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setAnalytics(mockAnalytics);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/company/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        addAlert('Profile update API not available, but local state updated', 'info');
        setCompany(editForm);
        setEditing(false);
        return;
      }
      
      const result = await response.json();
      setCompany(result.data);
      setEditing(false);
      addAlert('Profile updated successfully!', 'success');
    } catch (error: any) {
      addAlert(error.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (file: File) => {
    setUploadingLogo(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload logo');
      }

      addAlert('Logo uploaded successfully!', 'success');
      fetchProfile();
    } catch (error: any) {
      addAlert(error.message || 'Failed to upload logo', 'error');
    } finally {
      setUploadingLogo(false);
    }
  };

  const addToArray = (field: keyof Company, value: string) => {
    const current = (editForm[field] as string[]) || [];
    if (!current.includes(value)) {
      setEditForm({
        ...editForm,
        [field]: [...current, value]
      });
    }
  };

  const removeFromArray = (field: keyof Company, value: string) => {
    const current = (editForm[field] as string[]) || [];
    setEditForm({
      ...editForm,
      [field]: current.filter(item => item !== value)
    });
  };

  if (loading && !company) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <p className="text-white">Loading profile...</p>
          </div>
        </div>
      </>
    );
  }

  if (!company) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <Card className="max-w-md border-0 bg-gray-800/50 backdrop-blur-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white">Company Profile Not Found</CardTitle>
              <CardDescription className="text-gray-300">
                Please create your company profile first.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => router.push('/company/profile/create')}
                className="w-full bg-yellow-400 text-gray-900 hover:bg-yellow-300"
              >
                Create Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Profile Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Header */}
              <Card className="border-0 bg-gray-800/50 backdrop-blur-lg">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-4">
                      {company.logoUrl ? (
                        <img
                          src={company.logoUrl}
                          alt={company.name}
                          className="w-20 h-20 rounded-xl border-2 border-yellow-400"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-700 rounded-xl flex items-center justify-center border-2 border-gray-600">
                          <Building2 className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-3xl font-bold text-white mb-2">{company.name}</CardTitle>
                        <div className="flex items-center gap-4 text-gray-300">
                          <div className="flex items-center gap-1">
                            <Globe className="h-4 w-4" />
                            {company.country}
                          </div>
                          <Badge variant="secondary" className="bg-yellow-400/20 text-yellow-300 border-yellow-400/30">
                            {company.industry}
                          </Badge>
                        </div>
                        {company.website && (
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-yellow-400 hover:text-yellow-300 text-sm mt-2"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {company.website}
                          </a>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => setEditing(!editing)}
                      variant="outline"
                      className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-gray-900"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      {editing ? 'Cancel' : 'Edit Profile'}
                    </Button>
                  </div>

                  <p className="text-gray-300">{company.bio}</p>

                  {company.mission && (
                    <div className="mt-4">
                      <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                        <Target className="h-5 w-5 text-yellow-400" />
                        Mission
                      </h3>
                      <p className="text-gray-300">{company.mission}</p>
                    </div>
                  )}

                  {company.techStack && company.techStack.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-semibold text-white mb-2">Tech Stack</h3>
                      <div className="flex flex-wrap gap-2">
                        {company.techStack.map((tech) => (
                          <Badge
                            key={tech}
                            variant="secondary"
                            className="bg-gray-700/50 text-gray-300 border-gray-600"
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-6">
                    <Badge
                      variant={company.verificationLevel === 'premium' ? "default" : "secondary"}
                      className={`${
                        company.verificationLevel === 'premium' 
                          ? 'bg-yellow-400 text-gray-900' 
                          : company.verificationLevel === 'professional'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-600 text-gray-300'
                      }`}
                    >
                      <Award className="h-3 w-3 mr-1" />
                      {company.verificationLevel.charAt(0).toUpperCase() + company.verificationLevel.slice(1)} Verification
                    </Badge>
                    {company.companySize && (
                      <div className="flex items-center gap-1 text-sm text-gray-400">
                        <Users className="h-4 w-4" />
                        {company.companySize} employees
                      </div>
                    )}
                  </div>
                </CardHeader>
              </Card>

              {/* Analytics */}
              {analytics && (
                <Card className="border-0 bg-gray-800/50 backdrop-blur-lg">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-yellow-400" />
                      Performance Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="text-center p-6 bg-gray-700/50 rounded-xl border border-gray-600">
                        <div className="text-3xl font-bold text-yellow-400">{analytics.conversionRate}%</div>
                        <div className="text-sm text-gray-400 mt-1">Conversion Rate</div>
                      </div>
                      <div className="text-center p-6 bg-gray-700/50 rounded-xl border border-gray-600">
                        <div className="text-3xl font-bold text-green-400">{analytics.averageTimeToHire}d</div>
                        <div className="text-sm text-gray-400 mt-1">Avg Time to Hire</div>
                      </div>
                      <div className="text-center p-6 bg-gray-700/50 rounded-xl border border-gray-600">
                        <div className="text-3xl font-bold text-purple-400">${analytics.costPerHire}</div>
                        <div className="text-sm text-gray-400 mt-1">Cost per Hire</div>
                      </div>
                      <div className="text-center p-6 bg-gray-700/50 rounded-xl border border-gray-600">
                        <div className="text-3xl font-bold text-yellow-400">{analytics.averageRating}/5</div>
                        <div className="text-sm text-gray-400 mt-1">Average Rating</div>
                      </div>
                      <div className="text-center p-6 bg-gray-700/50 rounded-xl border border-gray-600">
                        <div className="text-3xl font-bold text-blue-400">{analytics.responseRate}%</div>
                        <div className="text-sm text-gray-400 mt-1">Response Rate</div>
                      </div>
                      <div className="text-center p-6 bg-gray-700/50 rounded-xl border border-gray-600">
                        <div className="text-3xl font-bold text-green-400">{analytics.satisfactionScore}/5</div>
                        <div className="text-sm text-gray-400 mt-1">Satisfaction Score</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Edit Form */}
              {editing && (
                <Card className="border-0 bg-gray-800/50 backdrop-blur-lg">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-white">Edit Profile</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpdate} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-gray-200">Company Name</Label>
                          <Input
                            id="name"
                            value={editForm.name}
                            onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                            className="bg-gray-700/50 border-gray-600 text-white"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="industry" className="text-gray-200">Industry</Label>
                          <Select
                            value={editForm.industry}
                            onValueChange={(value) => setEditForm({...editForm, industry: value})}
                          >
                            <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                              <SelectValue placeholder="Select Industry" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-600">
                              {industries.map((industry) => (
                                <SelectItem key={industry} value={industry} className="text-white hover:bg-gray-700">
                                  {industry}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio" className="text-gray-200">Professional Bio</Label>
                        <Textarea
                          id="bio"
                          rows={4}
                          value={editForm.bio}
                          onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                          className="bg-gray-700/50 border-gray-600 text-white"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="website" className="text-gray-200">Website</Label>
                          <Input
                            id="website"
                            type="url"
                            value={editForm.website}
                            onChange={(e) => setEditForm({...editForm, website: e.target.value})}
                            className="bg-gray-700/50 border-gray-600 text-white"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="companySize" className="text-gray-200">Company Size</Label>
                          <Select
                            value={editForm.companySize}
                            onValueChange={(value) => setEditForm({...editForm, companySize: value})}
                          >
                            <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                              <SelectValue placeholder="Select Size" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-600">
                              {companySizes.map((size) => (
                                <SelectItem key={size} value={size} className="text-white hover:bg-gray-700">
                                  {size}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="mission" className="text-gray-200">Mission Statement</Label>
                        <Textarea
                          id="mission"
                          rows={3}
                          value={editForm.mission}
                          onChange={(e) => setEditForm({...editForm, mission: e.target.value})}
                          placeholder="What is your company's mission?"
                          className="bg-gray-700/50 border-gray-600 text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-200">Tech Stack</Label>
                        <div className="flex flex-wrap gap-2">
                          {commonTechStack.map((tech) => (
                            <Button
                              key={tech}
                              type="button"
                              onClick={() => {
                                if (editForm.techStack?.includes(tech)) {
                                  removeFromArray('techStack', tech);
                                } else {
                                  addToArray('techStack', tech);
                                }
                              }}
                              variant={editForm.techStack?.includes(tech) ? "default" : "outline"}
                              className={`${
                                editForm.techStack?.includes(tech)
                                  ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-300'
                                  : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600'
                              }`}
                            >
                              {tech}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <Button
                          type="submit"
                          disabled={loading}
                          className="bg-green-500 text-white hover:bg-green-600"
                        >
                          {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setEditing(false)}
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Profile Completion */}
              <Card className="border-0 bg-gray-800/50 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-white">Profile Completion</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-gray-300 mb-2">
                      <span>Complete</span>
                      <span>{company.completionPercentage || 0}%</span>
                    </div>
                    <Progress 
                      value={company.completionPercentage || 0} 
                      className="bg-gray-700"
                    />
                  </div>
                  <p className="text-sm text-gray-400">
                    Complete your profile to attract top talent and build trust.
                  </p>
                </CardContent>
              </Card>

              {/* Company Stats */}
              <Card className="border-0 bg-gray-800/50 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-yellow-400" />
                    Company Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Total Spent</span>
                      <span className="font-bold text-green-400">${company.totalSpent || 0}</span>
                    </div>
                    <Separator className="bg-gray-700" />
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Job Postings</span>
                      <span className="font-bold text-yellow-400">{company.jobPostings?.length || 0}</span>
                    </div>
                    <Separator className="bg-gray-700" />
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Founded</span>
                      <span className="font-bold text-purple-400">{company.foundedYear || 'N/A'}</span>
                    </div>
                    <Separator className="bg-gray-700" />
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Verification Level</span>
                      <Badge variant="secondary" className="bg-yellow-400/20 text-yellow-300">
                        {company.verificationLevel.charAt(0).toUpperCase() + company.verificationLevel.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Logo Upload */}
              <Card className="border-0 bg-gray-800/50 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <Upload className="h-5 w-5 text-yellow-400" />
                    Company Logo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
                      className="bg-gray-700/50 border-gray-600 text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-yellow-400/20 file:text-yellow-300 hover:file:bg-yellow-400/30"
                      disabled={uploadingLogo}
                    />
                    {uploadingLogo && (
                      <p className="text-sm text-yellow-400">Uploading logo...</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-0 bg-gray-800/50 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <Settings className="h-5 w-5 text-yellow-400" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => router.push('/company/jobs/new')}
                    className="w-full bg-green-500 text-white hover:bg-green-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Post New Job
                  </Button>
                  <Button
                    onClick={() => router.push('/company/discover')}
                    variant="outline"
                    className="w-full border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-gray-900"
                  >
                    <UserSearch className="h-4 w-4 mr-2" />
                    Discover VAs
                  </Button>
                  <Button
                    onClick={() => router.push('/company/jobs')}
                    variant="outline"
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <Briefcase className="h-4 w-4 mr-2" />
                    Manage Jobs
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}