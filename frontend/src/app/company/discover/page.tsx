'use client';

import React, { useState, useEffect } from 'react';
import { AlertContainer } from '@/components/ui/Alert';
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";

// Mock VA data
const mockRecommendations = [
  {
    id: 1,
    name: "Sarah Chen",
    title: "Executive Assistant",
    location: "Manila, Philippines",
    hourlyRate: 25,
    rating: 4.8,
    skills: ["Calendar Management", "Email", "Research"],
    languages: ["English", "Mandarin"],
    description: "Professional executive assistant with expertise in C-suite support.",
    availability: "Full-time",
    timezone: "GMT+8"
  },
  {
    id: 2,
    name: "Maria Rodriguez",
    title: "Social Media Manager",
    location: "Mexico City, Mexico",
    hourlyRate: 20,
    rating: 4.9,
    skills: ["Content Creation", "Analytics", "SEO"],
    languages: ["English", "Spanish"],
    description: "Creative social media specialist with proven track record.",
    availability: "Part-time",
    timezone: "GMT-6"
  }
];

export default function DiscoverPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recommendations, setRecommendations] = useState(mockRecommendations);
  const [savedVAs, setSavedVAs] = useState<number[]>([]);

  const currentVA = recommendations[currentIndex];

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'right') {
      setSavedVAs([...savedVAs, currentVA.id]);
      // Show success notification
      if ((window as any).addAlert) {
        (window as any).addAlert({
          type: 'success',
          title: 'VA Saved',
          message: `${currentVA.name} has been saved to your favorites`
        });
      }
    }
    
    if (currentIndex < recommendations.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const toggleSave = (vaId: number) => {
    if (savedVAs.includes(vaId)) {
      setSavedVAs(savedVAs.filter(id => id !== vaId));
      // Show remove notification
      if ((window as any).addAlert) {
        (window as any).addAlert({
          type: 'info',
          title: 'VA Removed',
          message: `Removed from favorites`
        });
      }
    } else {
      setSavedVAs([...savedVAs, vaId]);
      // Show save notification
      if ((window as any).addAlert) {
        (window as any).addAlert({
          type: 'success',
          title: 'VA Saved',
          message: `${currentVA.name} added to favorites`
        });
      }
    }
  };

  return (
    <>
      <AlertContainer />
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Discover Virtual Assistants</h1>
          <p className="text-gray-600">Swipe through potential matches for your job</p>
        </div>

        <div className="relative">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{currentVA.name}</h2>
                <p className="text-gray-600">{currentVA.title}</p>
              </div>
              <button
                onClick={() => toggleSave(currentVA.id)}
                className={`p-2 rounded-full ${savedVAs.includes(currentVA.id) 
                  ? 'bg-red-100 text-red-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                <Heart className={`w-5 h-5 ${savedVAs.includes(currentVA.id) ? 'fill-current' : ''}`} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {currentVA.skills?.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {currentVA.languages?.map((lang, index) => (
                    <span key={index} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">About</h3>
                <p className="text-gray-600">{currentVA.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Rate</h3>
                  <p className="text-lg font-semibold text-blue-600">${currentVA.hourlyRate}/hr</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Rating</h3>
                  <p className="text-lg font-semibold text-green-600">⭐ {currentVA.rating}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <span className="text-sm text-gray-500">
              {currentIndex + 1} of {recommendations?.length || 0}
            </span>

            <button
              onClick={() => setCurrentIndex(Math.min(recommendations.length - 1, currentIndex + 1))}
              disabled={currentIndex === recommendations.length - 1}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
