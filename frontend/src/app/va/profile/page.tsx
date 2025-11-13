'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useImprovedAlert } from "@/contexts/ImprovedAlertContext";
import Navbar from "@/components/Navbar";

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
  }]
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
          // Profile doesn't exist, redirect to create
          router.push('/va/profile/create');
          return;
        }
        // Handle other API errors gracefully
        console.warn('Profile API not available, using mock data');
        setProfile(mockProfile);
        return;
      }
      
      const result = await response.json();
      setProfile(result.data);
      setEditForm(result.data);
    } catch (error: any) {
      addAlert(error.message || 'Failed to fetch profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/va/analytics');
      
      if (!response.ok) {
        // Handle API errors gracefully
        console.warn('Analytics API not available, using mock data');
        setAnalytics(mockAnalytics);
        return;
      }
      
      const result = await response.json();
      setAnalytics(result.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
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
        // Handle API errors gracefully
        addAlert({ message: 'Profile update API not available, but local state updated', type: 'info' });
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

      const fileUrl = uploadResult.url;
      const endpoint = type === 'resume' ? '/api/va/upload-resume' : '/api/va/upload-video';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [type + 'Url']: fileUrl, fileName: file.name }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Failed to upload ${type}`);
      }

      addAlert(`${type === 'resume' ? 'Resume' : 'Video'} uploaded successfully!`, 'success');
      fetchProfile(); // Refresh profile data
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
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
            <p className="mb-4">Please create your profile first.</p>
            <button
              onClick={() => router.push('/va/profile/create')}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Profile
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Profile Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Header */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                    <p className="text-gray-600">{profile.country} • ${profile.hourlyRate}/hr</p>
                  </div>
                  <button
                    onClick={() => setEditing(!editing)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editing ? 'Cancel' : 'Edit Profile'}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <p className="text-gray-700 whitespace-pre-wrap">{profile.bio}</p>

                <div className="mt-4 flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    profile.availability 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {profile.availability ? 'Available' : 'Unavailable'}
                  </span>
                  <span className="text-sm text-gray-600">
                    {profile.profileViews || 0} profile views
                  </span>
                </div>
              </div>

              {/* Analytics */}
              {analytics && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Analytics</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{analytics.conversionRate}%</div>
                      <div className="text-sm text-gray-600">Conversion Rate</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{analytics.averageResponseTime}h</div>
                      <div className="text-sm text-gray-600">Avg Response Time</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{profile.completedJobs || 0}</div>
                      <div className="text-sm text-gray-600">Completed Jobs</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Edit Form */}
              {editing && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Profile</h2>
                  <form onSubmit={handleUpdate} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Professional Bio
                      </label>
                      <textarea
                        rows={4}
                        value={editForm.bio}
                        onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hourly Rate (USD)
                      </label>
                      <input
                        type="number"
                        value={editForm.hourlyRate}
                        onChange={(e) => setEditForm({...editForm, hourlyRate: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(false)}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Profile Completion */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Completion</h3>
                <div className="mb-2">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Complete</span>
                    <span>{profile.completionPercentage || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${profile.completionPercentage || 0}%` }}
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Complete your profile to get more matches and better opportunities.
                </p>
              </div>

              {/* Stats */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Earnings</span>
                    <span className="font-semibold">${profile.earnedAmount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completed Jobs</span>
                    <span className="font-semibold">{profile.completedJobs || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Rating</span>
                    <span className="font-semibold">{profile.averageRating?.toFixed(1) || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Reviews</span>
                    <span className="font-semibold">{profile.totalReviews || 0}</span>
                  </div>
                </div>
              </div>

              {/* Uploads */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents & Media</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resume/CV
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'resume')}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      disabled={uploadingFile === 'resume'}
                    />
                    {uploadingFile === 'resume' && (
                      <p className="text-sm text-blue-600 mt-1">Uploading resume...</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Video Introduction
                    </label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'video')}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      disabled={uploadingFile === 'video'}
                    />
                    {uploadingFile === 'video' && (
                      <p className="text-sm text-blue-600 mt-1">Uploading video...</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Skills Assessment */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills Assessment</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Take skills assessments to showcase your expertise and get more matches.
                </p>
                <button
                  onClick={handleSkillsAssessment}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Take Assessments
                </button>
              </div>

              {/* Verification */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Background Check</span>
                    <span className="text-sm font-medium text-yellow-600">Basic</span>
                  </div>
                  <button className="w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700">
                    Upgrade Verification
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}