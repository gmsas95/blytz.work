'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { jobPostingSchema, JobPosting } from '@/lib/validation';

export default function NewJobPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JobPosting>({
    resolver: zodResolver(jobPostingSchema),
    defaultValues: {
      title: '',
      description: '',
      rateRange: '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: JobPosting) => {
      const response = await api.post('/company/jobs', data);
      return response.data;
    },
    onSuccess: () => {
      router.push('/company/jobs');
    },
  });

  const onSubmit = (data: JobPosting) => {
    setIsSubmitting(true);
    mutation.mutate(data);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="card">
        <h1 className="text-2xl font-bold mb-6">Create Job Posting</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="title" className="label">
              Job Title
            </label>
            <input
              {...register('title')}
              type="text"
              className="input"
              placeholder="e.g. Executive Assistant, Social Media Manager"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-danger-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="rateRange" className="label">
              Rate Range
            </label>
            <input
              {...register('rateRange')}
              type="text"
              className="input"
              placeholder="e.g. $20-30/hour, $1000-1500/month"
            />
            {errors.rateRange && (
              <p className="mt-1 text-sm text-danger-600">{errors.rateRange.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="label">
              Job Description
            </label>
            <textarea
              {...register('description')}
              rows={8}
              className="input min-h-[200px]"
              placeholder="Describe the role, responsibilities, requirements, and what you're looking for in a VA..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-danger-600">{errors.description.message}</p>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting || mutation.isPending}
              className="btn-primary"
            >
              {isSubmitting || mutation.isPending
                ? 'Creating...'
                : 'Create Job Posting'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}