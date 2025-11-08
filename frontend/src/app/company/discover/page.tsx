'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, X, Heart } from 'lucide-react';
import api from '@/lib/api';
import { VAProfile as VAProfileType, JobPosting } from '@/types';

export default function DiscoverPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [jobId, setJobId] = useState<string>('');

  const { data: jobs } = useQuery({
    queryKey: ['companyJobs'],
    queryFn: async () => {
      const response = await api.get('/company/jobs');
      return response.data as JobPosting[];
    },
  });

  const { data: recommendations, refetch } = useQuery({
    queryKey: ['recommendations', jobId],
    queryFn: async () => {
      if (!jobId) return [];
      const response = await api.get(`/matches/discover?jobPostingId=${jobId}`);
      return response.data as VAProfileType[];
    },
    enabled: !!jobId,
  });

  const voteMutation = useMutation({
    mutationFn: async ({ vaProfileId, vote }: { vaProfileId: string; vote: boolean }) => {
      const response = await api.post('/matches/vote', {
        jobPostingId: jobId,
        vaProfileId,
        vote,
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.match) {
        alert('🎉 It\'s a match! Payment required to unlock contact information.');
      }
      // Move to next profile
      setCurrentIndex((prev) => prev + 1);
    },
  });

  const handleVote = (vote: boolean) => {
    if (!recommendations || currentIndex >= recommendations.length) return;

    const currentVA = recommendations[currentIndex];
    voteMutation.mutate({
      vaProfileId: currentVA.id,
      vote,
    });
  };

  const currentVA = recommendations?.[currentIndex];

  if (!jobs || jobs.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Job Postings</h1>
          <p className="text-gray-600">Create a job posting to start discovering VAs.</p>
        </div>
      </div>
    );
  }

  if (!jobId) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Select a Job Posting</h1>
        <div className="grid gap-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              onClick={() => setJobId(job.id)}
              className="card cursor-pointer hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-lg">{job.title}</h3>
              <p className="text-gray-600 mt-2">{job.description}</p>
              <p className="text-primary-600 font-medium mt-2">{job.rateRange}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No More VAs</h1>
          <p className="text-gray-600">You've seen all available VAs for this job.</p>
          <button
            onClick={() => {
              setJobId('');
              setCurrentIndex(0);
            }}
            className="btn-primary mt-4"
          >
            Choose Different Job
          </button>
        </div>
      </div>
    );
  }

  if (currentIndex >= recommendations.length) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">All Caught Up!</h1>
          <p className="text-gray-600">You've reviewed all available VAs for this job.</p>
          <button
            onClick={() => {
              setJobId('');
              setCurrentIndex(0);
            }}
            className="btn-primary mt-4"
          >
            Choose Different Job
          </button>
        </div>
      </div>
    );
  }

  return (
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
                        ? 'bg-success-100 text-success-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {currentVA.availability ? 'Available' : 'Not Available'}
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
      </div>
    </div>
  );
}