import { z } from 'zod';

// Pagination validation
export const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).refine(n => n >= 1, 'Page must be at least 1').default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).refine(n => n >= 1 && n <= 100, 'Limit must be between 1 and 100').default('20'),
});

// Job Marketplace query validation
export const jobMarketplaceQuerySchema = paginationSchema.extend({
  search: z.string().max(100).optional(),
  category: z.string().max(50).optional(),
  jobType: z.enum(['fixed', 'hourly']).optional(),
  experienceLevel: z.enum(['entry', 'mid', 'senior', 'executive']).optional(),
  skills: z.string().max(500).optional(),
  budgetRange: z.string().max(50).regex(/^\d+-\d+$/).optional(),
  duration: z.string().max(50).optional(),
  urgent: z.enum(['true', 'false']).optional(),
  featured: z.enum(['true', 'false']).optional(),
  status: z.enum(['open', 'closed', 'in_progress', 'completed']).default('open'),
});

// Payment history query validation
export const paymentHistoryQuerySchema = paginationSchema.extend({
  type: z.enum(['sent', 'received', 'all']).default('all'),
  status: z.string().max(50).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// Contracts query validation
export const contractsQuerySchema = paginationSchema.extend({
  type: z.enum(['active', 'completed']).default('active'),
});

// VA profile validation
export const vaProfileSchema = z.object({
  name: z.string().min(2).max(100),
  country: z.string().min(2).max(100),
  bio: z.string().min(20).max(2000),
  skills: z.array(z.string().min(1).max(50)).min(1).max(50),
  hourlyRate: z.number().min(1).max(500).optional(),
  availability: z.enum(['fulltime', 'parttime', 'project', 'negotiable']).optional(),
  timeZone: z.string().max(50).optional(),
  languages: z.array(z.object({
    language: z.string().min(1).max(50),
    proficiency: z.enum(['basic', 'intermediate', 'advanced', 'native'])
  })).max(10).optional(),
  education: z.array(z.object({
    degree: z.string().min(1).max(100),
    institution: z.string().min(1).max(200),
    year: z.number().min(1900).max(new Date().getFullYear()),
  })).max(5).optional(),
  experience: z.array(z.object({
    title: z.string().min(1).max(200),
    company: z.string().min(1).max(200),
    startDate: z.string().datetime(),
    endDate: z.string().datetime().optional(),
    description: z.string().max(1000).optional(),
  })).max(10).optional(),
  portfolio: z.array(z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(1000).optional(),
    fileUrl: z.string().url(),
    fileType: z.string(),
    category: z.string().max(50).optional(),
  })).max(20).optional(),
  videoIntroduction: z.string().url().optional(),
  resumeUrl: z.string().url().optional(),
});

// Company profile validation
export const companyProfileSchema = z.object({
  name: z.string().min(2).max(200),
  bio: z.string().min(10).max(2000),
  country: z.string().min(2).max(100),
  website: z.string().url().optional(),
  industry: z.string().min(2).max(100),
  companySize: z.enum(["1-10", "11-50", "51-200", "201+"]).optional(),
  foundedYear: z.number().min(1800).max(new Date().getFullYear()).optional(),
  description: z.string().min(20).max(2000).optional(),
  mission: z.string().min(10).max(500).optional(),
  values: z.array(z.string().max(100)).max(10).optional(),
  benefits: z.array(z.string().max(200)).max(10).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(50).optional(),
  socialLinks: z.object({
    linkedin: z.string().url().optional(),
    twitter: z.string().url().optional(),
    facebook: z.string().url().optional(),
    instagram: z.string().url().optional(),
    youtube: z.string().url().optional()
  }).optional(),
  techStack: z.array(z.string().max(50)).max(50).optional()
});

