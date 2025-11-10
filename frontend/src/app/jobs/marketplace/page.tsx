// Job Marketplace - Discover and Apply for Jobs
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase';
import { apiClient, handleAPIError } from '@/lib/api';
import { 
  Search, 
  Filter, 
  Briefcase, 
  DollarSign, 
  MapPin, 
  Clock, 
  Star,
  Building,
  Calendar,
  ChevronDown,
  ChevronRight,
  Heart,
  ExternalLink
} from 'lucide-react';
import { useAlert } from '@/components/ui/Alert';

interface JobPosting {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  rateRange: string;
  budget?: number;
  location?: string;
  remote: boolean;
  category?: string;
  tags: string[];
  experienceLevel?: string;
  employmentType?: string;
  jobType?: string;
  duration?: string;
  urgency?: string;
  skillsRequired: string[];
  views: number;
  proposals: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  company: {
    id: string;
    name: string;
    logoUrl?: string;
    country: string;
    verificationLevel: string;
    totalReviews: number;
  };
}

interface FilterOptions {
  category?: string;
  jobType?: string;
  experienceLevel?: string;
  skills?: string;
  budgetRange?: string;
  duration?: string;
  urgent?: boolean;
  featured?: boolean;
}

export default function JobMarketplacePage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({});
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<Array<{name: string; count: number}>>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());

  const { addAlert, AlertContainer } = useAlert();

  // Load marketplace data
  useEffect(() => {
    if (user) {
      loadJobs();
      loadCategories();
    }
  }, [user, searchQuery, filters, pagination.page]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });

      if (searchQuery) queryParams.set('search', searchQuery);
      if (filters.category) queryParams.set('category', filters.category);
      if (filters.jobType) queryParams.set('jobType', filters.jobType);
      if (filters.experienceLevel) queryParams.set('experienceLevel', filters.experienceLevel);
      if (filters.skills) queryParams.set('skills', filters.skills);
      if (filters.budgetRange) queryParams.set('budgetRange', filters.budgetRange);
      if (filters.duration) queryParams.set('duration', filters.duration);
      if (filters.urgent) queryParams.set('urgent', 'true');
      if (filters.featured) queryParams.set('featured', 'true');

      const response = await apiClient.get(`/jobs/marketplace?${queryParams}`);
      
      setJobs(response.data.jobs);
      setPagination(response.data.pagination);
    } catch (error: any) {
      setError(handleAPIError(error).message);
      addAlert('error', handleAPIError(error).message);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await apiClient.get('/jobs/marketplace/categories');
      setCategories(response.data);
    } catch (error: any) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const toggleSaveJob = (jobId: string) => {
    const newSavedJobs = new Set(savedJobs);
    if (newSavedJobs.has(jobId)) {
      newSavedJobs.delete(jobId);
      addAlert('info', 'Job removed from saved jobs');
    } else {
      newSavedJobs.add(jobId);
      addAlert('success', 'Job saved to your list');
    }
    setSavedJobs(newSavedJobs);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just posted';
  };

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (error) {
    return (
      <>
        <AlertContainer />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Jobs</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button onClick={loadJobs} className="btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AlertContainer />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Job Marketplace</h1>
                <p className="text-gray-600 mt-1">
                  {pagination.total} jobs available
                </p>
              </div>
              {user?.role === 'va' && (
                <button
                  onClick={() => window.location.href = '/va/dashboard'}
                  className="btn-secondary"
                >
                  Go to Dashboard
                </button>
              )}
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="mt-6">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search jobs by title, description, or tags..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                  {Object.values(filters).filter(v => v !== undefined).length > 0 && (
                    <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                      {Object.values(filters).filter(v => v !== undefined).length}
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-6">
            {/* Filters Sidebar */}
            {showFilters && (
              <div className="w-80 flex-shrink-0">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
                  
                  {/* Category */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={filters.category || ''}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat.name} value={cat.name}>
                          {cat.name} ({cat.count})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Job Type */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value=""
                          checked={!filters.jobType}
                          onChange={(e) => handleFilterChange('jobType', e.target.value ? e.target.value : undefined)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">All Types</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="fixed"
                          checked={filters.jobType === 'fixed'}
                          onChange={(e) => handleFilterChange('jobType', e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Fixed Price</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="hourly"
                          checked={filters.jobType === 'hourly'}
                          onChange={(e) => handleFilterChange('jobType', e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Hourly</span>
                      </label>
                    </div>
                  </div>

                  {/* Experience Level */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                    <select
                      value={filters.experienceLevel || ''}
                      onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">All Levels</option>
                      <option value="entry">Entry Level</option>
                      <option value="mid">Mid Level</option>
                      <option value="senior">Senior Level</option>
                      <option value="executive">Executive</option>
                    </select>
                  </div>

                  {/* Budget Range */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range</label>
                    <select
                      value={filters.budgetRange || ''}
                      onChange={(e) => handleFilterChange('budgetRange', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Any Budget</option>
                      <option value="0-100">Under $100</option>
                      <option value="100-500">$100 - $500</option>
                      <option value="500-1000">$500 - $1,000</option>
                      <option value="1000-5000">$1,000 - $5,000</option>
                      <option value="5000-99999">$5,000+</option>
                    </select>
                  </div>

                  {/* Additional Filters */}
                  <div className="mb-6 space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.urgent || false}
                        onChange={(e) => handleFilterChange('urgent', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Urgent Jobs Only</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.featured || false}
                        onChange={(e) => handleFilterChange('featured', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Featured Jobs Only</span>
                    </label>
                  </div>

                  <button
                    onClick={() => setFilters({})}
                    className="btn-secondary w-full"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}

            {/* Jobs List */}
            <div className="flex-1">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : jobs.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Jobs Found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search criteria or filters
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilters({});
                      setPagination(prev => ({ ...prev, page: 1 }));
                    }}
                    className="btn-primary"
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div key={job.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            {job.company.logoUrl ? (
                              <img 
                                src={job.company.logoUrl} 
                                alt={job.company.name}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            ) : (
                              <Building className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600">
                              <a href={`/jobs/marketplace/${job.id}`} className="hover:underline">
                                {job.title}
                              </a>
                            </h3>
                            <p className="text-sm text-gray-600 flex items-center">
                              <Building className="w-4 h-4 mr-1" />
                              {job.company.name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {job.urgency && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(job.urgency)}`}>
                              {job.urgency}
                            </span>
                          )}
                          {job.featured && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                              Featured
                            </span>
                          )}
                          <button
                            onClick={() => toggleSaveJob(job.id)}
                            className="p-2 hover:bg-gray-100 rounded-full"
                          >
                            <Heart 
                              className={`w-5 h-5 ${savedJobs.has(job.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
                            />
                          </button>
                        </div>
                      </div>

                      {/* Job Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <DollarSign className="w-4 h-4 mr-1" />
                          <span>
                            {job.budget ? `$${job.budget}` : job.rateRange}
                            {job.jobType && ` (${job.jobType})`}
                          </span>
                        </div>
                        {job.location && (
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span>{job.location}</span>
                          </div>
                        )}
                        {job.remote && (
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span>Remote</span>
                          </div>
                        )}
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{formatTimeAgo(job.createdAt)}</span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-gray-700 mb-4 line-clamp-3">
                        {job.description}
                      </p>

                      {/* Skills */}
                      {job.skillsRequired.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {job.skillsRequired.slice(0, 5).map((skill) => (
                              <span
                                key={skill}
                                className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs"
                              >
                                {skill}
                              </span>
                            ))}
                            {job.skillsRequired.length > 5 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                +{job.skillsRequired.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Briefcase className="w-4 h-4 mr-1" />
                            <span>{job.proposals} proposals</span>
                          </div>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 mr-1" />
                            <span>{job.company.totalReviews || 0} reviews</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>{formatTimeAgo(job.createdAt)}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <a
                            href={`/jobs/marketplace/${job.id}`}
                            className="btn-primary text-sm"
                          >
                            View Details
                          </a>
                          {user?.role === 'va' && (
                            <button
                              onClick={() => window.location.href = `/jobs/marketplace/${job.id}/propose`}
                              className="btn-secondary text-sm"
                            >
                              Submit Proposal
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} jobs
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="btn-secondary text-sm disabled:opacity-50"
                    >
                      Previous
                    </button>
                    {[...Array(pagination.totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => handlePageChange(i + 1)}
                        className={`px-3 py-1 text-sm ${
                          pagination.page === i + 1
                            ? 'bg-primary-600 text-white'
                            : 'btn-secondary'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="btn-secondary text-sm disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}