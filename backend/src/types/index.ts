// TypeScript type definitions for BlytzWork backend

export type UserRole = 'company' | 'va' | 'admin';

export type UserStatus = 'active' | 'suspended' | 'deleted';

export interface AuthenticatedUser {
  uid: string;
  email: string;
  role: UserRole;
  profileComplete: boolean;
}

export interface FirebaseUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  displayName?: string;
  photoURL?: string;
}

// Enhanced Fastify Request type
export interface AuthenticatedRequest {
  user: AuthenticatedUser;
}

// Database Models interfaces
export interface User {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  profileComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface VAProfile {
  id: string;
  userId: string;
  name: string;
  country: string;
  bio: string;
  skills: string[];
  hourlyRate?: number;
  earnedAmount?: number;
  completedJobs?: number;
  averageRating?: number;
  totalReviews?: number;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Company {
  id: string;
  userId: string;
  name: string;
  bio: string;
  country: string;
  website?: string;
  industry: string;
  logoUrl?: string;
  verificationLevel: 'basic' | 'professional' | 'premium';
  backgroundCheckPassed: boolean;
  featuredCompany: boolean;
  totalSpent?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobPosting {
  id: string;
  companyId: string;
  title: string;
  description: string;
  category?: string;
  jobType: 'fixed' | 'hourly';
  budget?: number;
  rateRange?: string;
  status: 'open' | 'closed' | 'in_progress' | 'completed';
  skillsRequired: string[];
  tags?: string[];
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'executive';
  employmentType?: 'fulltime' | 'parttime' | 'contract' | 'freelance';
  duration?: string;
  urgency: 'low' | 'medium' | 'high';
  remote: boolean;
  location?: string;
  views: number;
  proposalCount?: number;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Proposal {
  id: string;
  jobPostingId: string;
  vaProfileId: string;
  coverLetter: string;
  bidAmount: number;
  bidType: 'fixed' | 'hourly';
  hourlyRate?: number;
  estimatedHours?: number;
  deliveryTime: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Contract {
  id: string;
  jobId: string;
  jobPostingId: string;
  vaProfileId: string;
  companyId: string;
  proposalId?: string;
  contractType: 'fixed' | 'hourly';
  amount: number;
  hourlyRate?: number;
  currency: string;
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  terms?: any;
  paymentSchedule: string;
  totalPaid?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Milestone {
  id: string;
  contractId: string;
  jobId: string;
  title: string;
  description?: string;
  amount: number;
  status: 'pending' | 'in_progress' | 'completed' | 'approved';
  dueDate?: Date;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Timesheet {
  id: string;
  contractId: string;
  jobId: string;
  vaProfileId: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  totalHours: number;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedAt?: Date;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  jobId?: string;
  contractId?: string;
  milestoneId?: string;
  userId: string;
  receiverId: string;
  stripePaymentIntentId: string;
  amount: number;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  stripeFee: number;
  platformFee: number;
  method: 'card' | 'bank' | 'crypto';
  type: 'payment' | 'refund' | 'payout';
  metadata?: any;
  refundAmount?: number;
  refundedAt?: Date;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  priority?: 'low' | 'normal' | 'high';
  createdAt: Date;
}

export interface Invoice {
  id: string;
  contractId: string;
  userId: string;
  receiverId: string;
  invoiceNumber: string;
  items: any[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  totalAmount: number;
  dueDate: Date;
  currency: string;
  notes?: string;
  status: 'pending' | 'paid' | 'overdue';
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  contractId: string;
  fromUserId: string;
  toUserId: string;
  rating: number;
  comment?: string;
  skillsRating?: number;
  communicationRating?: number;
  qualityRating?: number;
  professionalismRating?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PortfolioItem {
  id: string;
  vaProfileId: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  category?: string;
  technologies?: string[];
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  recipientId: string;
  content: string;
  type: 'text' | 'image' | 'file';
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  timestamp: Date;
}

export interface AnalyticsData {
  views?: number;
  matches?: number;
  hires?: number;
  conversionRate?: number;
  averageTimeToHire?: number;
  costPerHire?: number;
  averageRating?: number;
  responseRate?: number;
  satisfactionScore?: number;
  trends?: Array<{
    date: string;
    views?: number;
    matches?: number;
    hires?: number;
    jobs?: number;
  }>;
}

// API Response interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  statusCode?: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// Query parameter interfaces
export interface JobMarketplaceQuery {
  page?: string;
  limit?: string;
  search?: string;
  category?: string;
  jobType?: string;
  experienceLevel?: string;
  skills?: string;
  budgetRange?: string;
  duration?: string;
  urgent?: string;
  featured?: string;
  status?: string;
}

export interface PaymentHistoryQuery {
  type?: 'sent' | 'received' | 'all';
  status?: string;
  page?: string;
  limit?: string;
  startDate?: string;
  endDate?: string;
}

export interface ContractsQuery {
  type?: 'active' | 'completed';
  page?: string;
  limit?: string;
}

// Stripe interfaces
export interface StripePaymentIntentData {
  matchId?: string;
  payerId: string;
  receiverId: string;
  contractId?: string;
  milestoneId?: string;
  jobId?: string;
  type?: string;
}

export interface StripeRefundData {
  paymentIntentId: string;
  amount?: number;
  reason?: string;
}

// Upload interfaces
export interface UploadRequestData {
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadType: 'va_portfolio' | 'va_resume' | 'va_video' | 'company_logo' | 'profile_picture';
  category?: string;
  description?: string;
}

export interface UploadConfirmData {
  key: string;
  bucket: string;
  etag: string;
}

export interface FileUploadData {
  presignedUrl: string;
  fileKey: string;
  fileUrl: string;
  expiresIn: number;
  maxSize: number;
}

export type UploadType = 'va_portfolio' | 'va_resume' | 'va_video' | 'company_logo' | 'profile_picture';

// WebSocket interfaces
export interface SocketUser {
  userId: string;
  email: string;
  role: UserRole;
}

export interface SocketMessage {
  recipientId: string;
  content: string;
}

export interface SocketMessageData {
  senderId: string;
  senderName: string;
  senderRole: string;
  timestamp: string;
}
