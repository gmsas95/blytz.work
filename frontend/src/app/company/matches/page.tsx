'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useImprovedAlert } from "@/contexts/ImprovedAlertContext";

interface VAMatch {
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
  responseRate?: number;
  avatarUrl?: string;
  skillsScore?: number;
  verificationLevel: string;
  backgroundCheckPassed: boolean;
  featuredProfile: boolean;
  matchScore: number;
  matchedAt: string;
}

interface Filters {
  search: string;
  skills: string;
  minHourlyRate: number;
  maxHourlyRate: number;
  availability: boolean;
  rating: number;
  verified: boolean;
  featured: boolean;
}

const commonSkills = [
  "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Python", "Java", "C++",
  "HTML/CSS", "Vue.js", "Angular", "Swift", "Kotlin", "Go", "Ruby", "PHP",
  "Data Analysis", "Machine Learning", "DevOps", "AWS", "Docker", "Kubernetes",
  "MongoDB", "PostgreSQL", "MySQL", "Project Management", "Agile", "Scrum",
  "Content Writing", "Copywriting", "SEO", "Social Media Marketing", "Email Marketing",
  "Graphic Design", "UI/UX Design", "Video Editing", "Translation", "Customer Support",
  "Virtual Assistance", "Bookkeeping", "Data Entry", "Research", "Telemarketing"
];

