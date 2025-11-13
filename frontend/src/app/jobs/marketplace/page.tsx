'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useImprovedAlert } from "@/contexts/ImprovedAlertContext";
import Navbar from "@/components/Navbar";
import { 
  Search,
  Filter,
  Bookmark,
  Clock,
  DollarSign,
  MapPin,
  Briefcase,
  TrendingUp,
  Building2,
  Star,
  Eye,
  Users,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { Button } from '@/components/ui-shadcn/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui-shadcn/card';
import { Input } from '@/components/ui-shadcn/input';
import { Badge } from '@/components/ui-shadcn/badge';
import { Separator } from '@/components/ui-shadcn/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui-shadcn/select';
import { Checkbox } from '@/components/ui-shadcn/checkbox';
import { Skeleton } from '@/components/ui-shadcn/skeleton';

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

const mockJobs: JobPosting[] = [
  {
    id: '1',
    title: 'Senior Full Stack Developer',
    description: 'Looking for an experienced full stack developer to join our team and work on exciting projects.',
    rateRange: '$50-80/hour',
    remote: true,
    category: 'Development',
    experienceLevel: 'senior',
    jobType: 'hourly',
    duration: '6 months',
    urgency: 'high',
    skillsRequired: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    views: 245,
    proposalCount: 12,
    featured: true,
    company: {
      id: '1',
      name: 'TechCorp',
      logoUrl: 'https://via.placeholder.com/40x40/FFD600/000000?text=TC',
      country: 'United States',
      verificationLevel: 'professional',
      totalReviews: 24
    },
    _count: { proposals: 12 }
  },
  {
    id: '2',
    title: 'Virtual Assistant for Administrative Tasks',
    description: 'Need a reliable VA to help with administrative tasks, email management, and scheduling.',
    rateRange: '$15-25/hour',
    remote: true,
    category: 'Virtual Assistant',
    experienceLevel: 'mid',
    jobType: 'hourly',
    duration: '3 months',
    urgency: 'medium',
    skillsRequired: ['Email Management', 'Scheduling', 'Microsoft Office'],
    status: 'active',
    createdAt: '2024-01-14T08:30:00Z',
    views: 132,
    proposalCount: 8,
    featured: false,
    company: {
      id: '2',
      name: 'StartupXYZ',
      country: 'Canada',
      verificationLevel: 'basic',
      totalReviews: 5
    },
    _count: { proposals: 8 }
  },
  {
    id: '3',
    title: 'Content Writer for Tech Blog',
    description: 'Seeking talented content writer to create engaging articles about technology and software development.',
    rateRange: '$500-1000/project',
    remote: true,
    category: 'Writing',
    experienceLevel: 'mid',
    jobType: 'fixed',
    duration: '1 month',
    urgency: 'low',
    skillsRequired: ['Technical Writing', 'SEO', 'Research'],
    status: 'active',
    createdAt: '2024-01-13T14:15:00Z',
    views: 89,
    proposalCount: 5,
    featured: false,
    company: {
      id: '3',
      name: 'TechBlog Inc',
      country: 'United Kingdom',
      verificationLevel: 'professional',
      totalReviews: 18
    },
    _count: { proposals: 5 }
  }
];

export default function JobMarketplace() {
  const router = useRouter();
  const { user } = useAuth();
  const { addAlert } = useImprovedAlert();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
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
      
      if (!response.ok) {
        console.warn('Jobs marketplace API not available, using mock data');
        setJobs(mockJobs);
        setPagination({
          page: 1,
          limit: 20,
          total: mockJobs.length,
          totalPages: 1
        });
        return;
      }
      
      const result = await response.json();
      setJobs(result.data.jobs);
      setPagination(result.data.pagination);
    } catch (error: any) {
      addAlert(error.message || 'Failed to fetch jobs', 'error');
      setJobs(mockJobs);
      setPagination({
        page: 1,
        limit: 20,
        total: mockJobs.length,
        totalPages: 1
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/jobs/marketplace/categories');
      const result = await response.json();

      if (response.ok) {
        setCategoriesList(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
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
        return <Badge className="bg-red-500 text-white">Urgent</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500 text-white">Medium</Badge>;
      default:
        return <Badge variant="secondary">Low</Badge>;
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-900">
        {/* Header */}
        <div className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white">Job Marketplace</h1>
                <p className="text-gray-400 mt-1">Discover opportunities that match your skills</p>
              </div>
              {user?.role === 'company' && (
                <Button
                  onClick={() => router.push('/company/jobs/new')}
                  className="bg-yellow-400 text-gray-900 hover:bg-yellow-300"
                >
                  Post a Job
                </Button>
              )}
            </div>

            {/* Search Bar */}
            <div className="mt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search jobs by title, description, or skills..."
                  className="pl-12 pr-12 py-3 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                />
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant="ghost"
                  className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  <Filter className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <Card className="mt-4 bg-gray-700/50 backdrop-blur-lg border-gray-600">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-200">Category</label>
                      <Select
                        value={filters.category}
                        onValueChange={(value) => handleFilterChange('category', value)}
                      >
                        <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat} className="text-white hover:bg-gray-700">
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-200">Job Type</label>
                      <Select
                        value={filters.jobType}
                        onValueChange={(value) => handleFilterChange('jobType', value)}
                      >
                        <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                          <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          {jobTypes.map((type) => (
                            <SelectItem key={type} value={type} className="text-white hover:bg-gray-700">
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-200">Experience Level</label>
                      <Select
                        value={filters.experienceLevel}
                        onValueChange={(value) => handleFilterChange('experienceLevel', value)}
                      >
                        <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                          <SelectValue placeholder="All Levels" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          {experienceLevels.map((level) => (
                            <SelectItem key={level} value={level} className="text-white hover:bg-gray-700">
                              {level.charAt(0).toUpperCase() + level.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-200">Budget Range</label>
                      <Select
                        value={filters.budgetRange}
                        onValueChange={(value) => handleFilterChange('budgetRange', value)}
                      >
                        <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                          <SelectValue placeholder="All Budgets" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          {budgetRanges.map((range) => (
                            <SelectItem key={range} value={range} className="text-white hover:bg-gray-700">
                              ${range}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-200">Duration</label>
                      <Select
                        value={filters.duration}
                        onValueChange={(value) => handleFilterChange('duration', value)}
                      >
                        <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                          <SelectValue placeholder="All Durations" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          {durations.map((duration) => (
                            <SelectItem key={duration} value={duration} className="text-white hover:bg-gray-700">
                              {duration}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-200">Skills</label>
                      <Select
                        value={filters.skills}
                        onValueChange={(value) => handleFilterChange('skills', value)}
                      >
                        <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                          <SelectValue placeholder="All Skills" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          {commonSkills.map((skill) => (
                            <SelectItem key={skill} value={skill} className="text-white hover:bg-gray-700">
                              {skill}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="urgent"
                          checked={filters.urgent}
                          onCheckedChange={(checked) => handleFilterChange('urgent', checked)}
                        />
                        <label htmlFor="urgent" className="text-sm text-gray-200">
                          Urgent Only
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="featured"
                          checked={filters.featured}
                          onCheckedChange={(checked) => handleFilterChange('featured', checked)}
                        />
                        <label htmlFor="featured" className="text-sm text-gray-200">
                          Featured Only
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between">
                    <div className="text-sm text-gray-400">
                      {pagination.total} jobs found
                    </div>
                    <Button
                      variant="ghost"
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
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Job Listings */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="bg-gray-800/50 backdrop-blur-lg border-gray-700">
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-3/4 mb-4" />
                    <Skeleton className="h-3 w-1/2 mb-2" />
                    <Skeleton className="h-3 w-full mb-4" />
                    <Skeleton className="h-3 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {jobs.map((job) => (
                  <Card key={job.id} className="bg-gray-800/50 backdrop-blur-lg border-gray-700 hover:border-yellow-400/50 transition-colors">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          {job.company.logoUrl ? (
                            <img
                              src={job.company.logoUrl}
                              alt={job.company.name}
                              className="w-10 h-10 rounded-lg"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <CardTitle className="text-lg text-white">{job.title}</CardTitle>
                            <CardDescription className="text-gray-400">{job.company.name}</CardDescription>
                          </div>
                        </div>
                        <Button
                          onClick={() => toggleSaveJob(job.id)}
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-yellow-400"
                        >
                          <Bookmark className={`h-5 w-5 ${savedJobs.includes(job.id) ? 'fill-current text-yellow-400' : ''}`} />
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="pb-4">
                      <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                        {job.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.skillsRequired.slice(0, 3).map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="bg-blue-500/20 text-blue-300 border-blue-500/30"
                          >
                            {skill}
                          </Badge>
                        ))}
                        {job.skillsRequired.length > 3 && (
                          <Badge variant="secondary" className="bg-gray-600/20 text-gray-300 border-gray-600/30">
                            +{job.skillsRequired.length - 3} more
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-2 text-sm text-gray-400 mb-4">
                        <div className="flex justify-between">
                          <span>Budget</span>
                          <span className="font-medium text-green-400">{formatBudget(job.budget, job.rateRange)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Duration</span>
                          <span className="font-medium text-yellow-400">{job.duration || 'Not specified'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Location</span>
                          <span className="font-medium text-blue-400">{job.remote ? 'Remote' : job.location || 'Not specified'}</span>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="pt-0">
                      <div className="flex items-center justify-between w-full mb-4">
                        <div className="flex items-center space-x-2">
                          {getUrgencyBadge(job.urgency)}
                          {job.featured && (
                            <Badge className="bg-yellow-400 text-gray-900">Featured</Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {job.views}
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {job._count.proposals}
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={() => router.push(`/jobs/marketplace/${job.id}`)}
                        className="w-full bg-yellow-400 text-gray-900 hover:bg-yellow-300"
                      >
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                      disabled={pagination.page === 1}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>

                    {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          onClick={() => setPagination(prev => ({ ...prev, page }))}
                          variant={pagination.page === page ? "default" : "outline"}
                          className={
                            pagination.page === page
                              ? 'bg-yellow-400 text-gray-900'
                              : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                          }
                        >
                          {page}
                        </Button>
                      );
                    })}

                    <Button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1) }))}
                      disabled={pagination.page === pagination.totalPages}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}

              {/* No Results */}
              {jobs.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-lg mb-4">No jobs found</div>
                  <p className="text-gray-500 mb-4">
                    Try adjusting your filters or search terms to find more opportunities.
                  </p>
                  <Button
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
                    className="bg-yellow-400 text-gray-900 hover:bg-yellow-300"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}