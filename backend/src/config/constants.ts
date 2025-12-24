/**
 * Centralized constants configuration for BlytzWork backend
 */

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  MIN_PAGE: 1,
} as const;

// Platform fees
export const PLATFORM_FEES = {
  DEFAULT_PERCENTAGE: 0.1, // 10%
  STRIPE_PERCENTAGE: 0.029, // 2.9%
  STRIPE_FIXED_FEE: 0.30, // $0.30
  NET_PERCENTAGE: 0.071, // 7.1% net (10% - 2.9%)
} as const;

// File upload limits (in bytes)
export const FILE_UPLOAD = {
  MAX_VA_PORTFOLIO: 100 * 1024 * 1024, // 100MB
  MAX_VA_RESUME: 10 * 1024 * 1024, // 10MB
  MAX_VA_VIDEO: 500 * 1024 * 1024, // 500MB
  MAX_COMPANY_LOGO: 5 * 1024 * 1024, // 5MB
  MAX_PROFILE_PICTURE: 5 * 1024 * 1024, // 5MB
  MAX_GENERAL: 500 * 1024 * 1024, // 500MB default
  PRESIGNED_URL_EXPIRY: 3600, // 1 hour in seconds
} as const;

// Chat limits
export const CHAT = {
  MAX_MESSAGE_LENGTH: 10000,
  DEFAULT_MESSAGE_LIMIT: 50,
  MAX_MESSAGES_PER_REQUEST: 100,
} as const;

// Rating scales
export const RATING = {
  MIN: 1,
  MAX: 5,
  DEFAULT: 5,
} as const;

// Job posting limits
export const JOB_POSTING = {
  MIN_TITLE_LENGTH: 5,
  MAX_TITLE_LENGTH: 200,
  MIN_DESCRIPTION_LENGTH: 10,
  MAX_DESCRIPTION_LENGTH: 5000,
  MAX_SKILLS: 20,
  MAX_TAGS: 20,
  MAX_BUDGET: 1000000, // $1,000,000
  MAX_HOURLY_RATE: 500,
} as const;

// Payment limits
export const PAYMENT = {
  MIN_AMOUNT: 1, // $1
  MAX_AMOUNT: 1000000, // $1,000,000
  CURRENCY: 'USD',
} as const;

// Proposal limits
export const PROPOSAL = {
  MIN_COVER_LETTER_LENGTH: 10,
  MAX_COVER_LETTER_LENGTH: 5000,
  MAX_ATTACHMENTS: 10,
} as const;

// Rate limiting
export const RATE_LIMIT = {
  DEFAULT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  DEFAULT_MAX_REQUESTS: 100,
} as const;

// User roles
export const USER_ROLES = {
  COMPANY: 'company',
  VA: 'va',
  ADMIN: 'admin',
} as const;

// Contract statuses
export const CONTRACT_STATUS = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

// Payment statuses
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

// Job types
export const JOB_TYPES = {
  FIXED: 'fixed',
  HOURLY: 'hourly',
} as const;

// Experience levels
export const EXPERIENCE_LEVELS = {
  ENTRY: 'entry',
  MID: 'mid',
  SENIOR: 'senior',
  EXECUTIVE: 'executive',
} as const;

// Employment types
export const EMPLOYMENT_TYPES = {
  FULLTIME: 'fulltime',
  PARTTIME: 'parttime',
  CONTRACT: 'contract',
  FREELANCE: 'freelance',
} as const;

// Urgency levels
export const URGENCY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

// Validation limits
export const VALIDATION = {
  MAX_STRING_LENGTH: 5000,
  MAX_URL_LENGTH: 2048,
  MAX_EMAIL_LENGTH: 255,
  MAX_PHONE_LENGTH: 50,
} as const;

// Time zones
export const COMMON_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'America/Chicago',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Singapore',
  'Australia/Sydney',
] as const;

// Notification types
export const NOTIFICATION_TYPES = {
  PAYMENT_RECEIVED: 'payment_received',
  PAYMENT_SENT: 'payment_sent',
  REFUND_PROCESSED: 'refund_processed',
  INVOICE_CREATED: 'invoice_created',
  CHAT_MESSAGE: 'chat_message',
  PROPOSAL_RECEIVED: 'proposal_received',
  PROPOSAL_ACCEPTED: 'proposal_accepted',
  PROPOSAL_REJECTED: 'proposal_rejected',
  CONTRACT_STARTED: 'contract_started',
  CONTRACT_COMPLETED: 'contract_completed',
  REVIEW_RECEIVED: 'review_received',
} as const;

// Analytics time periods
export const ANALYTICS_PERIODS = {
  DAY: 1,
  WEEK: 7,
  MONTH: 30,
  QUARTER: 90,
  YEAR: 365,
} as const;

// Error codes
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
} as const;

// API response codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Feature flags
export const FEATURES = {
  ENABLE_MATCHING: false,
  ENABLE_ANALYTICS: true,
  ENABLE_WEBSOCKET: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_REVIEWS: true,
  ENABLE_MILESTONES: true,
  ENABLE_TIMESHEETS: true,
} as const;

// Cloudflare R2 configuration
export const R2 = {
  REGION: 'auto',
  PRESIGNED_URL_EXPIRY: 3600, // 1 hour
} as const;
