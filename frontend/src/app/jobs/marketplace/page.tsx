'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { AlertContainer, useAlert } from "@/components/ui/Alert";
import Navbar from "@/components/Navbar";

interface JobPosting {
  id: string;
  title: string;
  description: string;
  rateRange: string;
  budget?: number;
  location?: string;
  remote: boolean;
  category?: string;
  tags: string[];
  experienceLevel?: string;
  jobType?: string;
  duration?: string;
  urgency?: string;
  skillsRequired: string[];
  status: string;
  createdAt: string;
  views: number;
  proposalCount: number;
  featured: boolean;
  company: {
    id: string;
    name: string;
    logoUrl?: string;
    country: string;
    verificationLevel: string;
    totalReviews: number;
  };
  _count: {
    proposals: number;
  };
}

interface Filters {
  search: string;
  category: string;
  jobType: string;
  experienceLevel: string;
  budgetRange: string;
  duration: string;
  urgent: boolean;
  featured: boolean;
  skills: string;
}

const categories = [
  "Development", "Design", "Marketing", "Writing", "Customer Support",
  "Data Entry", "Virtual Assistant", "Project Management", "Sales",
  "Accounting", "HR", "Legal", "Education", "Healthcare"
];

const jobTypes = ["fixed", "hourly"];
const experienceLevels = ["entry", "mid", "senior", "executive"];
const durations = ["1 week", "2 weeks", "1 month", "3 months", "6 months", "1 year"];
const budgetRanges = ["0-100", "100-500", "500-1000", "1000-5000", "5000+"];
const commonSkills = [
  "JavaScript", "TypeScript", "React", "Node.js", "Python", "Java",
  "Design", "Marketing", "Writing", "Communication", "Project Management",
  "Data Analysis", "Customer Support", "Sales", "Accounting"
];

