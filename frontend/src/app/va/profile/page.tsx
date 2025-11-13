'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useImprovedAlert } from "@/contexts/ImprovedAlertContext";
import Navbar from "@/components/Navbar";
import { 
  Edit3, 
  User, 
  DollarSign, 
  Globe, 
  Star, 
  Eye, 
  Briefcase, 
  GraduationCap,
  TrendingUp,
  Clock,
  CheckCircle,
  Upload,
  Award,
  FileText,
  Video
} from 'lucide-react';
import { Button } from '@/components/ui-shadcn/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui-shadcn/card';
import { Input } from '@/components/ui-shadcn/input';
import { Label } from '@/components/ui-shadcn/label';
import { Textarea } from '@/components/ui-shadcn/textarea';
import { Badge } from '@/components/ui-shadcn/badge';
import { Progress } from '@/components/ui-shadcn/progress';
import { Separator } from '@/components/ui-shadcn/separator';
import { Alert, AlertDescription } from '@/components/ui-shadcn/alert';

interface VAProfile {
  id: string;
  name: string;
  bio: string;
  country: string;
  hourlyRate: number;
  skills: string[];
  availability: boolean;
  email?: string;
  phone?: string;
  timezone?: string;
  languages?: Array<{ code: string; level: string }>;
  workExperience?: Array<{
    company: string;
    role: string;
    years: number;
    description?: string;
    achievements?: string[];
  }>;
  education?: Array<{
    institution: string;
    degree: string;
    field?: string;
    startDate: string;
    endDate?: string;
    gpa?: number;
    achievements?: string[];
  }>;
  averageRating?: number;
  totalReviews?: number;
  profileViews?: number;
  earnedAmount?: number;
  completedJobs?: number;
  completionPercentage?: number;
}

interface Analytics {
  conversionRate: number;
  averageResponseTime: number;
  trends: Array<{ date: string; views: number; matches: number }>;
}

// Mock data for when APIs are not available
const mockProfile: VAProfile = {
  id: '1',
  name: 'Demo VA',
  bio: 'Experienced virtual assistant specializing in administrative tasks',
  country: 'United States',
  hourlyRate: 25,
  skills: ['Email Management', 'Calendar Management', 'Data Entry'],
  availability: true,
  email: 'demo@example.com',
  phone: '+1-555-0123',
  timezone: 'EST',
  languages: [{ code: 'en', level: 'native' }],
  workExperience: [{
    company: 'Demo Company',
    role: 'Executive Assistant',
    years: 3,
    description: 'Provided administrative support to C-level executives'
  }],
  education: [{
    institution: 'Demo University',
    degree: 'Bachelor of Business Administration',
    startDate: '2020-09-01',
    endDate: '2024-06-01'
  }],
  averageRating: 4.8,
  totalReviews: 24,
  profileViews: 145,
  earnedAmount: 12500,
  completedJobs: 18,
  completionPercentage: 85
};

const mockAnalytics: Analytics = {
  conversionRate: 15,
  averageResponseTime: 2.5,
  trends: [
    { date: '2024-01', views: 120, matches: 18 },
    { date: '2024-02', views: 150, matches: 22 }
  ]
};

