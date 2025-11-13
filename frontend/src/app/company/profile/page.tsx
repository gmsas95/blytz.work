'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { AlertContainer, useAlert } from "@/components/ui/Alert";
import Navbar from "@/components/Navbar";

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

export default function CompanyProfile() {
  const router = useRouter();
  const { user } = useAuth();
  const { addAlert, Alert } = useAlert();
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
      const result = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          // Profile doesn't exist, create it
          router.push('/company/profile/create');
          return;
        }
        throw new Error(result.error || 'Failed to fetch profile');
      }

      setCompany(result.data);
      setEditForm(result.data);
    } catch (error: any) {
      addAlert(error.message || 'Failed to fetch profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/company/analytics');
      const result = await response.json();

      if (response.ok) {
        setAnalytics(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
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

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update profile');
      }

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

      const uploadResult = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadResult.error || 'Failed to upload logo');
      }

      const fileUrl = uploadResult.url;

      const response = await fetch('/api/company/upload-logo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logoUrl: fileUrl }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save logo');
      }

      addAlert('Logo uploaded successfully!', 'success');
      fetchProfile(); // Refresh profile data
    } catch (error: any) {
      addAlert(error.message || 'Failed to upload logo', 'error');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleVerificationUpgrade = async (level: 'professional' | 'premium') => {
    try {
      const response = await fetch('/api/company/verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ level }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upgrade verification');
      }

      addAlert(`Verification upgrade to ${level} level submitted!`, 'success');
      fetchProfile();
    } catch (error: any) {
      addAlert(error.message || 'Failed to upgrade verification', 'error');
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
        <AlertContainer />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </>
    );
  }

  if (!company) {
    return (
      <>
        <AlertContainer />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Company Profile Not Found</h1>
            <p className="mb-4">Please create your company profile first.</p>
            <button
              onClick={() => router.push('/company/profile/create')}
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
      <AlertContainer />
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Profile Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Header */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start space-x-4">
                    {company.logoUrl ? (
                      <img
                        src={company.logoUrl}
                        alt={company.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-xl font-bold">
                          {company.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
                      <p className="text-gray-600">{company.country} • {company.industry}</p>
                      {company.website && (
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          {company.website}
                        </a>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setEditing(!editing)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editing ? 'Cancel' : 'Edit Profile'}
                  </button>
                </div>

                <p className="text-gray-700 mb-4">{company.bio}</p>

                {company.mission && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Mission</h3>
                    <p className="text-gray-700">{company.mission}</p>
                  </div>
                )}

                {company.techStack && company.techStack.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Tech Stack</h3>
                    <div className="flex flex-wrap gap-2">
                      {company.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    company.verificationLevel === 'premium' 
                      ? 'bg-gold-100 text-gold-800'
                      : company.verificationLevel === 'professional'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {company.verificationLevel.charAt(0).toUpperCase() + company.verificationLevel.slice(1)} Verification
                  </span>
                  <span className="text-sm text-gray-600">
                    {company.companySize && `${company.companySize} employees`}
                  </span>
                </div>
              </div>

              {/* Analytics */}
              {analytics && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Analytics</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{analytics.conversionRate}%</div>
                      <div className="text-sm text-gray-600">Conversion Rate</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{analytics.averageTimeToHire}d</div>
                      <div className="text-sm text-gray-600">Avg Time to Hire</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">${analytics.costPerHire}</div>
                      <div className="text-sm text-gray-600">Cost per Hire</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{analytics.averageRating}/5</div>
                      <div className="text-sm text-gray-600">Average Rating</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{analytics.responseRate}%</div>
                      <div className="text-sm text-gray-600">Response Rate</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-indigo-600">{analytics.satisfactionScore}/5</div>
                      <div className="text-sm text-gray-600">Satisfaction Score</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Edit Form */}
              {editing && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Profile</h2>
                  <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company Name
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
                          Industry
                        </label>
                        <select
                          value={editForm.industry}
                          onChange={(e) => setEditForm({...editForm, industry: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Industry</option>
                          {industries.map((industry) => (
                            <option key={industry} value={industry}>{industry}</option>
                          ))}
                        </select>
                      </div>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Website
                        </label>
                        <input
                          type="url"
                          value={editForm.website}
                          onChange={(e) => setEditForm({...editForm, website: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company Size
                        </label>
                        <select
                          value={editForm.companySize}
                          onChange={(e) => setEditForm({...editForm, companySize: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Size</option>
                          {companySizes.map((size) => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mission Statement
                      </label>
                      <textarea
                        rows={3}
                        value={editForm.mission}
                        onChange={(e) => setEditForm({...editForm, mission: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="What is your company's mission?"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tech Stack
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {commonTechStack.map((tech) => (
                          <button
                            key={tech}
                            type="button"
                            onClick={() => {
                              if (editForm.techStack?.includes(tech)) {
                                removeFromArray('techStack', tech);
                              } else {
                                addToArray('techStack', tech);
                              }
                            }}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                              editForm.techStack?.includes(tech)
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {tech}
                          </button>
                        ))}
                      </div>
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
                    <span>{company.completionPercentage || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${company.completionPercentage || 0}%` }}
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Complete your profile to attract top talent and build trust.
                </p>
              </div>

              {/* Company Stats */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Spent</span>
                    <span className="font-semibold">${company.totalSpent || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Job Postings</span>
                    <span className="font-semibold">{company.jobPostings?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Founded</span>
                    <span className="font-semibold">{company.foundedYear || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Verification Level</span>
                    <span className="font-semibold capitalize">{company.verificationLevel}</span>
                  </div>
                </div>
              </div>

              {/* Logo Upload */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Logo</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Logo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      disabled={uploadingLogo}
                    />
                    {uploadingLogo && (
                      <p className="text-sm text-blue-600 mt-1">Uploading logo...</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Verification */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification</h3>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-2 ${
                      company.verificationLevel === 'premium' 
                        ? 'bg-gold-100'
                        : company.verificationLevel === 'professional'
                        ? 'bg-blue-100'
                        : 'bg-gray-100'
                    }`}>
                      <span className="text-2xl">
                        {company.verificationLevel === 'premium' ? '🏆' : 
                         company.verificationLevel === 'professional' ? '✓' : '○'}
                      </span>
                    </div>
                    <div className="font-semibold capitalize">{company.verificationLevel} Level</div>
                  </div>
                  
                  {company.verificationLevel !== 'premium' && (
                    <button
                      onClick={() => handleVerificationUpgrade('premium')}
                      className="w-full px-4 py-2 bg-gold-600 text-white rounded-md hover:bg-gold-700"
                    >
                      Upgrade to Premium
                    </button>
                  )}
                  
                  {company.verificationLevel === 'basic' && (
                    <button
                      onClick={() => handleVerificationUpgrade('professional')}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Upgrade to Professional
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => router.push('/company/jobs/new')}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Post New Job
                  </button>
                  <button
                    onClick={() => router.push('/company/discover')}
                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Discover VAs
                  </button>
                  <button
                    onClick={() => router.push('/company/jobs')}
                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Manage Jobs
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Alert />
    </>
  );
}