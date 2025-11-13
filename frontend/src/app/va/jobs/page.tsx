'use client';

import { useQuery } from '@tanstack/react-query';
import { Briefcase, MapPin, DollarSign, Calendar, ExternalLink } from 'lucide-react';
import api from '@/lib/api';
import { JobPosting } from '@/types';
import { AlertContainer, useAlert } from '@/components/ui/Alert';

export default function VAJobsPage() {
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['vaJobs'],
    queryFn: async () => {
      const response = await api.get('/jobs/relevant');
      return response.data as JobPosting[];
    },
  });

  const { addAlert } = useAlert();

  if (isLoading) {
    return (
      <>
        <AlertContainer />
        <div className="flex justify-center py-8">Loading jobs...</div>
      </>
    );
  }

  return (
    <>
      <AlertContainer />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto py-8 px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Jobs For You</h1>
            <p className="text-gray-600">Discover job opportunities that match your skills and experience</p>
          </div>

          {/* Jobs Grid */}
          {jobs && jobs.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <div key={job.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
                      {job.company && (
                        <p className="text-sm text-gray-600">{job.company.name}</p>
                      )}
                    </div>
                    {job.featured && (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Job Details */}
                  <div className="space-y-2 mb-4">
                    {job.rateRange && (
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {job.rateRange}
                      </div>
                    )}
                    {job.location && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        {job.location}
                      </div>
                    )}
                    {job.duration && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        {job.duration}
                      </div>
                    )}
                  </div>

                  {/* Skills */}
                  {job.skillsRequired && job.skillsRequired.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {job.skillsRequired.slice(0, 3).map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skillsRequired.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{job.skillsRequired.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => window.open(`/jobs/marketplace?id=${job.id}`, '_blank')}
                      className="flex-1 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700"
                    >
                      View Details
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded">
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-500">
                Check back later for new opportunities that match your profile
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}