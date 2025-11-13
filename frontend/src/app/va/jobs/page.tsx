'use client';

import { useState, useEffect } from 'react';
import { Briefcase, MapPin, DollarSign, Calendar, ExternalLink, Star, Clock, Filter, Search } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useImprovedAlert } from '@/contexts/ImprovedAlertContext';
import Navbar from "@/components/Navbar";
import { Button } from '@/components/ui-shadcn/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui-shadcn/card';
import { Badge } from '@/components/ui-shadcn/badge';
import { Input } from '@/components/ui-shadcn/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui-shadcn/select';
import { Skeleton } from '@/components/ui-shadcn/skeleton';

interface JobPosting {
  id: string;
  title: string;
  description?: string;
  rateRange?: string;
  budget?: number;
  location?: string;
  remote: boolean;
  category?: string;
  tags?: string[];
  experienceLevel?: string;
  jobType?: string;
  duration?: string;
  urgency?: string;
  skillsRequired: string[];
  status: string;
  createdAt: string;
  views: number;
  proposalCount?: number;
  featured: boolean;
  company: {
    id: string;
    name: string;
    logoUrl?: string;
    country: string;
    verificationLevel: string;
    totalReviews: number;
  };
}

const mockJobs: JobPosting[] = [
  {
    id: '1',
    title: 'Senior Virtual Assistant',
    rateRange: '$25-40/hour',
    remote: true,
    category: 'Virtual Assistant',
    experienceLevel: 'senior',
    jobType: 'hourly',
    duration: '6 months',
    urgency: 'medium',
    skillsRequired: ['Calendar Management', 'Email', 'Research', 'Data Entry'],
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    views: 245,
    proposalCount: 12,
    featured: true,
    company: {
      id: '1',
      name: 'TechCorp Solutions',
      logoUrl: 'https://via.placeholder.com/40x40/FFD600/000000?text=TC',
      country: 'United States',
      verificationLevel: 'professional',
      totalReviews: 24
    }
  },
  {
    id: '2',
    title: 'Social Media Manager',
    rateRange: '$20-35/hour',
    remote: true,
    category: 'Marketing',
    experienceLevel: 'mid',
    jobType: 'hourly',
    duration: '3 months',
    urgency: 'high',
    skillsRequired: ['Content Creation', 'Social Media', 'Analytics', 'SEO'],
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
    }
  },
  {
    id: '3',
    title: 'Content Writer for Tech Blog',
    rateRange: '$500-1000/project',
    remote: true,
    category: 'Writing',
    experienceLevel: 'mid',
    jobType: 'fixed',
    duration: '1 month',
    urgency: 'low',
    skillsRequired: ['Technical Writing', 'SEO', 'Research', 'Content Strategy'],
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
    }
  }
];

const categories = [
  "Virtual Assistant", "Marketing", "Writing", "Development", 
  "Design", "Customer Support", "Data Entry", "Project Management"
];

const experienceLevels = ["entry", "mid", "senior", "executive"];
const jobTypes = ["fixed", "hourly"];
const durations = ["1 week", "2 weeks", "1 month", "3 months", "6 months", "1 year"];

export default function VAJobsPage() {
  const { user } = useAuth();
  const { addAlert } = useImprovedAlert();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('');
  const [selectedJobType, setSelectedJobType] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('');

  useEffect(() => {
    fetchJobs();
  }, [searchQuery, selectedCategory, selectedExperience, selectedJobType, selectedDuration]);

  const fetchJobs = async () => {
    setLoading(true);
    
    try {
      const params = new URLSearchParams({
        search: searchQuery,
        category: selectedCategory,
        experienceLevel: selectedExperience,
        jobType: selectedJobType,
        duration: selectedDuration
      });

      const response = await fetch(`/api/jobs/relevant?${params}`);
      
      if (!response.ok) {
        console.warn('VA jobs API not available, using mock data');
        let filtered = mockJobs;
        
        if (searchQuery) {
          filtered = filtered.filter(job => 
            job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.description?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        
        if (selectedCategory) {
          filtered = filtered.filter(job => job.category === selectedCategory);
        }
        
        if (selectedExperience) {
          filtered = filtered.filter(job => job.experienceLevel === selectedExperience);
        }
        
        if (selectedJobType) {
          filtered = filtered.filter(job => job.jobType === selectedJobType);
        }
        
        setJobs(filtered);
        return;
      }
      
      const result = await response.json();
      setJobs(result.data);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      setJobs(mockJobs);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-900 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <Skeleton className="h-10 w-48 mb-2" />
              <Skeleton className="h-5 w-96" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-900">
        {/* Header */}
        <div className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-white mb-2">Jobs For You</h1>
              <p className="text-gray-400 text-lg">Discover job opportunities that match your skills and experience</p>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search jobs by title, description, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-3 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                      <SelectValue placeholder="Category" />
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

                <div>
                  <Select value={selectedExperience} onValueChange={setSelectedExperience}>
                    <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                      <SelectValue placeholder="Experience" />
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

                <div>
                  <Select value={selectedJobType} onValueChange={setSelectedJobType}>
                    <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                      <SelectValue placeholder="Job Type" />
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

                <div>
                  <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                    <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                      <SelectValue placeholder="Duration" />
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

                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('');
                    setSelectedExperience('');
                    setSelectedJobType('');
                    setSelectedDuration('');
                  }}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Jobs Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                            <Briefcase className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-lg text-white">{job.title}</CardTitle>
                          <CardDescription className="text-gray-400">{job.company.name}</CardDescription>
                        </div>
                      </div>
                      {job.featured && (
                        <Badge className="bg-yellow-400 text-gray-900">Featured</Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="pb-4">
                    <div className="space-y-3">
                      {/* Job Details */}
                      {job.rateRange && (
                        <div className="flex items-center text-sm text-gray-300">
                          <DollarSign className="h-4 w-4 mr-2 text-green-400" />
                          {job.rateRange}
                        </div>
                      )}
                      
                      {job.remote && (
                        <div className="flex items-center text-sm text-gray-300">
                          <MapPin className="h-4 w-4 mr-2 text-blue-400" />
                          Remote
                        </div>
                      )}
                      
                      {job.duration && (
                        <div className="flex items-center text-sm text-gray-300">
                          <Calendar className="h-4 w-4 mr-2 text-yellow-400" />
                          {job.duration}
                        </div>
                      )}

                      {/* Skills */}
                      {job.skillsRequired.length > 0 && (
                        <div className="flex flex-wrap gap-2">
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
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0">
                    <div className="flex items-center justify-between w-full mb-3">
                      <div className="flex items-center space-x-2">
                        {getUrgencyBadge(job.urgency)}
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {formatDate(job.createdAt)}
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2 w-full">
                      <Button
                        onClick={() => window.open(`/jobs/marketplace?id=${job.id}`, '_blank')}
                        className="flex-1 bg-yellow-400 text-gray-900 hover:bg-yellow-300"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Briefcase className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-2">No jobs found</h3>
              <p className="text-gray-400 text-lg mb-4">
                Check back later for new opportunities that match your profile
              </p>
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('');
                  setSelectedExperience('');
                  setSelectedJobType('');
                  setSelectedDuration('');
                }}
                className="bg-yellow-400 text-gray-900 hover:bg-yellow-300"
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}