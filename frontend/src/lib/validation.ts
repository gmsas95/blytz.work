import { z } from 'zod';

export const vaProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  country: z.string().min(2, 'Country is required'),
  hourlyRate: z.number().min(1, 'Hourly rate must be at least $1').max(200, 'Hourly rate must be less than $200'),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  availability: z.boolean().default(true),
});

export const companySchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  country: z.string().min(2, 'Country is required'),
});

export const jobPostingSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  rateRange: z.string().min(3, 'Rate range is required'),
});

export type VAProfile = z.infer<typeof vaProfileSchema>;
export type Company = z.infer<typeof companySchema>;
export type JobPosting = z.infer<typeof jobPostingSchema>;