export default function JobMarketplace() {
  const router = useRouter();
  const { user } = useAuth();
  const { showAlert, Alert } = useAlert();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  const [filters, setFilters] = useState<Filters>({
    search: '',
    category: '',
    jobType: '',
    experienceLevel: '',
    budgetRange: '',
    duration: '',
    urgent: false,
    featured: false,
    skills: ''
  });

  const [showFilters, setShowFilters] = useState(false);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);

  useEffect(() => {
    fetchJobs();
    fetchCategories();
  }, [filters, pagination.page]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...Object.entries(filters).reduce((acc, [key, value]) => {
          if (value !== '' && value !== false) {
            acc[key] = value.toString();
          }
          return acc;
        }, {} as Record<string, string>)
      });

      const response = await fetch(`/api/jobs/marketplace?${params}`);
      const result = await response.json();

      if (response.ok) {
        setJobs(result.data.jobs);
        setPagination(result.data.pagination);
      } else {
        throw new Error(result.error || 'Failed to fetch jobs');
      }
    } catch (error: any) {
      showAlert(error.message || 'Failed to fetch jobs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/jobs/marketplace/categories');
      const result = await response.json();

      if (response.ok) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const toggleSaveJob = (jobId: string) => {
    setSavedJobs(prev => {
      if (prev.includes(jobId)) {
        return prev.filter(id => id !== jobId);
      } else {
        return [...prev, jobId];
      }
    });
  };

  const formatBudget = (budget?: number, rateRange?: string) => {
    if (budget) {
      return `$${budget.toFixed(2)}`;
    }
    if (rateRange) {
      return rateRange;
    }
    return 'Budget not specified';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const getUrgencyBadge = (urgency?: string) => {
    switch (urgency) {
      case 'high':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">Urgent</span>;
      case 'medium':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">Medium</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">Low</span>;
    }
  };

  return (
    <>
      <AlertContainer />
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Job Marketplace</h1>
                <p className="text-gray-600 mt-1">Discover opportunities that match your skills</p>
              </div>
              {user?.role === 'company' && (
                <button
                  onClick={() => router.push('/company/jobs/new')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Post a Job
                </button>
              )}
            </div>

            {/* Search Bar */}
            <div className="mt-6">
              <div className="relative">
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search jobs by title, description, or skills..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat.name} value={cat.name}>{cat.name} ({cat.count})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                    <select
                      value={filters.jobType}
                      onChange={(e) => handleFilterChange('jobType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Types</option>
                      {jobTypes.map((type) => (
                        <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                    <select
                      value={filters.experienceLevel}
                      onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Levels</option>
                      {experienceLevels.map((level) => (
                        <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range</label>
                    <select
                      value={filters.budgetRange}
                      onChange={(e) => handleFilterChange('budgetRange', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Budgets</option>
                      {budgetRanges.map((range) => (
                        <option key={range} value={range}>${range}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                    <select
                      value={filters.duration}
                      onChange={(e) => handleFilterChange('duration', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Durations</option>
                      {durations.map((duration) => (
                        <option key={duration} value={duration}>{duration}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                    <select
                      value={filters.skills}
                      onChange={(e) => handleFilterChange('skills', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Skills</option>
                      {commonSkills.map((skill) => (
                        <option key={skill} value={skill}>{skill}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.urgent}
                        onChange={(e) => handleFilterChange('urgent', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Urgent Only</span>
                    </label>
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.featured}
                        onChange={(e) => handleFilterChange('featured', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Featured Only</span>
                    </label>
                  </div>
                </div>

                <div className="mt-4 flex justify-between">
                  <div className="text-sm text-gray-600">
                    {pagination.total} jobs found
                  </div>
                  <button
                    onClick={() => setFilters({
                      search: '',
                      category: '',
                      jobType: '',
                      experienceLevel: '',
                      budgetRange: '',
                      duration: '',
                      urgent: false,
                      featured: false,
                      skills: ''
                    })}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Job Listings */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg border p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {jobs.map((job) => (
                  <div key={job.id} className="bg-white rounded-lg border hover:shadow-lg transition-shadow p-6">
                    {/* Job Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        {job.company.logoUrl ? (
                          <img
                            src={job.company.logoUrl}
                            alt={job.company.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-gray-500 font-bold text-sm">
                              {job.company.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900">{job.title}</h3>
                          <p className="text-sm text-gray-600">{job.company.name}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleSaveJob(job.id)}
                        className="text-gray-400 hover:text-yellow-500 transition-colors"
                      >
                        <svg
                          className={`h-5 w-5 ${savedJobs.includes(job.id) ? 'text-yellow-500 fill-current' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </button>
                    </div>

                    {/* Job Description */}
                    <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                      {job.description}
                    </p>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {job.skillsRequired.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.skillsRequired.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                          +{job.skillsRequired.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Job Details */}
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex justify-between">
                        <span>Budget</span>
                        <span className="font-medium">{formatBudget(job.budget, job.rateRange)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duration</span>
                        <span className="font-medium">{job.duration || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Location</span>
                        <span className="font-medium">{job.remote ? 'Remote' : job.location || 'Not specified'}</span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center space-x-3">
                        {getUrgencyBadge(job.urgency)}
                        {job.featured && (
                          <span className="px-2 py-1 bg-gold-100 text-gold-800 text-xs font-medium rounded-full">Featured</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>{formatDate(job.createdAt)}</span>
                        <span>•</span>
                        <span>{job.views} views</span>
                        <span>•</span>
                        <span>{job._count.proposals} proposals</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => router.push(`/jobs/marketplace/${job.id}`)}
                      className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                      disabled={pagination.page === 1}
                      className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setPagination(prev => ({ ...prev, page }))}
                          className={`px-3 py-2 rounded-md ${
                            pagination.page === page
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1) }))}
                      disabled={pagination.page === pagination.totalPages}
                      className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* No Results */}
              {jobs.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="text-gray-500 text-lg mb-4">No jobs found</div>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your filters or search terms to find more opportunities.
                  </p>
                  <button
                    onClick={() => setFilters({
                      search: '',
                      category: '',
                      jobType: '',
                      experienceLevel: '',
                      budgetRange: '',
                      duration: '',
                      urgent: false,
                      featured: false,
                      skills: ''
                    })}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Alert />
    </>
  );
}