export default function VAProfile() {
  const router = useRouter();
  const { user } = useAuth();
  const { addAlert } = useImprovedAlert();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<VAProfile | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);

  const [editForm, setEditForm] = useState<VAProfile>({
    id: '',
    name: '',
    bio: '',
    country: '',
    hourlyRate: 25,
    skills: [],
    availability: true,
    email: '',
    phone: '',
    timezone: '',
    languages: [],
    workExperience: [],
    education: []
  });

  useEffect(() => {
    if (user && user.role === 'va') {
      fetchProfile();
      fetchAnalytics();
    } else if (user) {
      router.push('/company/profile');
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/va/profile');
      
      if (!response.ok) {
        if (response.status === 404) {
          router.push('/va/profile/create');
          return;
        }
        console.warn('Profile API not available, using mock data');
        setProfile(mockProfile);
        setEditForm(mockProfile);
        return;
      }
      
      const result = await response.json();
      setProfile(result.data);
      setEditForm(result.data);
    } catch (error: any) {
      addAlert(error.message || 'Failed to fetch profile', 'error');
      setProfile(mockProfile);
      setEditForm(mockProfile);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/va/analytics');
      
      if (!response.ok) {
        console.warn('Analytics API not available, using mock data');
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
      const response = await fetch('/api/va/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        addAlert('Profile update API not available, but local state updated', 'info');
        setProfile(editForm);
        setEditing(false);
        return;
      }
      
      const result = await response.json();
      setProfile(result.data);
      setEditing(false);
      addAlert('Profile updated successfully!', 'success');
    } catch (error: any) {
      addAlert(error.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, type: 'resume' | 'video') => {
    setUploadingFile(type);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadResult.error || 'Failed to upload file');
      }

      addAlert(`${type === 'resume' ? 'Resume' : 'Video'} uploaded successfully!`, 'success');
      fetchProfile();
    } catch (error: any) {
      addAlert(error.message || `Failed to upload ${type}`, 'error');
    } finally {
      setUploadingFile(null);
    }
  };

  const handleSkillsAssessment = async () => {
    const skillsToAssess = ['JavaScript', 'Communication', 'Time Management'];
    
    for (const skill of skillsToAssess) {
      try {
        const response = await fetch('/api/va/skills-assessment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ skillName: skill }),
        });

        if (response.ok) {
          addAlert(`Skills assessment for ${skill} completed!`, 'success');
        }
      } catch (error) {
        console.error(`Failed to assess ${skill}:`, error);
      }
    }
    
    setTimeout(fetchProfile, 1000);
  };

  if (loading && !profile) {
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

  if (!profile) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <Card className="max-w-md border-0 bg-gray-800/50 backdrop-blur-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white">Profile Not Found</CardTitle>
              <CardDescription className="text-gray-300">
                Please create your profile first.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => router.push('/va/profile/create')}
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
                    <div>
                      <CardTitle className="text-3xl font-bold text-white mb-2">{profile.name}</CardTitle>
                      <div className="flex items-center gap-4 text-gray-300">
                        <div className="flex items-center gap-1">
                          <Globe className="h-4 w-4" />
                          {profile.country}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          ${profile.hourlyRate}/hr
                        </div>
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

                  <div className="flex flex-wrap gap-2 mt-4">
                    {profile.skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="bg-yellow-400/20 text-yellow-300 border-yellow-400/30"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  <p className="text-gray-300 whitespace-pre-wrap mt-4">{profile.bio}</p>

                  <div className="flex items-center gap-4 mt-6">
                    <Badge
                      variant={profile.availability ? "default" : "secondary"}
                      className={`${
                        profile.availability 
                          ? 'bg-green-500 text-white' 
                          : 'bg-red-500 text-white'
                      }`}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {profile.availability ? 'Available' : 'Unavailable'}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-gray-400">
                      <Eye className="h-4 w-4" />
                      {profile.profileViews || 0} profile views
                    </div>
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
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="text-center p-6 bg-gray-700/50 rounded-xl border border-gray-600">
                        <div className="text-3xl font-bold text-yellow-400">{analytics.conversionRate}%</div>
                        <div className="text-sm text-gray-400 mt-1">Conversion Rate</div>
                      </div>
                      <div className="text-center p-6 bg-gray-700/50 rounded-xl border border-gray-600">
                        <div className="text-3xl font-bold text-green-400">{analytics.averageResponseTime}h</div>
                        <div className="text-sm text-gray-400 mt-1">Avg Response Time</div>
                      </div>
                      <div className="text-center p-6 bg-gray-700/50 rounded-xl border border-gray-600">
                        <div className="text-3xl font-bold text-purple-400">{profile.completedJobs || 0}</div>
                        <div className="text-sm text-gray-400 mt-1">Completed Jobs</div>
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
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-200">Full Name</Label>
                        <Input
                          id="name"
                          value={editForm.name}
                          onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                          className="bg-gray-700/50 border-gray-600 text-white"
                        />
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

                      <div className="space-y-2">
                        <Label htmlFor="hourlyRate" className="text-gray-200">Hourly Rate (USD)</Label>
                        <Input
                          id="hourlyRate"
                          type="number"
                          value={editForm.hourlyRate}
                          onChange={(e) => setEditForm({...editForm, hourlyRate: parseInt(e.target.value)})}
                          className="bg-gray-700/50 border-gray-600 text-white"
                        />
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
                      <span>{profile.completionPercentage || 0}%</span>
                    </div>
                    <Progress 
                      value={profile.completionPercentage || 0} 
                      className="bg-gray-700"
                    />
                  </div>
                  <p className="text-sm text-gray-400">
                    Complete your profile to get more matches and better opportunities.
                  </p>
                </CardContent>
              </Card>

              {/* Stats */}
              <Card className="border-0 bg-gray-800/50 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-yellow-400" />
                    Your Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Total Earnings</span>
                      <span className="font-bold text-green-400">${profile.earnedAmount || 0}</span>
                    </div>
                    <Separator className="bg-gray-700" />
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Completed Jobs</span>
                      <span className="font-bold text-yellow-400">{profile.completedJobs || 0}</span>
                    </div>
                    <Separator className="bg-gray-700" />
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Average Rating</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="font-bold text-yellow-400">{profile.averageRating?.toFixed(1) || 'N/A'}</span>
                      </div>
                    </div>
                    <Separator className="bg-gray-700" />
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Total Reviews</span>
                      <span className="font-bold text-purple-400">{profile.totalReviews || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Uploads */}
              <Card className="border-0 bg-gray-800/50 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <Upload className="h-5 w-5 text-yellow-400" />
                    Documents & Media
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-200 mb-2 block">Resume/CV</Label>
                    <div className="relative">
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'resume')}
                        className="bg-gray-700/50 border-gray-600 text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-yellow-400/20 file:text-yellow-300 hover:file:bg-yellow-400/30"
                        disabled={uploadingFile === 'resume'}
                      />
                      <FileText className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                    {uploadingFile === 'resume' && (
                      <p className="text-sm text-yellow-400 mt-1">Uploading resume...</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-gray-200 mb-2 block">Video Introduction</Label>
                    <div className="relative">
                      <Input
                        type="file"
                        accept="video/*"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'video')}
                        className="bg-gray-700/50 border-gray-600 text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-yellow-400/20 file:text-yellow-300 hover:file:bg-yellow-400/30"
                        disabled={uploadingFile === 'video'}
                      />
                      <Video className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                    {uploadingFile === 'video' && (
                      <p className="text-sm text-yellow-400 mt-1">Uploading video...</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Skills Assessment */}
              <Card className="border-0 bg-gray-800/50 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-400" />
                    Skills Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-400">
                    Take skills assessments to showcase your expertise and get more matches.
                  </p>
                  <Button
                    onClick={handleSkillsAssessment}
                    className="w-full bg-purple-600 text-white hover:bg-purple-700"
                  >
                    Take Assessments
                  </Button>
                </CardContent>
              </Card>

              {/* Verification */}
              <Card className="border-0 bg-gray-800/50 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-yellow-400" />
                    Verification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Background Check</span>
                    <Badge variant="secondary" className="bg-yellow-400/20 text-yellow-300">
                      Basic
                    </Badge>
                  </div>
                  <Button
                    className="w-full bg-yellow-400 text-gray-900 hover:bg-yellow-300"
                  >
                    Upgrade Verification
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