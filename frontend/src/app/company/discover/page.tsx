'use client';

import React, { useState, useEffect } from 'react';
import { useImprovedAlert } from '@/contexts/ImprovedAlertContext';
import { useAuth } from '@/components/AuthProvider';
import Navbar from "@/components/Navbar";
import { 
  Heart, 
  ChevronLeft, 
  ChevronRight,
  User,
  MapPin,
  DollarSign,
  Star,
  Clock,
  Globe,
  MessageCircle,
  Briefcase,
  Filter,
  Search
} from "lucide-react";
import { Button } from '@/components/ui-shadcn/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui-shadcn/card';
import { Badge } from '@/components/ui-shadcn/badge';
import { Input } from '@/components/ui-shadcn/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui-shadcn/select';
import { Separator } from '@/components/ui-shadcn/separator';

// Mock VA data
const mockRecommendations = [
  {
    id: 1,
    name: "Sarah Chen",
    title: "Executive Assistant",
    location: "Manila, Philippines",
    hourlyRate: 25,
    rating: 4.8,
    totalReviews: 47,
    skills: ["Calendar Management", "Email", "Research"],
    languages: ["English", "Mandarin"],
    description: "Professional executive assistant with expertise in C-suite support.",
    availability: "Full-time",
    timezone: "GMT+8",
    experience: "5 years",
    completedJobs: 124,
    profileViews: 892,
    avatar: "https://via.placeholder.com/80x80/FFD600/000000?text=SC"
  },
  {
    id: 2,
    name: "Maria Rodriguez",
    title: "Social Media Manager",
    location: "Mexico City, Mexico",
    hourlyRate: 20,
    rating: 4.9,
    totalReviews: 62,
    skills: ["Content Creation", "Analytics", "SEO"],
    languages: ["English", "Spanish"],
    description: "Creative social media specialist with proven track record.",
    availability: "Part-time",
    timezone: "GMT-6",
    experience: "3 years",
    completedJobs: 87,
    profileViews: 654,
    avatar: "https://via.placeholder.com/80x80/FFD600/000000?text=MR"
  },
  {
    id: 3,
    name: "James Wilson",
    title: "Full Stack Developer",
    location: "Toronto, Canada",
    hourlyRate: 45,
    rating: 4.7,
    totalReviews: 35,
    skills: ["React", "Node.js", "TypeScript", "Python"],
    languages: ["English", "French"],
    description: "Experienced developer specializing in modern web technologies.",
    availability: "Full-time",
    timezone: "GMT-5",
    experience: "7 years",
    completedJobs: 156,
    profileViews: 1234,
    avatar: "https://via.placeholder.com/80x80/FFD600/000000?text=JW"
  }
];

const skills = [
  "Calendar Management", "Email", "Research", "Content Creation", 
  "Analytics", "SEO", "React", "Node.js", "TypeScript", "Python",
  "Customer Support", "Data Entry", "Social Media", "Writing"
];

const experienceLevels = ["Entry Level", "Mid Level", "Senior Level", "Expert"];
const availabilityOptions = ["Full-time", "Part-time", "Freelance"];

