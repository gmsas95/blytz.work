"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Briefcase, 
  Users, 
  DollarSign, 
  TrendingUp,
  FileText,
  Clock,
  Calendar,
  ArrowRight,
  Plus,
  Search,
  Bell,
  Star,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  MoreVertical
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { apiCall } from '@/lib/api';
import { DashboardNav } from '@/components/DashboardNav';

interface DashboardStats {
  activeJobs: number;
  totalApplications: number;
  hiredVAs: number;
  totalSpent: number;
  pendingReviews: number;
  unreadMessages: number;
  savedVAs: number;
}

interface Job {
  id: string;
  title: string;
  description: string;
  hourlyRate: { min: number; max: number };
  skills: string[];
  createdAt: string;
  status: 'active' | 'closed' | 'filled';
  applicationsCount: number;
}

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  vaName: string;
  vaAvatar?: string;
  hourlyRate: number;
  status: 'pending' | 'viewed' | 'interviewed' | 'hired' | 'rejected';
  appliedAt: string;
}

interface RecentActivity {
  id: string;
  type: 'application' | 'message' | 'hired' | 'review';
  message: string;
  time: string;
}

const EmployerDashboard = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    activeJobs: 0,
    totalApplications: 0,
    hiredVAs: 0,
    totalSpent: 0,
    pendingReviews: 0,
    unreadMessages: 0,
    savedVAs: 0
  });
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/auth');
        return;
      }

      // Fetch dashboard stats
      const statsResponse = await apiCall('/employer/dashboard/stats');
      if (statsResponse.ok) {
        const data = await statsResponse.json();
        setStats(data.data || stats);
      }

      // Fetch recent jobs
      const jobsResponse = await apiCall('/employer/jobs?limit=5');
      if (jobsResponse.ok) {
        const data = await jobsResponse.json();
        setRecentJobs(data.data?.jobs || []);
      }

      // Fetch recent applications
      const appsResponse = await apiCall('/employer/applications?limit=5');
      if (appsResponse.ok) {
        const data = await appsResponse.json();
        setRecentApplications(data.data?.applications || []);
      }

    } catch (error: any) {
      console.error('Dashboard data fetch error:', error);
      toast.error(error.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostJob = () => {
    router.push('/employer/jobs/post');
  };

  const handleViewAllJobs = () => {
    router.push('/employer/jobs');
  };

  const handleViewAllApplications = () => {
    router.push('/employer/applications');
  };

  const handleViewApplication = (applicationId: string) => {
    router.push(`/employer/applications/${applicationId}`);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
      active: { label: 'Active', variant: 'default' },
      closed: { label: 'Closed', variant: 'secondary' },
      filled: { label: 'Filled', variant: 'default' },
      pending: { label: 'Pending', variant: 'secondary' },
      viewed: { label: 'Viewed', variant: 'outline' },
      interviewed: { label: 'Interviewed', variant: 'default' },
      hired: { label: 'Hired', variant: 'default' },
      rejected: { label: 'Rejected', variant: 'destructive' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <DashboardNav userRole="employer" />
        <div className="container mx-auto px-4 max-w-7xl py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav userRole="employer" />
      
      <div className="container mx-auto px-4 max-w-7xl py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-slate-600">
            Here's what's happening with your hiring activity
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handlePostJob}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Post New Job</CardTitle>
              <Plus className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">Create Job</div>
              <p className="text-xs text-muted-foreground">
                Start hiring VAs now
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/employer/saved')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saved VAs</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.savedVAs}</div>
              <p className="text-xs text-muted-foreground">
                Saved for later
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/employer/messages')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.unreadMessages}</div>
              <p className="text-xs text-muted-foreground">
                Unread messages
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/employer/reviews')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reviews</CardTitle>
              <Star className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingReviews}</div>
              <p className="text-xs text-muted-foreground">
                Pending reviews
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeJobs}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+2</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalApplications}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12</span> from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">VAs Hired</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.hiredVAs}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+1</span> this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalSpent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                All time spending
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Jobs */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Jobs</CardTitle>
                  <CardDescription>Your latest job postings</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={handleViewAllJobs}>
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentJobs.length > 0 ? (
                <div className="space-y-4">
                  {recentJobs.map((job) => (
                    <div key={job.id} className="flex items-start justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm mb-1">{job.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <DollarSign className="h-3 w-3" />
                          <span>${job.hourlyRate.min} - ${job.hourlyRate.max}/hr</span>
                          <Separator orientation="vertical" className="h-3" />
                          <FileText className="h-3 w-3" />
                          <span>{job.applicationsCount} applications</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(job.status)}
                        <span className="text-xs text-slate-500">{getRelativeTime(job.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-sm text-slate-600 mb-4">No jobs posted yet</p>
                  <Button size="sm" onClick={handlePostJob}>
                    <Plus className="h-4 w-4 mr-1" />
                    Post Your First Job
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Applications */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Applications</CardTitle>
                  <CardDescription>Latest VA applications</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={handleViewAllApplications}>
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentApplications.length > 0 ? (
                <div className="space-y-3">
                  {recentApplications.map((app) => (
                    <div 
                      key={app.id} 
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => handleViewApplication(app.id)}
                    >
                      <div className="flex items-center gap-3">
                        {app.vaAvatar ? (
                          <img
                            src={app.vaAvatar}
                            alt={app.vaName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                            {app.vaName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium text-sm">{app.vaName}</h4>
                          <p className="text-xs text-slate-600">{app.jobTitle}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">${app.hourlyRate}/hr</span>
                        {getStatusBadge(app.status)}
                        <span className="text-xs text-slate-500">{getRelativeTime(app.appliedAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-sm text-slate-600 mb-4">No applications yet</p>
                  <Button size="sm" onClick={handlePostJob}>
                    <Plus className="h-4 w-4 mr-1" />
                    Post a Job to Get Applications
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Hiring Tips Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Hiring Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium text-sm mb-2">Write Clear Job Descriptions</h4>
                <p className="text-xs text-slate-600">
                  Be specific about requirements, responsibilities, and what you're looking for.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-2">Review Applications Quickly</h4>
                <p className="text-xs text-slate-600">
                  Top VAs receive multiple offers. Respond within 24-48 hours.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-2">Start with a Trial</h4>
                <p className="text-xs text-slate-600">
                  Consider a 1-week trial period to ensure the VA is a good fit.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployerDashboard;
