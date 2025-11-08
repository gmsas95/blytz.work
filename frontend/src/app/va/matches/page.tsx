'use client';

import { useQuery } from '@tanstack/react-query';
import { User, Mail, Phone, Calendar } from 'lucide-react';
import api from '@/lib/api';
import { Match } from '@/types';

export default function VAMatchesPage() {
  const { data: matches, isLoading } = useQuery({
    queryKey: ['vaMatches'],
    queryFn: async () => {
      const response = await api.get('/matches');
      return response.data as Match[];
    },
  });

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading matches...</div>;
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Matches Yet</h1>
          <p className="text-gray-600">
            Complete your profile and wait for companies to discover you!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Matches</h1>
        <p className="text-gray-600 mt-2">
          Companies that are interested in working with you
        </p>
      </div>

      <div className="grid gap-6">
        {matches.map((match) => (
          <div key={match.id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {match.jobPosting?.company?.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {match.jobPosting?.company?.country}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {match.contactUnlocked ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-success-100 text-success-700">
                        Contact Exchanged
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                        Pending Payment
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium mb-2">{match.jobPosting?.title}</h4>
                  <p className="text-gray-600 text-sm mb-2">
                    {match.jobPosting?.description}
                  </p>
                  <p className="text-primary-600 font-medium text-sm">
                    {match.jobPosting?.rateRange}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Matched {new Date(match.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {match.contactUnlocked && (
                  <div className="bg-success-50 border border-success-200 rounded-lg p-4">
                    <h4 className="font-medium text-success-800 mb-2">Company Contact</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Company:</strong> {match.jobPosting?.company?.name}</p>
                      <p><strong>Email:</strong> {match.jobPosting?.company?.email}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}