export default function CompanyMatches() {
  const router = useRouter();
  const { user } = useAuth();
  const { addAlert } = useImprovedAlert();
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<VAMatch[]>([]);
  const [savedVAs, setSavedVAs] = useState<string[]>([]);
  const [swipedVAs, setSwipedVAs] = useState<Set<string>>(new Set());
  const [currentVAIndex, setCurrentVAIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

  const [filters, setFilters] = useState<Filters>({
    search: '',
    skills: '',
    minHourlyRate: 0,
    maxHourlyRate: 200,
    availability: true,
    rating: 0,
    verified: false,
    featured: false
  });

  useEffect(() => {
    if (user && user.role === 'company') {
      fetchMatches();
    } else if (user) {
      router.push('/va/matches');
    }
  }, [user, filters, viewMode]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      // Add filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== false && key !== 'minHourlyRate' && key !== 'maxHourlyRate') {
          params.append(key, value.toString());
        }
      });
      
      if (filters.minHourlyRate > 0) params.append('minHourlyRate', filters.minHourlyRate.toString());
      if (filters.maxHourlyRate < 200) params.append('maxHourlyRate', filters.maxHourlyRate.toString());

      const response = await fetch(`/api/company/matches?${params}`);
      const result = await response.json();

      if (response.ok) {
        setMatches(result.data.matches || []);
      } else {
        throw new Error(result.error || 'Failed to fetch matches');
      }
    } catch (error: any) {
      addAlert(error.message || 'Failed to fetch matches', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = (vaId: string, direction: 'left' | 'right') => {
    setSwipedVAs(prev => new Set(prev).add(vaId));
    setSavedVAs(prev => 
      direction === 'right' ? [...prev, vaId] : prev.filter(id => id !== vaId)
    );

    // Move to next VA
    setTimeout(() => {
      if (currentVAIndex < matches.length - 1) {
        setCurrentVAIndex(prev => prev + 1);
      }
    }, 300);

    // Call API to record the swipe
    recordSwipe(vaId, direction);
  };

  const recordSwipe = async (vaId: string, direction: 'left' | 'right') => {
    try {
      await fetch('/api/company/swipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vaProfileId: vaId,
          action: direction === 'right' ? 'like' : 'pass'
        }),
      });
    } catch (error) {
      console.error('Failed to record swipe:', error);
    }
  };

  const toggleSaveVA = (vaId: string) => {
    setSavedVAs(prev => {
      if (prev.includes(vaId)) {
        return prev.filter(id => id !== vaId);
      } else {
        return [...prev, vaId];
      }
    });
  };

  const resetCards = () => {
    setCurrentVAIndex(0);
    setSwipedVAs(new Set());
  };

  const formatMatchScore = (score: number) => {
    return Math.round(score * 100);
  };

  const getMatchColor = (score: number) => {
    const percentage = formatMatchScore(score);
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getVerificationBadge = (va: VAMatch) => {
    if (va.backgroundCheckPassed) {
      return (
        <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
          ✓ Background Checked
        </span>
      );
    }
    if (va.verificationLevel !== 'basic') {
      return (
        <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
          ✓ Verified
        </span>
      );
    }
    return null;
  };

  const currentVA = matches[currentVAIndex];

  if (!user) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
            <p>You need to be signed in to view matches.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Discover VAs</h1>
                <p className="text-gray-600 mt-1">Swipe right to save, left to pass</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'cards' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Cards
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    List
                  </button>
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center space-x-2"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  <span>Filters</span>
                </button>
                <button
                  onClick={resetCards}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Search VAs</label>
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      placeholder="Name, skills, bio..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                    <select
                      value={filters.skills}
                      onChange={(e) => setFilters(prev => ({ ...prev, skills: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Skills</option>
                      {commonSkills.map((skill) => (
                        <option key={skill} value={skill}>{skill}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hourly Rate Range
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={filters.minHourlyRate}
                        onChange={(e) => setFilters(prev => ({ ...prev, minHourlyRate: parseInt(e.target.value) || 0 }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Min"
                        min="0"
                      />
                      <span className="text-gray-500">-</span>
                      <input
                        type="number"
                        value={filters.maxHourlyRate}
                        onChange={(e) => setFilters(prev => ({ ...prev, maxHourlyRate: parseInt(e.target.value) || 200 }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Max"
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Rating</label>
                    <select
                      value={filters.rating}
                      onChange={(e) => setFilters(prev => ({ ...prev, rating: parseFloat(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="0">All Ratings</option>
                      <option value="4">4+ Stars</option>
                      <option value="4.5">4.5+ Stars</option>
                      <option value="5">5 Stars</option>
                    </select>
                  </div>

                  <div className="lg:col-span-4 flex items-center space-x-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.availability}
                        onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Available Only</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.verified}
                        onChange={(e) => setFilters(prev => ({ ...prev, verified: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Verified Only</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.featured}
                        onChange={(e) => setFilters(prev => ({ ...prev, featured: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Featured Only</span>
                    </label>
                  </div>
                </div>

                <div className="mt-4 flex justify-between">
                  <div className="text-sm text-gray-600">
                    {matches.filter(va => !swipedVAs.has(va.id)).length} VAs to review
                  </div>
                  <button
                    onClick={() => setFilters({
                      search: '',
                      skills: '',
                      minHourlyRate: 0,
                      maxHourlyRate: 200,
                      availability: true,
                      rating: 0,
                      verified: false,
                      featured: false
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

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : viewMode === 'cards' && currentVA ? (
            /* Card View */
            <div className="max-w-2xl mx-auto">
              {currentVAIndex > 0 && (
                <div className="text-center mb-4 text-gray-600">
                  {currentVAIndex + 1} of {matches.length}
                </div>
              )}

              <div className="relative bg-white rounded-lg shadow-lg border overflow-hidden">
                {/* Match Score Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <div className={`text-2xl font-bold ${getMatchColor(currentVA.matchScore)}`}>
                    {formatMatchScore(currentVA.matchScore)}%
                  </div>
                  <div className="text-xs text-gray-600">Match</div>
                </div>

                {/* Profile Header */}
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    {currentVA.avatarUrl ? (
                      <img
                        src={currentVA.avatarUrl}
                        alt={currentVA.name}
                        className="w-20 h-20 object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-500 text-2xl font-bold">
                          {currentVA.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h2 className="text-2xl font-bold text-gray-900">{currentVA.name}</h2>
                        {getVerificationBadge(currentVA)}
                        {currentVA.featuredProfile && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">⭐ Featured</span>
                        )}
                      </div>
                      <p className="text-gray-600">{currentVA.country} • ${currentVA.hourlyRate}/hr</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-600">
                          ⭐ {currentVA.averageRating?.toFixed(1) || 'N/A'} ({currentVA.totalReviews || 0} reviews)
                        </span>
                        <span className="text-sm text-gray-600">
                          💼 {currentVA.completedJobs || 0} jobs
                        </span>
                        <span className={`text-sm ${currentVA.availability ? 'text-green-600' : 'text-red-600'}`}>
                          {currentVA.availability ? '✓ Available' : '✗ Unavailable'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-gray-700 mt-4 line-clamp-3">{currentVA.bio}</p>

                  {/* Skills */}
                  <div className="mt-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentVA.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-gray-900">{currentVA.profileViews || 0}</div>
                      <div className="text-xs text-gray-600">Profile Views</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-gray-900">{currentVA.earnedAmount || 0}</div>
                      <div className="text-xs text-gray-600">Earned</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-gray-900">{currentVA.skillsScore || 0}</div>
                      <div className="text-xs text-gray-600">Skills Score</div>
                    </div>
                  </div>

                  {/* Response Rate */}
                  {currentVA.responseRate && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <div className="text-sm text-green-800">
                        <span className="font-semibold">{currentVA.responseRate}%</span> average response rate
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="border-t p-6">
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => handleSwipe(currentVA.id, 'left')}
                      className="w-16 h-16 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors flex items-center justify-center"
                    >
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <button
                      onClick={() => toggleSaveVA(currentVA.id)}
                      className={`w-16 h-16 rounded-full transition-colors flex items-center justify-center ${
                        savedVAs.includes(currentVA.id)
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleSwipe(currentVA.id, 'right')}
                      className="w-16 h-16 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors flex items-center justify-center"
                    >
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : viewMode === 'list' ? (
            /* List View */
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {matches.filter(va => !swipedVAs.has(va.id)).map((va) => (
                <div key={va.id} className="bg-white rounded-lg border hover:shadow-lg transition-shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {va.avatarUrl ? (
                        <img
                          src={va.avatarUrl}
                          alt={va.name}
                          className="w-12 h-12 object-cover rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-gray-500 font-bold">
                            {va.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">{va.name}</h3>
                        <p className="text-sm text-gray-600">{va.country} • ${va.hourlyRate}/hr</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getMatchColor(va.matchScore)}`}>
                        {formatMatchScore(va.matchScore)}%
                      </div>
                      <div className="text-xs text-gray-600">Match</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {getVerificationBadge(va)}
                    {va.featuredProfile && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">⭐ Featured</span>
                    )}
                  </div>

                  <p className="text-gray-700 text-sm mb-3 line-clamp-2">{va.bio}</p>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {va.skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded"
                      >
                        {skill}
                      </span>
                    ))}
                    {va.skills.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                        +{va.skills.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                    <span>⭐ {va.averageRating?.toFixed(1) || 'N/A'}</span>
                    <span>💼 {va.completedJobs || 0} jobs</span>
                    <span className={va.availability ? 'text-green-600' : 'text-red-600'}>
                      {va.availability ? 'Available' : 'Unavailable'}
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleSaveVA(va.id)}
                      className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        savedVAs.includes(va.id)
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {savedVAs.includes(va.id) ? 'Saved' : 'Save'}
                    </button>
                    <button
                      onClick={() => handleSwipe(va.id, 'right')}
                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                    >
                      Like
                    </button>
                    <button
                      onClick={() => handleSwipe(va.id, 'left')}
                      className="flex-1 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
                    >
                      Pass
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* No more VAs */
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                No More VAs to Review
              </h2>
              <p className="text-gray-600 mb-6">
                You've reviewed all available VAs. Check back later or adjust your filters.
              </p>
              <div className="space-x-4">
                <button
                  onClick={resetCards}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Review Again
                </button>
                <button
                  onClick={() => router.push('/company/jobs/new')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Post a Job
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}