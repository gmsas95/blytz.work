'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import api from '@/lib/api';
import { vaProfileSchema, VAProfile } from '@/lib/validation';
import { VAProfile as VAProfileType } from '@/types';

export default function VAProfilePage() {
  const router = useRouter();
  const user = auth.currentUser;
  const [skills, setSkills] = useState<string[]>([]);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['vaProfile'],
    queryFn: async () => {
      const response = await api.get('/va/profile');
      return response.data as VAProfileType;
    },
    enabled: !!user,
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<VAProfile>({
    resolver: zodResolver(vaProfileSchema),
    defaultValues: profile || {
      name: '',
      country: '',
      hourlyRate: 25,
      skills: [],
      availability: true,
    },
  });

  useEffect(() => {
    if (profile) {
      setValue('name', profile.name);
      setValue('country', profile.country);
      setValue('hourlyRate', profile.hourlyRate);
      setValue('skills', profile.skills);
      setValue('availability', profile.availability);
      setSkills(profile.skills);
    }
  }, [profile, setValue]);

  const createMutation = useMutation({
    mutationFn: async (data: VAProfile) => {
      const response = await api.post('/va/profile', data);
      return response.data;
    },
    onSuccess: () => {
      router.push('/va/matches');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: VAProfile) => {
      const response = await api.put('/va/profile', data);
      return response.data;
    },
    onSuccess: () => {
      router.push('/va/matches');
    },
  });

  const onSubmit = (data: VAProfile) => {
    const mutation = profile ? updateMutation : createMutation;
    mutation.mutate({ ...data, skills });
  };

  const addSkill = () => {
    const skillInput = document.getElementById('skill-input') as HTMLInputElement;
    const skill = skillInput.value.trim();
    
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill]);
      setValue('skills', [...skills, skill]);
      skillInput.value = '';
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const newSkills = skills.filter(skill => skill !== skillToRemove);
    setSkills(newSkills);
    setValue('skills', newSkills);
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="card">
        <h1 className="text-2xl font-bold mb-6">
          {profile ? 'Update Your Profile' : 'Create Your VA Profile'}
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="label">
                Full Name
              </label>
              <input
                {...register('name')}
                type="text"
                className="input"
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-danger-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="country" className="label">
                Country
              </label>
              <input
                {...register('country')}
                type="text"
                className="input"
                placeholder="United States"
              />
              {errors.country && (
                <p className="mt-1 text-sm text-danger-600">{errors.country.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="hourlyRate" className="label">
              Hourly Rate ($)
            </label>
            <input
              {...register('hourlyRate', { valueAsNumber: true })}
              type="number"
              className="input"
              placeholder="25"
            />
            {errors.hourlyRate && (
              <p className="mt-1 text-sm text-danger-600">{errors.hourlyRate.message}</p>
              )}
          </div>

          <div>
            <label className="label">Skills</label>
            <div className="flex gap-2 mb-2">
              <input
                id="skill-input"
                type="text"
                className="input"
                placeholder="Add a skill"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill();
                  }
                }}
              />
              <button
                type="button"
                onClick={addSkill}
                className="btn-secondary"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-700"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="ml-1 text-primary-500 hover:text-primary-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            {errors.skills && (
              <p className="mt-1 text-sm text-danger-600">{errors.skills.message}</p>
            )}
          </div>

          <div className="flex items-center">
            <input
              {...register('availability')}
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="availability" className="ml-2 block text-sm text-gray-900">
              I am available for work
            </label>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="btn-primary"
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : profile
                ? 'Update Profile'
                : 'Create Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}