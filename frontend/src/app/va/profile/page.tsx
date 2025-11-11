import { AlertContainer } from "@/components/ui/Alert";
// Enhanced VA Profile Management Page
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase';
import { apiClient, handleAPIError } from '@/lib/api';
import { 
  User, 
  FileText, 
  Upload, 
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
  Download
} from 'lucide-react';
import { useAlert } from '@/components/ui/Alert';

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
  languages: Array<{ code: string; level: string }>;
  workExperience: Array<{ company: string; role: string; years: number; description?: string }>;
  education: Array<{ institution: string; degree: string; field?: string; startDate: string; endDate?: string }>;
  resumeUrl?: string;
  videoIntroUrl?: string;
  responseRate?: number;
  averageRating?: number;
  totalReviews: number;
  featuredProfile: boolean;
  profileViews: number;
  skillsScore?: number;
  verificationLevel: 'basic' | 'professional' | 'premium';
  portfolioItems: Array<{
    id: string;
    title: string;
    description: string;
    fileUrl: string;
    fileType: string;
    thumbnailUrl?: string;
    category?: string;
    technologies?: string[];
    projectUrl?: string;
    featured: boolean;
    createdAt: string;
  }>;
  completionPercentage: number;
}

export default function VAProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<VAProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<VAProfile>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  
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
      const response = await apiClient.va.profile();
      setProfile(response.data);
      setEditData(response.data);
    } catch (error: any) {
      if (error.status === 404) {
        // Profile doesn't exist, redirect to create
        window.location.href = '/va/profile/create';
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
      const response = await apiClient.va.updateProfile(editData);
      setProfile(response.data);
      setEditing(false);
      addAlert('success', 'Profile updated successfully!');
    } catch (error: any) {
      addAlert('error', handleAPIError(error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, uploadType: 'resume' | 'portfolio' | 'video') => {
    try {
      setUploading(uploadType);
      
      // Get presigned URL
      const uploadResponse = await apiClient.upload.getPresignedUrl(file.name, file.type, uploadType);
      const { presignedUrl, fileUrl } = uploadResponse.data;

      // Upload to S3
      await apiClient.upload.uploadToS3(presignedUrl, file);

      // Process the uploaded file
      if (uploadType === 'resume') {
        const response = await apiClient.va.uploadResume({
          resumeUrl: fileUrl,
          fileName: file.name
        });
        setProfile(prev => prev ? { ...prev, resumeUrl: response.data.resumeUrl } : null);
      } else if (uploadType === 'video') {
        const response = await apiClient.va.uploadVideo({
          videoUrl: fileUrl,
          fileName: file.name
        });
        setProfile(prev => prev ? { ...prev, videoIntroUrl: response.data.videoIntroUrl } : null);
      }

      addAlert('success', `${uploadType === 'resume' ? 'Resume' : uploadType === 'video' ? 'Video' : 'Portfolio item'} uploaded successfully!`);
    } catch (error: any) {
      addAlert('error', handleAPIError(error).message);
    } finally {
      setUploading(null);
    }
  };

  const handlePortfolioUpload = async (portfolioData: {
    title: string;
    description: string;
    file: File;
    category?: string;
    technologies?: string[];
    projectUrl?: string;
  }) => {
    try {
      setUploading('portfolio');
      
      // Upload file
      const uploadResponse = await apiClient.upload.getPresignedUrl(portfolioData.file.name, portfolioData.file.type, 'va_portfolio');
      const { presignedUrl, fileUrl } = uploadResponse.data;

      await apiClient.upload.uploadToS3(presignedUrl, portfolioData.file);

      // Create portfolio item
      const response = await apiClient.va.uploadPortfolio({
        title: portfolioData.title,
        description: portfolioData.description,
        fileUrl: fileUrl,
        fileType: getFileType(portfolioData.file.type),
        category: portfolioData.category,
        technologies: portfolioData.technologies,
        projectUrl: portfolioData.projectUrl
      });

      setProfile(prev => prev ? {
        ...prev,
        portfolioItems: [...prev.portfolioItems, response.data]
      } : null);

      addAlert('success', 'Portfolio item added successfully!');
    } catch (error: any) {
      addAlert('error', handleAPIError(error).message);
    } finally {
      setUploading(null);
    }
  };

  const handleVerification = async (level: 'professional' | 'premium') => {
    try {
      const response = await apiClient.va.verification(level);
      setProfile(prev => prev ? { ...prev, verificationLevel: response.data.verificationLevel } : null);
      addAlert('success', `${level === 'premium' ? 'Premium' : 'Professional'} verification request submitted!`);
    } catch (error: any) {
      addAlert('error', handleAPIError(error).message);
    }
  };

  const handleSkillsAssessment = async (skillName: string) => {
    try {
      const response = await apiClient.va.skillsAssessment(skillName, 'technical', 'intermediate');
      addAlert('success', 'Skills assessment completed successfully!');
      loadProfile(); // Reload to get updated scores
    } catch (error: any) {
      addAlert('error', handleAPIError(error).message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">Your VA profile could not be found.</p>
          <button
            onClick={() => window.location.href = '/va/profile/create'}
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
                  {profile.videoIntroUrl ? (
                    <img 
                      src={profile.videoIntroUrl} 
                      alt={profile.name}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
                      <User className="w-8 h-8 text-primary-600" />
                    </div>
                  )}
                  <button
                    onClick={() => document.getElementById('video-upload')?.click()}
                    className="absolute bottom-0 right-0 bg-primary-600 text-white p-1 rounded-full"
                    disabled={uploading === 'video'}
                  >
                    <Camera className="w-3 h-3" />
                  </button>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                  <p className="text-gray-600">{profile.country} • ${profile.hourlyRate}/hr</p>
                  <div className="flex items-center space-x-2 mt-2">
                    {profile.averageRating && (
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">
                          {profile.averageRating.toFixed(1)} ({profile.totalReviews})
                        </span>
                      </div>
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
                    {profile.availability && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        Available
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
                  Complete your profile to increase visibility and attract more clients.
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
                {editing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
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
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
                        <input
                          type="number"
                          value={editData.hourlyRate || ''}
                          onChange={(e) => setEditData({ ...editData, hourlyRate: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                        <input
                          type="text"
                          value={editData.country || ''}
                          onChange={(e) => setEditData({ ...editData, country: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                      <input
                        type="text"
                        value={(editData.skills || []).join(', ')}
                        onChange={(e) => setEditData({ ...editData, skills: e.target.value.split(',').map(s => s.trim()) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="e.g., React, Node.js, MongoDB"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Bio</span>
                      <p className="mt-1 text-gray-600">{profile.bio}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Hourly Rate</span>
                        <p className="mt-1 text-gray-600">${profile.hourlyRate}/hr</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Country</span>
                        <p className="mt-1 text-gray-600">{profile.country}</p>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Skills</span>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {profile.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Portfolio */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Portfolio</h2>
                  <button
                    onClick={() => document.getElementById('portfolio-upload')?.click()}
                    disabled={uploading === 'portfolio'}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Item</span>
                  </button>
                </div>

                {profile.portfolioItems.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No portfolio items yet</p>
                    <button
                      onClick={() => document.getElementById('portfolio-upload')?.click()}
                      disabled={uploading === 'portfolio'}
                      className="btn-primary"
                    >
                      Add Your First Item
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.portfolioItems.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                        {item.thumbnailUrl ? (
                          <img 
                            src={item.thumbnailUrl} 
                            alt={item.title}
                            className="w-full h-32 object-cover rounded-lg mb-3"
                          />
                        ) : (
                          <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                            <FileText className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <h3 className="font-medium text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                        {item.technologies && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {item.technologies.map((tech, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{item.fileType}</span>
                          <div className="flex items-center space-x-2">
                            <button className="text-primary-600 hover:text-primary-700">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-700">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Skills Assessment */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Skills Assessment</h2>
                  {profile.skillsScore && (
                    <div className="flex items-center space-x-2">
                      <Award className="w-5 h-5 text-yellow-500" />
                      <span className="text-sm font-medium text-gray-900">
                        Score: {profile.skillsScore}/100
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {profile.skills.slice(0, 5).map((skill, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{skill}</span>
                      <button
                        onClick={() => handleSkillsAssessment(skill)}
                        className="text-primary-600 hover:text-primary-700 text-sm"
                      >
                        Take Assessment
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Stats */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Profile Views</span>
                    <span className="text-sm font-medium text-gray-900">{profile.profileViews}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Reviews</span>
                    <span className="text-sm font-medium text-gray-900">{profile.totalReviews}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Average Rating</span>
                    <span className="text-sm font-medium text-gray-900">
                      {profile.averageRating?.toFixed(1) || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Response Rate</span>
                    <span className="text-sm font-medium text-gray-900">
                      {profile.responseRate ? `${profile.responseRate}%` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">Resume</span>
                    </div>
                    {profile.resumeUrl ? (
                      <div className="flex items-center space-x-2">
                        <button className="text-primary-600 hover:text-primary-700">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-700">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => document.getElementById('resume-upload')?.click()}
                        disabled={uploading === 'resume'}
                        className="text-primary-600 hover:text-primary-700 text-sm"
                      >
                        Upload
                      </button>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Camera className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">Video Intro</span>
                    </div>
                    {profile.videoIntroUrl ? (
                      <div className="flex items-center space-x-2">
                        <button className="text-primary-600 hover:text-primary-700">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => document.getElementById('video-upload')?.click()}
                        disabled={uploading === 'video'}
                        className="text-primary-600 hover:text-primary-700 text-sm"
                      >
                        Upload
                      </button>
                    )}
                  </div>
                </div>
              </div>

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
            </div>
          </div>

          {/* Hidden file inputs */}
          <input
            id="resume-upload"
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'resume')}
          />
          <input
            id="video-upload"
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'video')}
          />
          <input
            id="portfolio-upload"
            type="file"
            accept="image/*,.pdf,.doc,.docx,video/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && {
              // Handle portfolio upload with additional details
            }}
          />
        </div>
      </div>
    </>
  );
}

// Helper function
function getFileType(fileType: string): 'image' | 'document' | 'video' | 'link' {
  if (fileType.startsWith('image/')) return 'image';
  if (fileType.startsWith('video/')) return 'video';
  if (fileType.includes('pdf') || fileType.includes('document')) return 'document';
  return 'link';
}