export interface User {
  uid: string;
  email: string;
  role: 'va' | 'company';
  createdAt: string;
}

export interface VAProfile {
  id: string;
  userId: string;
  name: string;
  country: string;
  hourlyRate: number;
  skills: string[];
  availability: boolean;
  email?: string;
  phone?: string;
  user?: User;
}

export interface Company {
  id: string;
  userId: string;
  name: string;
  country: string;
  email?: string;
  user?: User;
  jobPostings?: JobPosting[];
}

export interface JobPosting {
  id: string;
  companyId: string;
  title: string;
  description: string;
  rateRange: string;
  budget?: number;
  location?: string;
  remote: boolean;
  category?: string;
  tags: string[];
  experienceLevel?: string;
  jobType?: string;
  duration?: string;
  urgency?: string;
  skillsRequired: string[];
  status: string;
  createdAt: string;
  views: number;
  proposalCount: number;
  featured: boolean;
  isActive: boolean;
  company?: Company;
}

export interface Match {
  id: string;
  jobPostingId: string;
  vaProfileId: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  contactUnlocked: boolean;
  createdAt: string;
  jobPosting?: JobPosting;
  vaProfile?: VAProfile;
}

export interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

export interface ContactInfo {
  vaEmail: string;
  vaPhone?: string;
  companyEmail: string;
  unlockedAt: string;
}