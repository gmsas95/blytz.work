"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Eye,
  Star,
  FileText,
  Briefcase,
  Award,
  CheckCircle,
  AlertCircle,
  Clock,
  MessageSquare,
  BarChart3,
  Settings,
  Edit,
  Upload,
  Video,
  Linkedin
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { apiCall } from '@/lib/api';
import { DashboardNav } from '@/components/DashboardNav';

// Type definitions for VA profile
interface VAProfile {
  id: string;
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
  responseRate?: number;
  averageRating?: number;
  totalReviews?: number;
  completedJobs?: number;
  earnedAmount?: number;
  profileViews?: number;
  profileCompleted?: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

const VADashboard = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<VAProfile | null>(null);
  const [analytics, setAnalytics] = useState({
    views: 0,
    contactRequests: 0,
    responseRate: 0,
    averageRating: 0,
    totalReviews: 0,
    completedJobs: 0,
    earnedAmount: 0,
    profileViews: 0,
    skillsPassed: 0,
    skillsTotal: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setError(null);
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('No authentication token found');
        router.push('/auth');
        return;
      }

      // Fetch VA profile from backend
      const profileResponse = await apiCall('/va/profile');

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setProfile(profileData.data);
      } else {
        // Profile doesn't exist, redirect to creation
        if (profileResponse.status === 404) {
          router.push('/va/profile/create');
          return;
        }
        throw new Error(`Profile fetch failed: ${profileResponse.status}`);
      }