export default function DiscoverPage() {
  const { addAlert } = useImprovedAlert();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recommendations, setRecommendations] = useState(mockRecommendations);
  const [savedVAs, setSavedVAs] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'swipe' | 'grid'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState('');
  const [selectedAvailability, setSelectedAvailability] = useState('');

  const currentVA = recommendations[currentIndex];

  useEffect(() => {
    // Load initial recommendations
    fetchRecommendations();
  }, [searchQuery, selectedSkills, selectedExperience, selectedAvailability]);

  const fetchRecommendations = async () => {
    try {
      const response = await fetch('/api/company/discover/vas');
      
      if (!response.ok) {
        console.warn('Discover API not available, using mock data');
        // Filter mock data based on search
        let filtered = mockRecommendations;
        
        if (searchQuery) {
          filtered = filtered.filter(va => 
            va.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            va.title.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        
        if (selectedSkills.length > 0) {
          filtered = filtered.filter(va => 
            selectedSkills.some(skill => va.skills.includes(skill))
          );
        }
        
        setRecommendations(filtered);
        setCurrentIndex(0);
        return;
      }
      
      const result = await response.json();
      setRecommendations(result.data);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    }
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'right') {
      setSavedVAs([...savedVAs, currentVA.id]);
      addAlert(`${currentVA.name} has been saved to your favorites`, 'success');
    }
    
    if (currentIndex < recommendations.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const toggleSave = (vaId: number) => {
    if (savedVAs.includes(vaId)) {
      setSavedVAs(savedVAs.filter(id => id !== vaId));
      const va = recommendations.find(v => v.id === vaId);
      addAlert(`${va?.name} removed from favorites`, 'info');
    } else {
      setSavedVAs([...savedVAs, vaId]);
      const va = recommendations.find(v => v.id === vaId);
      addAlert(`${va?.name} added to favorites`, 'success');
    }
  };

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} 
          />
        ))}
        <span className="text-gray-300 ml-1">{rating}</span>
      </div>
    );
  };

  const renderVACard = (va: any) => (
    <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700 hover:border-yellow-400/50 transition-colors">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <img
              src={va.avatar}
              alt={va.name}
              className="w-16 h-16 rounded-full border-2 border-yellow-400"
            />
            <div>
              <CardTitle className="text-xl text-white">{va.name}</CardTitle>
              <CardDescription className="text-gray-400">{va.title}</CardDescription>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">{va.location}</span>
              </div>
            </div>
          </div>
          <Button
            onClick={() => toggleSave(va.id)}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-red-400"
          >
            <Heart className={`w-5 h-5 ${savedVAs.includes(va.id) ? 'fill-current text-red-400' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <div className="space-y-4">
          <p className="text-gray-300 text-sm">{va.description}</p>

          <div>
            <h4 className="font-semibold text-white mb-2">Skills</h4>
            <div className="flex flex-wrap gap-2">
              {va.skills?.slice(0, 4).map((skill: string, index: number) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-blue-500/20 text-blue-300 border-blue-500/30"
                >
                  {skill}
                </Badge>
              ))}
              {va.skills?.length > 4 && (
                <Badge variant="secondary" className="bg-gray-600/20 text-gray-300 border-gray-600/30">
                  +{va.skills.length - 4} more
                </Badge>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {va.languages?.map((lang: string, index: number) => (
              <Badge
                key={index}
                variant="outline"
                className="border-green-500/30 text-green-300"
              >
                <Globe className="w-3 h-3 mr-1" />
                {lang}
              </Badge>
            ))}
          </div>

          <Separator className="bg-gray-700" />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm text-gray-400 mb-1">Hourly Rate</h4>
              <p className="text-xl font-bold text-green-400">${va.hourlyRate}/hr</p>
            </div>
            <div>
              <h4 className="text-sm text-gray-400 mb-1">Rating</h4>
              {renderStarRating(va.rating)}
            </div>
            <div>
              <h4 className="text-sm text-gray-400 mb-1">Experience</h4>
              <p className="text-lg font-semibold text-yellow-400">{va.experience}</p>
            </div>
            <div>
              <h4 className="text-sm text-gray-400 mb-1">Completed Jobs</h4>
              <p className="text-lg font-semibold text-purple-400">{va.completedJobs}</p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex space-x-2 w-full">
          <Button className="flex-1 bg-yellow-400 text-gray-900 hover:bg-yellow-300">
            <MessageCircle className="w-4 h-4 mr-2" />
            Message
          </Button>
          <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
            <Briefcase className="w-4 h-4 mr-2" />
            Hire
          </Button>
        </div>
      </CardFooter>
    </Card>
  );

  if (recommendations.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <User className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No VAs Found</h2>
            <p className="text-gray-400 mb-4">Try adjusting your filters to find more matches</p>
            <Button
              onClick={() => {
                setSearchQuery('');
                setSelectedSkills([]);
                setSelectedExperience('');
                setSelectedAvailability('');
              }}
              className="bg-yellow-400 text-gray-900 hover:bg-yellow-300"
            >
              Clear All Filters
            </Button>
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
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white">Discover Virtual Assistants</h1>
                <p className="text-gray-400 mt-1">Find the perfect VA for your business needs</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'bg-yellow-400 text-gray-900' : 'border-gray-600 text-gray-300'}
                >
                  Grid View
                </Button>
                <Button
                  variant={viewMode === 'swipe' ? 'default' : 'outline'}
                  onClick={() => setViewMode('swipe')}
                  className={viewMode === 'swipe' ? 'bg-yellow-400 text-gray-900' : 'border-gray-600 text-gray-300'}
                >
                  Swipe View
                </Button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by name, title, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-3 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-200 mb-2 block">Skills</label>
                  <div className="flex flex-wrap gap-2">
                    {skills.slice(0, 4).map((skill) => (
                      <Button
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        variant={selectedSkills.includes(skill) ? "default" : "outline"}
                        size="sm"
                        className={
                          selectedSkills.includes(skill)
                            ? 'bg-yellow-400 text-gray-900'
                            : 'border-gray-600 text-gray-300'
                        }
                      >
                        {skill}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-200 mb-2 block">Experience</label>
                  <Select
                    value={selectedExperience}
                    onValueChange={setSelectedExperience}
                  >
                    <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                      <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {experienceLevels.map((level) => (
                        <SelectItem key={level} value={level} className="text-white hover:bg-gray-700">
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-200 mb-2 block">Availability</label>
                  <Select
                    value={selectedAvailability}
                    onValueChange={setSelectedAvailability}
                  >
                    <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {availabilityOptions.map((option) => (
                        <SelectItem key={option} value={option} className="text-white hover:bg-gray-700">
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedSkills([]);
                      setSelectedExperience('');
                      setSelectedAvailability('');
                    }}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700 w-full"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {viewMode === 'swipe' ? (
            <div className="max-w-md mx-auto">
              <div className="mb-6 text-center">
                <p className="text-gray-400">
                  {currentIndex + 1} of {recommendations.length} VAs
                </p>
              </div>

              {currentVA && (
                <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700">
                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-between items-start">
                      <Button
                        onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                        disabled={currentIndex === 0}
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>

                      <div className="flex flex-col items-center">
                        <img
                          src={currentVA.avatar}
                          alt={currentVA.name}
                          className="w-24 h-24 rounded-full border-4 border-yellow-400 mb-4"
                        />
                        <CardTitle className="text-2xl text-white">{currentVA.name}</CardTitle>
                        <CardDescription className="text-lg text-gray-300">{currentVA.title}</CardDescription>
                        <div className="flex items-center gap-2 mt-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-400">{currentVA.location}</span>
                        </div>
                      </div>

                      <Button
                        onClick={() => toggleSave(currentVA.id)}
                        variant="ghost"
                        className="text-gray-400 hover:text-red-400"
                      >
                        <Heart className={`w-5 h-5 ${savedVAs.includes(currentVA.id) ? 'fill-current text-red-400' : ''}`} />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-white mb-2">About</h4>
                      <p className="text-gray-300">{currentVA.description}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-white mb-2">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {currentVA.skills?.map((skill: string, index: number) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-blue-500/20 text-blue-300 border-blue-500/30"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <DollarSign className="w-6 h-6 text-green-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-green-400">${currentVA.hourlyRate}</p>
                        <p className="text-sm text-gray-400">/hour</p>
                      </div>
                      <div className="text-center">
                        <Clock className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                        <p className="text-lg font-bold text-yellow-400">{currentVA.experience}</p>
                        <p className="text-sm text-gray-400">experience</p>
                      </div>
                    </div>

                    {renderStarRating(currentVA.rating)}

                    <div className="flex space-x-3">
                      <Button
                        onClick={() => handleSwipe('left')}
                        variant="outline"
                        className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        Pass
                      </Button>
                      <Button
                        onClick={() => handleSwipe('right')}
                        className="flex-1 bg-yellow-400 text-gray-900 hover:bg-yellow-300"
                      >
                        Save
                      </Button>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0">
                    <Button
                      onClick={() => setCurrentIndex(Math.min(recommendations.length - 1, currentIndex + 1))}
                      disabled={currentIndex === recommendations.length - 1}
                      className="w-full"
                    >
                      Next VA
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((va) => (
                <div key={va.id}>
                  {renderVACard(va)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}