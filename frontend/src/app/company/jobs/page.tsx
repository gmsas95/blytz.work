'use client';

import { useQuery } from '@tanstack/react-query';
import { Briefcase, MapPin, DollarSign, Calendar } from 'lucide-react';
import api from '@/lib/api';
import { JobPosting } from '@/types';

export default function JobsPage() {
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['companyJobs'],
    queryFn: async () => {
      const response = await api.get('/company/jobs');
      return response.data as JobPosting[];
    },
  });

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Postings</h1>
          <p className="text-gray-600 mt-2">
            Manage your job postings and find matches
          </p>
        </div>
        <a
          href="/company/jobs/new"
          className="btn-primary"
        >
          Post New Job
        </a>
      </div>

      {!jobs || jobs.length === 0 ? (
        <div className="text-center py-12">
          <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No job postings yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first job posting to start connecting with talented VAs
          </p>
          <a href="/company/jobs/new" className="btn-primary">
            Create Job Posting
          </a>
        </div>
      ) : (
        <div className="grid gap-6">
          {jobs.map((job) => (
            <div key={job.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold">{job.title}</h3>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        job.isActive
                          ? 'bg-success-100 text-success-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {job.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {job.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span>{job.rateRange}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{job.company?.country}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Posted {new Date(job.createdAt || '').toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <a
                    href={`/company/discover?jobId=${job.id}`}
                    className="btn-primary"
                  >
                    Find VAs
                  </a>
                  <a
                    href={`/company/jobs/${job.id}/edit`}
                    className="btn-secondary"
                  >
                    Edit
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}