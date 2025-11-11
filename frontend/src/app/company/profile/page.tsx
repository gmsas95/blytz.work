import { AlertContainer } from "@/components/ui/Alert";
// Enhanced Company Profile Management Page
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase';
import { apiClient, handleAPIError } from '@/lib/api';
import { 
  Building, 
  Globe, 
  Users, 
  Award, 
  TrendingUp, 
  Star, 
  CheckCircle, 
  Camera,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Eye,
  Briefcase,
  Calendar,
  MapPin,
  DollarSign,
  Target
} from 'lucide-react';
import { useAlert } from '@/components/ui/Alert';

interface CompanyProfile {
  id: string;
  name: string;
  bio: string;
  country: string;
  website?: string;
  logoUrl?: string;
  industry?: string;
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
  verificationLevel: 'basic' | 'professional' | 'premium';
  backgroundCheckPassed: boolean;
  featuredCompany: boolean;
  jobPostings: Array<{
    id: string;
    title: string;
    isActive: boolean;
    createdAt: string;
    _count: { matches: number };
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
  }>;
  completionPercentage: number;
}

export default function CompanyProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<CompanyProfile>>({});
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'jobs' | 'analytics'>('profile');
  
  const { addAlert } = useAlert();

  // Load profile
  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await apiClient.company.profile();
      setProfile(response.data);
      setEditData(response.data);
    } catch (error: any) {
      if (error.status === 404) {
        // Profile doesn't exist, redirect to create
        window.location.href = '/company/profile/create';
      } else {
        addAlert('error', handleAPIError(error).message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    try {
      setLoading(true);
      const response = await apiClient.company.updateProfile(editData);
      setProfile(response.data);
      setEditing(false);
      addAlert('success', 'Company profile updated successfully!');
    } catch (error: any) {
      addAlert('error', handleAPIError(error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (file: File) => {
    try {
      setUploadingLogo(true);
      
      // Get presigned URL
      const uploadResponse = await apiClient.company.getLogoUploadUrl(file.name, file.type);
      const { presignedUrl, fileUrl } = uploadResponse.data;

      // Upload to S3
      await apiClient.upload.uploadToS3(presignedUrl, file);

      // Update company logo
      const response = await apiClient.company.uploadLogo({
        logoUrl: fileUrl,
        fileType: file.type
      });

      setProfile(prev => prev ? { ...prev, logoUrl: response.data.logoUrl } : null);
      addAlert('success', 'Company logo uploaded successfully!');
    } catch (error: any) {
      addAlert('error', handleAPIError(error).message);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleVerification = async (level: 'professional' | 'premium') => {
    try {
      const response = await apiClient.company.verification(level);
      setProfile(prev => prev ? { ...prev, verificationLevel: response.data.verificationLevel } : null);
      addAlert('success', `${level === 'premium' ? 'Premium' : 'Professional'} verification request submitted!`);
    } catch (error: any) {
      addAlert('error', handleAPIError(error).message);
    }
  };

  const handleCreateJob = () => {
    window.location.href = '/company/jobs/new';
  };

  const handleToggleJob = async (jobId: string, isActive: boolean) => {
    try {
      const response = await apiClient.company.jobs.toggle(jobId, isActive);
      setProfile(prev => prev ? {
        ...prev,
        jobPostings: prev.jobPostings.map(job => 
          job.id === jobId ? { ...job, isActive: response.data.isActive } : job
        )
      } : null);
      addAlert('success', `Job ${isActive ? 'activated' : 'deactivated'} successfully!`);
    } catch (error: any) {
      addAlert('error', handleAPIError(error).message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading company profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Company Profile Not Found</h2>
          <p className="text-gray-600 mb-4">Your company profile could not be found.</p>
          <button
            onClick={() => window.location.href = '/company/profile/create'}
            className="btn-primary"
          >
            Create Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <AlertContainer />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  {profile.logoUrl ? (
                    <img 
                      src={profile.logoUrl} 
                      alt={profile.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-primary-100 flex items-center justify-center">
                      <Building className="w-8 h-8 text-primary-600" />
                    </div>
                  )}
                  <button
                    onClick={() => document.getElementById('logo-upload')?.click()}
                    className="absolute bottom-0 right-0 bg-primary-600 text-white p-1 rounded-full"
                    disabled={uploadingLogo}
                  >
                    <Camera className="w-3 h-3" />
                  </button>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                  <p className="text-gray-600">{profile.country} • {profile.industry}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    {profile.companySize && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {profile.companySize} employees
                      </span>
                    )}
                    {profile.verificationLevel !== 'basic' && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        profile.verificationLevel === 'premium' 
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {profile.verificationLevel === 'premium' ? 'Premium' : 'Professional'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {editing ? (
                  <>
                    <button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="btn-success flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false);
                        setEditData(profile);
                      }}
                      className="btn-secondary"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setEditing(true)}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </button>
                    {profile.verificationLevel === 'basic' && (
                      <button
                        onClick={() => handleVerification('professional')}
                        className="btn-secondary"
                      >
                        Get Verified
                      </button>
                    )}
                    <button
                      onClick={handleCreateJob}
                      className="btn-success flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Post Job</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Profile Completion */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Profile Completion</span>
                <span className="text-sm font-medium text-gray-900">{profile.completionPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${profile.completionPercentage}%` }}
                />
              </div>
              {profile.completionPercentage < 80 && (
                <p className="text-sm text-gray-600 mt-2">
                  Complete your profile to attract top talent and improve visibility.
                </p>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`py-2 px-6 text-sm font-medium border-b-2 ${
                    activeTab === 'profile'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab('jobs')}
                  className={`py-2 px-6 text-sm font-medium border-b-2 ${
                    activeTab === 'jobs'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Job Postings ({profile.jobPostings.length})
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`py-2 px-6 text-sm font-medium border-b-2 ${
                    activeTab === 'analytics'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Analytics
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h2>
                  {editing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                        <input
                          type="text"
                          value={editData.name || ''}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                        <textarea
                          value={editData.bio || ''}
                          onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                          <input
                            type="text"
                            value={editData.industry || ''}
                            onChange={(e) => setEditData({ ...editData, industry: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
                          <select
                            value={editData.companySize || ''}
                            onChange={(e) => setEditData({ ...editData, companySize: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          >
                            <option value="">Select size</option>
                            <option value="1-10">1-10</option>
                            <option value="11-50">11-50</option>
                            <option value="51-200">51-200</option>
                            <option value="201+">201+</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                          <input
                            type="url"
                            value={editData.website || ''}
                            onChange={(e) => setEditData({ ...editData, website: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Founded Year</label>
                          <input
                            type="number"
                            value={editData.foundedYear || ''}
                            onChange={(e) => setEditData({ ...editData, foundedYear: parseInt(e.target.value) })}
                            min="1800"
                            max={new Date().getFullYear()}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Description</span>
                        <p className="mt-1 text-gray-600">{profile.bio}</p>
                      </div>
                      {profile.mission && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Mission</span>
                          <p className="mt-1 text-gray-600">{profile.mission}</p>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Industry</span>
                          <p className="mt-1 text-gray-600">{profile.industry || 'Not specified'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Company Size</span>
                          <p className="mt-1 text-gray-600">{profile.companySize || 'Not specified'}</p>
                        </div>
                      </div>
                      {profile.website && (
                        <div className="flex items-center space-x-2">
                          <Globe className="w-4 h-4 text-gray-400" />
                          <a 
                            href={profile.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-700"
                          >
                            {profile.website}
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Values & Benefits */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Values & Benefits</h2>
                  {profile.values && profile.values.length > 0 && (
                    <div className="mb-6">
                      <span className="text-sm font-medium text-gray-700">Company Values</span>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {profile.values.map((value, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                          >
                            {value}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {profile.benefits && profile.benefits.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Benefits</span>
                      <div className="mt-2 space-y-1">
                        {profile.benefits.map((benefit, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-600">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {(!profile.values || profile.values.length === 0) && 
                   (!profile.benefits || profile.benefits.length === 0) && (
                    <p className="text-gray-600">No values or benefits added yet.</p>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Verification Status */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Current Level</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        profile.verificationLevel === 'premium' 
                          ? 'bg-purple-100 text-purple-700'
                          : profile.verificationLevel === 'professional'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {profile.verificationLevel === 'premium' ? 'Premium' : 
                         profile.verificationLevel === 'professional' ? 'Professional' : 'Basic'}
                      </span>
                    </div>
                    {profile.verificationLevel === 'basic' && (
                      <button
                        onClick={() => handleVerification('professional')}
                        className="btn-primary w-full"
                      >
                        Get Professional Verification
                      </button>
                    )}
                    {profile.verificationLevel === 'professional' && (
                      <button
                        onClick={() => handleVerification('premium')}
                        className="btn-secondary w-full"
                      >
                        Upgrade to Premium
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Job Postings</span>
                      <span className="text-sm font-medium text-gray-900">{profile.jobPostings.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Active Jobs</span>
                      <span className="text-sm font-medium text-gray-900">
                        {profile.jobPostings.filter(job => job.isActive).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Reviews</span>
                      <span className="text-sm font-medium text-gray-900">{profile.reviews.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Profile Completion</span>
                      <span className="text-sm font-medium text-gray-900">{profile.completionPercentage}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'jobs' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Job Postings</h2>
                <button
                  onClick={handleCreateJob}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Post New Job</span>
                </button>
              </div>

              {profile.jobPostings.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No job postings yet</h3>
                  <p className="text-gray-600 mb-4">Create your first job posting to start attracting talent.</p>
                  <button
                    onClick={handleCreateJob}
                    className="btn-primary"
                  >
                    Create Job Posting
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {profile.jobPostings.map((job) => (
                    <div key={job.id} className="bg-white rounded-lg shadow-sm p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          job.isActive 
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {job.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          onClick={() => handleToggleJob(job.id, !job.isActive)}
                          className="text-primary-600 hover:text-primary-700 text-sm"
                        >
                          {job.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h3>
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                        <span>{job._count.matches} applicants</span>
                        <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => window.location.href = `/company/jobs/${job.id}/edit`}
                          className="btn-secondary text-sm flex-1"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => window.location.href = `/company/jobs/${job.id}/applicants`}
                          className="btn-primary text-sm flex-1"
                        >
                          View Applicants
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Coming Soon Placeholder */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics Coming Soon</h3>
                  <p className="text-gray-600 mb-4">
                    Get insights into your job posting performance, candidate quality, and hiring metrics.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-600">24</div>
                      <div className="text-sm text-gray-600">Total Applications</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">12</div>
                      <div className="text-sm text-gray-600">Active Jobs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">8</div>
                      <div className="text-sm text-gray-600">Hired Candidates</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hidden file input for logo */}
        <input
          id="logo-upload"
          type="file"
          accept="image/jpeg,image/png,image/svg+xml"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
        />
      </div>
    </>
  );
}