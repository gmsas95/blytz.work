'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Contract {
  id: string;
  title: string;
  description: string;
  skills: string[];
  experienceLevel: 'junior' | 'mid' | 'senior';
  duration: 'short-term' | 'long-term' | 'ongoing';
  budgetMin: number;
  budgetMax: number;
  workingHours: string;
  timezone: string;
  createdAt: string;
  employer: {
    id: string;
    name: string;
    company: string;
    avatar: string;
    rating: number;
  };
}

interface FilterState {
  skills: string[];
  experienceLevel: string;
  budgetMin: string;
  budgetMax: string;
  sortBy: string;
}

const SKILLS_OPTIONS = [
  'Customer Service',
  'Data Entry',
  'Social Media Management',
  'Email Management',
  'Calendar Management',
  'Research',
  'Content Creation',
  'Video Editing',
  'Graphic Design',
  'Bookkeeping'
];

export function ContractFeed() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    skills: [],
    experienceLevel: '',
    budgetMin: '',
    budgetMax: '',
    sortBy: 'createdAt'
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...filters.skills.length && { skills: filters.skills.join(',') },
        ...filters.experienceLevel && { experienceLevel: filters.experienceLevel },
        ...filters.budgetMin && { budgetMin: filters.budgetMin },
        ...filters.budgetMax && { budgetMax: filters.budgetMax },
        sortBy: filters.sortBy
      });

      const response = await fetch(`/api/contracts/feed?${params}`);
      const result = await response.json();

      if (result.success) {
        setContracts(result.contracts);
        setTotalPages(result.pagination.pages);
      }
    } catch (error) {
      console.error('Failed to fetch contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [page, filters]);

  const handleFilterChange = (key: keyof FilterState, value: string | string[]) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPage(1); // Reset to first page when filtering
  };

  const handleSkillToggle = (skill: string) => {
    const currentSkills = filters.skills as string[];
    const newSkills = currentSkills.includes(skill)
      ? currentSkills.filter(s => s !== skill)
      : [...currentSkills, skill];
    
    handleFilterChange('skills', newSkills);
  };

  const getBudgetRange = (min: number, max: number) => {
    if (min === max) return `$${min}/hr`;
    return `$${min}-${max}/hr`;
  };

  const getExperienceColor = (level: string) => {
    switch (level) {
      case 'junior': return 'text-green-600 bg-green-100';
      case 'mid': return 'text-blue-600 bg-blue-100';
      case 'senior': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDurationColor = (duration: string) => {
    switch (duration) {
      case 'short-term': return 'text-yellow-600 bg-yellow-100';
      case 'long-term': return 'text-orange-600 bg-orange-100';
      case 'ongoing': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-center mb-8">
            Find Contracts
          </h1>

          {/* Filters Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Filter Contracts</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Skills Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {SKILLS_OPTIONS.map(skill => (
                    <label
                      key={skill}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.skills.includes(skill)}
                        onChange={() => handleSkillToggle(skill)}
                        className="text-yellow-600 focus:ring-yellow-400"
                      />
                      <span className="text-sm">{skill}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Experience Level Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Level
                </label>
                <select
                  value={filters.experienceLevel}
                  onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                >
                  <option value="">All Levels</option>
                  <option value="junior">Junior (0-2 years)</option>
                  <option value="mid">Mid-level (2-5 years)</option>
                  <option value="senior">Senior (5+ years)</option>
                </select>
              </div>

              {/* Budget Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Range ($/hour)
                </label>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.budgetMin}
                    onChange={(e) => handleFilterChange('budgetMin', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.budgetMax}
                    onChange={(e) => handleFilterChange('budgetMax', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Sort Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                >
                  <option value="createdAt">Newest First</option>
                  <option value="budgetMin">Budget (Low to High)</option>
                  <option value="budgetMax">Budget (High to Low)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contracts Grid */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {contracts.map((contract, index) => (
                  <motion.div
                    key={contract.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <Link href={`/contract/${contract.id}`}>
                      <div className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {contract.title}
                            </h3>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              {contract.employer.avatar && (
                                <img
                                  src={contract.employer.avatar}
                                  alt={contract.employer.name}
                                  className="w-6 h-6 rounded-full"
                                />
                              )}
                              <span>{contract.employer.name}</span>
                              {contract.employer.rating && (
                                <span className="flex items-center">
                                  ⭐ {contract.employer.rating}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDurationColor(contract.duration)}`}>
                            {contract.duration.replace('-', ' ')}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                          {contract.description}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getExperienceColor(contract.experienceLevel)}`}>
                            {contract.experienceLevel}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            {getBudgetRange(contract.budgetMin, contract.budgetMax)}
                          </span>
                          {contract.workingHours && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                              {contract.workingHours}
                            </span>
                          )}
                        </div>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {contract.skills.slice(0, 3).map(skill => (
                            <span
                              key={skill}
                              className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded"
                            >
                              {skill}
                            </span>
                          ))}
                          {contract.skills.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                              +{contract.skills.length - 3} more
                            </span>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{contract.employer.company}</span>
                          <span>{new Date(contract.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center space-x-2 mb-8">
                  <button
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <span className="px-4 py-2 bg-yellow-500 text-black rounded-lg">
                    Page {page} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