// Job posting validation
export const jobPostingSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(10).max(5000),
  requirements: z.array(z.string().min(1).max(500)).max(20).optional(),
  responsibilities: z.array(z.string().min(1).max(500)).max(20).optional(),
  benefits: z.array(z.string().min(1).max(300)).max(20).optional(),
  rateRange: z.string().min(1).max(100),
  budget: z.number().min(0).max(1000000).optional(),
  location: z.string().max(200).optional(),
  remote: z.boolean().default(true),
  category: z.string().max(50).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  experienceLevel: z.enum(["entry", "mid", "senior", "executive"]).optional(),
  employmentType: z.enum(["fulltime", "parttime", "contract", "freelance"]).optional(),
  jobType: z.enum(["fixed", "hourly"]).default("fixed"),
  duration: z.string().max(100).optional(),
  urgency: z.enum(["low", "medium", "high"]).default("medium"),
  skillsRequired: z.array(z.string().min(1).max(50)).min(1).max(20),
  toolsUsed: z.array(z.any()).max(20).optional(),
  teamSize: z.number().min(1).max(100).optional(),
  reportingTo: z.string().max(200).optional(),
  travelRequired: z.string().max(200).optional(),
  workSchedule: z.array(z.any()).max(7).optional(),
  featured: z.boolean().default(false)
});

// Proposal validation
export const proposalSchema = z.object({
  jobPostingId: z.string().uuid(),
  coverLetter: z.string().min(10).max(5000),
  bidAmount: z.number().min(1).max(1000000),
  bidType: z.enum(["fixed", "hourly"]).default("fixed"),
  hourlyRate: z.number().min(1).max(500).optional(),
  estimatedHours: z.number().min(1).max(1000).optional(),
  deliveryTime: z.string().min(1).max(200),
  attachments: z.array(z.any()).max(10).optional()
});

// Payment validation
export const paymentSchema = z.object({
  jobId: z.string().uuid().optional(),
  contractId: z.string().uuid().optional(),
  milestoneId: z.string().uuid().optional(),
  receiverId: z.string().uuid(),
  amount: z.number().min(1).max(1000000),
  method: z.enum(["card", "bank", "crypto"]).default("card"),
  type: z.enum(["payment", "refund", "payout"]).default("payment"),
  metadata: z.any().optional()
});

// Invoice validation
export const invoiceSchema = z.object({
  contractId: z.string().uuid(),
  items: z.array(z.object({
    id: z.string(),
    description: z.string().min(1),
    quantity: z.number().min(1),
    amount: z.number().min(0)
  })).min(1),
  dueDate: z.string().datetime(),
  currency: z.string().default("USD"),
  taxRate: z.number().min(0).max(100).default(0),
  discount: z.number().min(0).default(0),
  notes: z.string().max(2000).optional()
});

// Dispute validation
export const disputeSchema = z.object({
  paymentId: z.string().uuid(),
  type: z.enum(["refund", "escalate", "resolve"]),
  reason: z.string().min(10).max(2000),
  description: z.string().max(5000).optional(),
  resolution: z.string().max(2000).optional(),
  amount: z.number().min(1).max(1000000).optional()
});

// Upload validation
export const uploadRequestSchema = z.object({
  fileName: z.string().min(1).max(255).regex(/^[a-zA-Z0-9._-]+$/, 'File name contains invalid characters'),
  fileType: z.string().min(1).max(100),
  fileSize: z.number().min(1).max(500 * 1024 * 1024), // Max 500MB
  uploadType: z.enum(['va_portfolio', 'va_resume', 'va_video', 'company_logo', 'profile_picture']),
  category: z.string().max(50).optional(),
  description: z.string().max(500).optional()
});

// Chat message validation
export const chatMessageSchema = z.object({
  recipientId: z.string().uuid(),
  content: z.string().min(1).max(10000),
  type: z.enum(['text', 'image', 'file']).default('text')
});

// Contract validation
export const contractSchema = z.object({
  proposalId: z.string().uuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  contractTerms: z.any().optional()
});

// Milestone validation
export const milestoneSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  amount: z.number().min(0).max(1000000),
  dueDate: z.string().datetime().optional()
});

// Timesheet validation
export const timesheetSchema = z.object({
  date: z.string().datetime(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  description: z.string().max(500).optional()
});
