"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, X, Heart } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertContainer } from "@/components/AlertContainer";

// Mock data for development
const mockRecommendations = [
  {
    id: 1,
    name: "Sarah Johnson",
    country: "United States",
    hourlyRate: 25,
    skills: ["React", "Node.js", "TypeScript", "MongoDB"],
    availability: true,
  },
  {
    id: 2,
    name: "Maria Garcia",
    country: "Spain",
    hourlyRate: 30,
    skills: ["Vue.js", "Python", "Django", "PostgreSQL"],
    availability: true,
  },
  {
    id: 3,
    name: "Chen Wei",
    country: "Singapore",
    hourlyRate: 35,
    skills: ["Angular", "Java", "Spring Boot", "MySQL"],
    availability: false,
  },
];

export default function DiscoverPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");

  const recommendations = mockRecommendations;
  const currentVA = recommendations?.[currentIndex];

  const voteMutation = useMutation({
    mutationFn: async (vote: { liked: boolean; vaId: number }) => {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      return vote;
    },
    onSuccess: () => {
      // Move to next recommendation
      if (currentIndex < recommendations.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    },
  });

  const handleVote = (liked: boolean) => {
    if (currentVA) {
      voteMutation.mutate({
        liked,
        vaId: currentVA.id,
      });
    }
  };

  if (!recommendations || recommendations.length === 0) {
    return (
      <>
        <AlertContainer />
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">Discover Virtual Assistants</h1>
            <p className="text-gray-600">Swipe through potential matches for your job</p>
          </div>
          <div className="text-center py-16">
            <p className="text-gray-500">No virtual assistants available right now.</p>
          </div>
        </div>
      </>
    );
  }

  if (currentIndex >= recommendations.length) {
    return (
      <>
        <AlertContainer />
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">Discover Virtual Assistants</h1>
            <p className="text-gray-600">Swipe through potential matches for your job</p>
          </div>
          <div className="text-center py-16">
            <p className="text-gray-500">You have seen all recommendations.</p>
            <button
              onClick={() => setCurrentIndex(0)}
              className="btn-primary mt-4"
            >
              Start Over
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AlertContainer />
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Discover Virtual Assistants</h1>
          <p className="text-gray-600">Swipe through potential matches for your job</p>
        </div>

        <div className="relative">
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              {currentVA && (
                <div className="card">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold">{currentVA.name}</h2>
                    <span className="text-sm text-gray-500">{currentVA.country}</span>
                  </div>

                  <div className="mb-4">
                    <span className="text-2xl font-bold text-primary-600">
                      ${currentVA.hourlyRate}/hr
                    </span>
                  </div>

                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentVA.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-sm ${
                        currentVA.availability
                          ? "bg-success-100 text-success-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {currentVA.availability ? "Available" : "Not Available"}
                    </span>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => handleVote(false)}
                      disabled={voteMutation.isPending}
                      className="flex-1 btn-danger flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Skip
                    </button>
                    <button
                      onClick={() => handleVote(true)}
                      disabled={voteMutation.isPending}
                      className="flex-1 btn-success flex items-center justify-center gap-2"
                    >
                      <Heart className="w-4 h-4" />
                      Like
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="btn-secondary flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <span className="text-sm text-gray-500">
              {currentIndex + 1} of {recommendations.length}
            </span>

            <button
              onClick={() => setCurrentIndex(Math.min(recommendations.length - 1, currentIndex + 1))}
              disabled={currentIndex === recommendations.length - 1}
              className="btn-secondary flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
      </>
  );
}
