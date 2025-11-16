"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Users, 
  Briefcase, 
  DollarSign,
  Star,
  Eye,
  Calendar,
  TrendingUp,
  Clock,
  MapPin,
  Award,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Heart,
  ChevronDown,
  ChevronUp,
  UserPlus
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

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

const EmployerDashboard = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [vaProfiles, setVaProfiles] = useState<VAProfile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<VAProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    skills: [] as string[],
    hourlyRateMin: '',
    hourlyRateMax: '',
    country: '',
    availability: true,
    verificationLevel: '',
    sortBy: 'rating'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [savedProfiles, setSavedProfiles] = useState(new Set<string>());

  useEffect(() => {
    fetchVAProfiles();
    fetchDashboardStats();
  }, []);

  useEffect(() => {
    filterAndSearchProfiles();
  }, [vaProfiles, searchTerm, filters]);

  const fetchVAProfiles = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/auth');
        return;
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        search: searchTerm,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''))
      });

      const response = await fetch(`/api/va/profiles/search?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVaProfiles(data.data.vaProfiles);
        setFilteredProfiles(data.data.vaProfiles);
        setTotalPages(data.data.pagination.totalPages);
        setTotalResults(data.data.pagination.total);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch VA profiles');
      }

    } catch (error) {
      console.error('VA profiles fetch error:', error);
      toast.error('Failed to load VA profiles');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      // Mock stats for now - will be real API
      const stats = {
        activeJobs: 5,
        totalApplications: 23,
        hiredVAs: 3,
        totalSpent: 4580
      };
      // Set dashboard stats state
    } catch (error) {
      console.error('Dashboard stats error:', error);
    }
  };

  const filterAndSearchProfiles = () => {
    let filtered = vaProfiles;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(profile => 
        profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Skills filter
    if (filters.skills.length > 0) {
      filtered = filtered.filter(profile =>
        filters.skills.some(skill => profile.skills.includes(skill))
      );
    }

    // Rate filter
    if (filters.hourlyRateMin) {
      filtered = filtered.filter(profile => profile.hourlyRate >= parseInt(filters.hourlyRateMin));
    }
    if (filters.hourlyRateMax) {
      filtered = filtered.filter(profile => profile.hourlyRate <= parseInt(filters.hourlyRateMax));
    }

    // Country filter
    if (filters.country) {
      filtered = filtered.filter(profile => profile.country === filters.country);
    }

    // Availability filter
    if (filters.availability) {
      filtered = filtered.filter(profile => profile.availability);
    }

    // Verification level filter
    if (filters.verificationLevel) {
      filtered = filtered.filter(profile => profile.verificationLevel === filters.verificationLevel);
    }

    setFilteredProfiles(filtered);
  };

  const handleSaveProfile = (profileId) => {
    const newSaved = new Set(savedProfiles);
    if (newSaved.has(profileId)) {
      newSaved.delete(profileId);
      toast.info('Profile removed from saved');
    } else {
      newSaved.add(profileId);
      toast.success('Profile saved for later');
    }
    setSavedProfiles(newSaved);
  };

  const handleContactVA = (profileId) => {
    router.push(`/messages/new?va=${profileId}`);
  };

  const handleViewProfile = (profileId) => {
    router.push(`/va/profiles/${profileId}`);
  };

  const handlePostJob = () => {
    router.push('/jobs/post');
  };

  const commonSkills = [
    'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'Python',
    'Virtual Assistance', 'Customer Service', 'Project Management',
    'Content Writing', 'Social Media Marketing', 'Email Marketing',
    'Data Entry', 'Bookkeeping', 'Administrative Support'
  ];

  const countries = [
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'ph', label: 'Philippines' },
    { value: 'in', label: 'India' },
    { value: 'ca', label: 'Canada' },
    { value: 'au', label: 'Australia' },
    { value: 'de', label: 'Germany' },
    { value: 'fr', label: 'France' }
  ];

  const verificationLevels = [
    { value: 'all', label: 'All Levels' },
    { value: 'premium', label: 'Premium Only' },
    { value: 'professional', label: 'Professional Only' },
    { value: 'basic', label: 'Basic Only' }
  ];

  const sortOptions = [
    { value: 'rating', label: 'Highest Rated' },
    { value: 'rate_low', label: 'Lowest Rate' },
    { value: 'rate_high', label: 'Highest Rate' },
    { value: 'experience', label: 'Most Experience' },
    { value: 'recent', label: 'Recently Active' }
  ];

  const getVerificationBadge = (level) => {
    switch (level) {
      case 'premium':
        return <Badge className="bg-yellow-500 text-white">Premium</Badge>;
      case 'professional':
        return <Badge className="bg-blue-500 text-white">Professional</Badge>;
      default:
        return <Badge variant="secondary">Basic</Badge>;
    }
  };

  const getAvailabilityBadge = (available) => {
    return available ? (
      <Badge className="bg-green-500 text-white flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        Available
      </Badge>
    ) : (
      <Badge variant="outline" className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        Busy
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading VA profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Discover Virtual Assistants</h1>
              <p className="text-slate-600 mt-1">
                Find the perfect VA for your business from {totalResults.toLocaleString()} talented professionals
              </p>
            </div>
            <Button onClick={handlePostJob}>
              <Briefcase className="h-4 w-4 mr-2" />
              Post Job
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <Input
                placeholder="Search by name, skills, or bio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>

            {/* Advanced Filters Toggle */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                {showFilters ? 'Hide Filters' : 'Advanced Filters'}
                {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>{totalResults} VAs found</span>
                <Separator orientation="vertical" className="h-4" />
                <span>Page {currentPage} of {totalPages}</span>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Skills Filter */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Skills</label>
                    <div className="space-y-2">
                      {commonSkills.slice(0, 6).map(skill => (
                        <div key={skill} className="flex items-center">
                          <input
                            type="checkbox"
                            id={skill}
                            checked={filters.skills.includes(skill)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFilters(prev => ({ ...prev, skills: [...prev.skills, skill] }));
                              } else {
                                setFilters(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
                              }
                            }}
                            className="rounded border-slate-300 mr-2"
                          />
                          <label htmlFor={skill} className="text-sm text-slate-600">{skill}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Rate Range */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Hourly Rate (USD)</label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={filters.hourlyRateMin}
                        onChange={(e) => setFilters(prev => ({ ...prev, hourlyRateMin: e.target.value }))}
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={filters.hourlyRateMax}
                        onChange={(e) => setFilters(prev => ({ ...prev, hourlyRateMax: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Country Filter */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Country</label>
                    <Select value={filters.country} onValueChange={(value) => setFilters(prev => ({ ...prev, country: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any country</SelectItem>
                        {countries.map(country => (
                          <SelectItem key={country.value} value={country.value}>
                            {country.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Verification Level */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Verification Level</label>
                    <Select value={filters.verificationLevel} onValueChange={(value) => setFilters(prev => ({ ...prev, verificationLevel: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any level" />
                      </SelectTrigger>
                      <SelectContent>
                        {verificationLevels.map(level => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Availability */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Availability</label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="availability"
                        checked={filters.availability}
                        onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.checked }))}
                        className="rounded border-slate-300 mr-2"
                      />
                      <label htmlFor="availability" className="text-sm text-slate-600">Available now</label>
                    </div>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Sort By</label>
                    <Select value={filters.sortBy} onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        {sortOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* VA Profiles Grid */}
        {filteredProfiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((profile) => (
              <Card key={profile.id} className="relative hover:shadow-lg transition-shadow">
                {/* Save Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2 z-10"
                  onClick={() => handleSaveProfile(profile.id)}
                >
                  <Heart className={`h-4 w-4 ${savedProfiles.has(profile.id) ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {profile.avatarUrl ? (
                        <img
                          src={profile.avatarUrl}
                          alt={profile.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold">
                          {profile.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg">{profile.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          {getVerificationBadge(profile.verificationLevel)}
                          {getAvailabilityBadge(profile.availability)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Stats Row */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-slate-500" />
                      <span className="font-semibold">${profile.hourlyRate}/hr</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-slate-500" />
                      <span>{profile.country}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{profile.averageRating?.toFixed(1) || 'N/A'}</span>
                      <span className="text-slate-500">({profile.totalReviews || 0})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4 text-slate-500" />
                      <span>{profile.completedJobs || 0} jobs</span>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-sm text-slate-600 line-clamp-3">{profile.bio}</p>

                  {/* Skills */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-4 w-4 text-slate-500" />
                      <span className="text-sm font-medium">Skills</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {profile.skills.slice(0, 6).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {profile.skills.length > 6 && (
                        <Badge variant="outline" className="text-xs">
                          +{profile.skills.length - 6}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Response Rate */}
                  {profile.responseRate && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Response Rate</span>
                      <div className="flex items-center gap-2">
                        <Progress value={profile.responseRate} className="w-20 h-2" />
                        <span className="font-medium">{profile.responseRate}%</span>
                      </div>
                    </div>
                  )}

                  {/* View Count */}
                  {profile.profileViews && (
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <Eye className="h-4 w-4" />
                      <span>{profile.profileViews.toLocaleString()} views</span>
                    </div>
                  )}
                </CardContent>

                {/* Action Buttons */}
                <div className="flex gap-2 p-4 pt-0">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleViewProfile(profile.id)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Profile
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleContactVA(profile.id)}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Contact
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Users className="h-16 w-16 mx-auto text-slate-400 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No VAs found</h3>
            <p className="text-slate-600 mb-6">
              Try adjusting your search terms or filters to find more virtual assistants.
            </p>
            <Button onClick={() => {
              setSearchTerm('');
              setFilters({
                skills: [],
                hourlyRateMin: '',
                hourlyRateMax: '',
                country: '',
                availability: true,
                verificationLevel: '',
                sortBy: 'rating'
              });
            }}>
              Clear Filters
            </Button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, index) => {
                const pageNum = index + 1;
                const isActive = pageNum === currentPage;
                
                return (
                  <Button
                    key={pageNum}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerDashboard;