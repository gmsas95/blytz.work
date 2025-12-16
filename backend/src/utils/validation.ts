import { ZodType, z } from "zod";

export const createVAProfileSchema = z.object({
  name: z.string().min(2).max(100),
  country: z.string().min(2).max(50),
  hourlyRate: z.number().min(1).max(200),
  skills: z.array(z.string()).min(1),
  availability: z.boolean().default(true),
});

export const updateVAProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  country: z.string().min(2).max(50).optional(),
  hourlyRate: z.number().min(1).max(200).optional(),
  skills: z.array(z.string()).optional(),
  availability: z.boolean().optional(),
});

export const createCompanySchema = z.object({
  name: z.string().min(2).max(100),
  country: z.string().min(2).max(50),
});

export const createJobPostingSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20).max(2000),
  rateRange: z.string().min(3).max(50),
});

export const voteSchema = z.object({
  jobPostingId: z.string().cuid(),
  vaProfileId: z.string().cuid(),
  vote: z.boolean(),
});

export const createPaymentIntentSchema = z.object({
  matchId: z.string().cuid(),
});

export const confirmPaymentSchema = z.object({
  paymentIntentId: z.string(),
});

export type CreateVAProfile = z.infer<typeof createVAProfileSchema>;
export type UpdateVAProfile = z.infer<typeof updateVAProfileSchema>;
export type CreateCompany = z.infer<typeof createCompanySchema>;
export type CreateJobPosting = z.infer<typeof createJobPostingSchema>;
export type Vote = z.infer<typeof voteSchema>;
export type CreatePaymentIntent = z.infer<typeof createPaymentIntentSchema>;
export type ConfirmPayment = z.infer<typeof confirmPaymentSchema>;