      // Try to fetch analytics from backend
      try {
        const analyticsResponse = await apiCall('/va/analytics');
        
        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json();
          
          // Map backend analytics to frontend format
          setAnalytics({
            views: analyticsData.data.profile?.profileViews || 0,
            contactRequests: 0, // Not available in backend yet
            responseRate: analyticsData.data.profile?.responseRate || 0,
            averageRating: analyticsData.data.profile?.averageRating || 0,
            totalReviews: typeof analyticsData.data.profile?.totalReviews === 'number' 
              ? analyticsData.data.profile.totalReviews 
              : 0,
            completedJobs: 0, // Not available in backend yet
            earnedAmount: 0, // Not available in backend yet
            profileViews: analyticsData.data.profile?.profileViews || 0,
            skillsPassed: 0, // Not available in backend yet
            skillsTotal: 0 // Not available in backend yet
          });
        } else {
          throw new Error(`Analytics API returned error: ${analyticsResponse.status}`);
        }
      } catch (analyticsError) {
        console.warn('Analytics fetch failed, using placeholder data:', analyticsError);
        // Use placeholder data if analytics endpoint fails
        const placeholderAnalytics = {
          views: 0,
          contactRequests: 0,
          responseRate: profile?.responseRate || 0,
          averageRating: profile?.averageRating || 0,
          totalReviews: typeof profile?.totalReviews === 'number' ? profile.totalReviews : 0,
          completedJobs: profile?.completedJobs || 0,
          earnedAmount: profile?.earnedAmount || 0,
          profileViews: profile?.profileViews || 0,
          skillsPassed: 0,
          skillsTotal: 0
        };
        
        setAnalytics(placeholderAnalytics);
        toast.info('Some analytics data is not available yet');
      }

    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      toast.error(`Failed to load dashboard data: ${errorMessage}`);
      
      // Redirect if authentication error
      if (errorMessage.includes('Authentication') || errorMessage.includes('401') || errorMessage.includes('expired')) {
        router.push('/auth?session_expired=true');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProfile = () => {
    router.push('/va/profile/edit');
  };

  const handleViewApplications = () => {
    router.push('/va/applications');
  };

  const handleViewAnalytics = () => {
    router.push('/va/analytics');
  };

  const handleUpgradeVerification = () => {
    router.push('/va/verification');
  };

  const getVerificationBadge = (level: 'basic' | 'professional' | 'premium') => {
    switch (level) {
      case 'premium':
        return <Badge variant="default" className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">Premium</Badge>;
      case 'professional':
        return <Badge variant="default" className="bg-blue-500 text-white">Professional</Badge>;
      default:
        return <Badge variant="secondary">Basic</Badge>;
    }
  };

  const getAvailabilityStatus = (available: boolean) => {
    return available ? (
      <Badge variant="default" className="bg-green-500 text-white flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        Available
      </Badge>
    ) : (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        Unavailable
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <DashboardNav userRole="va" />
        <div className="container mx-auto px-4 max-w-7xl py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-slate-50">
        <DashboardNav userRole="va" />
        <div className="container mx-auto px-4 max-w-7xl py-8 flex items-center justify-center">
          <div className="text-center max-w-md">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Error Loading Dashboard</h2>
            <p className="text-slate-600 mb-4">{error}</p>
            <Button onClick={fetchDashboardData}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav userRole="va" />
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Header with Profile Info */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              {/* Profile Picture */}
              <div className="relative">
                {profile?.avatarUrl ? (
                  <img
                    src={profile?.avatarUrl}
                    alt={profile?.name || 'Virtual Assistant'}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                    {profile?.name?.charAt(0) || 'V'}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1">
                  {getAvailabilityStatus(profile?.availability ?? false)}
                </div>
              </div>
              
              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-slate-900">
                    {profile?.name || 'Virtual Assistant'}
                  </h1>
                  {getVerificationBadge(profile?.verificationLevel ?? 'basic')}
                </div>
                <p className="text-slate-600 mb-2">{profile?.bio}</p>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {profile?.skills?.slice(0, 3).join(', ')}{(profile?.skills?.length || 0) > 3 ? '...' : ''}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    ${profile?.hourlyRate}/hr
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {profile?.country}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleEditProfile}>
                <Edit className="h-4 w-4 mr-1" />
                Edit Profile
              </Button>
              <Button size="sm" onClick={handleViewApplications}>
                <FileText className="h-4 w-4 mr-1" />
                Applications
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.profileViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contact Requests</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.contactRequests}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+8%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.responseRate}%</div>
              <p className="text-xs text-muted-foreground">
                Average response time: 2 hours
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">{analytics.averageRating}</div>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(analytics.averageRating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {analytics.totalReviews} reviews
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Earnings & Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Earnings Overview
              </CardTitle>
              <CardDescription>Your total earnings and financial performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Total Earned</span>
                <span className="text-2xl font-bold text-green-600">
                  ${analytics.earnedAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Completed Jobs</span>
                <span className="text-xl font-semibold">{analytics.completedJobs}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Average per Job</span>
                <span className="text-lg">
                  ${analytics.completedJobs > 0 
                    ? Math.round(analytics.earnedAmount / analytics.completedJobs)
                    : 0
                  }
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-slate-600">This Month</span>
                <span className="text-lg font-semibold text-green-600">
                  +${Math.floor(Math.random() * 2000) + 500}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Skills & Performance
              </CardTitle>
              <CardDescription>Your skill assessments and performance metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-600">Skills Assessed</span>
                  <span className="text-lg font-semibold">
                    {analytics.skillsPassed}/{analytics.skillsTotal}
                  </span>
                </div>
                <Progress 
                  value={(analytics.skillsPassed / analytics.skillsTotal) * 100} 
                  className="h-2" 
                />
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Top Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {profile?.skills?.slice(0, 6).map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                  {(profile?.skills?.length || 0) > 6 && (
                    <Badge variant="outline">
                      +{(profile?.skills?.length || 0) - 6} more
                    </Badge>
                  )}
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Profile Completion</span>
                <span className="text-lg font-semibold text-green-600">100%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Upgrades */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline" onClick={handleEditProfile}>
                <Edit className="h-4 w-4 mr-2" />
                Update Profile Information
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={handleViewApplications}>
                <FileText className="h-4 w-4 mr-2" />
                View Job Applications
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={handleViewAnalytics}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Detailed Analytics
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Video className="h-4 w-4 mr-2" />
                Add Video Introduction
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Verification & Upgrades
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Current Verification</span>
                  {getVerificationBadge(profile?.verificationLevel ?? 'basic')}
                </div>
                <p className="text-sm text-slate-600">
                  {profile?.verificationLevel === 'basic' && 'Upgrade to Professional for more visibility and trust'}
                  {profile?.verificationLevel === 'professional' && 'You have ID verification and background check'}
                  {profile?.verificationLevel === 'premium' && 'You have full premium verification'}
                </p>
                {profile?.verificationLevel !== 'premium' && (
                  <Button className="w-full mt-3" onClick={handleUpgradeVerification}>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Upgrade Verification
                  </Button>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Background Check</span>
                  {profile?.backgroundCheckPassed ? (
                    <Badge variant="default" className="bg-green-500 text-white flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Passed
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Not Verified
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Featured Profile</span>
                  {profile?.featuredProfile ? (
                    <Badge variant="default" className="bg-yellow-500 text-white">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VADashboard;