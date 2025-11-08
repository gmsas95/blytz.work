'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { loadStripe } from '@stripe/stripe-js';
import { CreditCard, Lock, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import { Match } from '@/types';
import { useAlert } from '@/components/ui/Alert';
import { Alert } from '@/components/ui/Alert';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function MatchesPage() {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const { addAlert, AlertContainer } = useAlert();

  const { data: matches, isLoading, error } = useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      const response = await api.get('/matches');
      return response.data as Match[];
    },
  });

  const paymentMutation = useMutation({
    mutationFn: async (matchId: string) => {
      const response = await api.post('/payments/create-intent', { matchId });
      return response.data;
    },
  });

  const handlePayment = async (match: Match) => {
    if (!match.paymentStatus || match.paymentStatus === 'paid') {
      addAlert('warning', 'Contact information already unlocked!');
      return;
    }

    setProcessingPayment(true);
    setSelectedMatch(match);

    try {
      const { clientSecret } = await paymentMutation.mutateAsync(match.id);
      
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error } = await stripe.confirmPayment({
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/matches?payment=success`,
        },
      });

      if (error) {
        addAlert('error', `Payment failed: ${error.message}`);
      } else {
        addAlert('success', 'Payment successful! Contact information unlocked.');
        // Refresh matches after successful payment
        setTimeout(() => window.location.reload(), 2000);
      }
    } catch (error) {
      addAlert('error', 'Payment processing failed. Please try again.');
    } finally {
      setProcessingPayment(false);
      setSelectedMatch(null);
    }
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Alert type="error">
          Failed to load matches. Please refresh the page and try again.
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading matches...</div>;
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Matches Yet</h1>
          <p className="text-gray-600">Start discovering VAs to find your perfect match!</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AlertContainer />
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Matches</h1>
          <p className="text-gray-600 mt-2">
            Mutual matches that can lead to great collaborations
          </p>
        </div>

        <div className="grid gap-6">
          {matches?.map((match) => (
            <div key={match.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {match.vaProfile?.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {match.vaProfile?.country} • ${match.vaProfile?.hourlyRate}/hr
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {match.paymentStatus === 'paid' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-success-100 text-success-700">
                          <CheckCircle className="w-4 h-4" />
                          Contact Unlocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                          <Lock className="w-4 h-4" />
                          Payment Required
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Job: {match.jobPosting?.title}</h4>
                    <p className="text-gray-600 text-sm">{match.jobPosting?.description}</p>
                    <p className="text-primary-600 font-medium text-sm mt-1">
                      {match.jobPosting?.rateRange}
                    </p>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {match.vaProfile?.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {match.contactUnlocked && (
                    <div className="bg-success-50 border border-success-200 rounded-lg p-4">
                      <h4 className="font-medium text-success-800 mb-2">Contact Information</h4>
                      <div className="space-y-1 text-sm">
                        <p><strong>VA Email:</strong> {match.vaProfile?.email}</p>
                        {match.vaProfile?.phone && (
                          <p><strong>VA Phone:</strong> {match.vaProfile.phone}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="ml-4">
                  {match.paymentStatus !== 'paid' && (
                    <button
                      onClick={() => handlePayment(match)}
                      disabled={processingPayment || paymentMutation.isPending}
                      className="btn-primary flex items-center gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      Unlock Contact - {process.env.NEXT_PUBLIC_PAYMENT_AMOUNT || '$29.99'}
                    </button>
                  )}
                </div>
              </div>

              {selectedMatch?.id === match.id && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    Processing payment... Please wait.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}