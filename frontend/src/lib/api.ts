// Complete API Client with All New Endpoints
import axios, { AxiosInstance, AxiosError } from 'axios';

// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.blytz.app'
  : 'http://localhost:3010';

// Create axios instance
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor - Add mock token for development
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token') || 'mock-dev-token';
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Handle 401 unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      if (typeof window !== 'undefined') {
        window.location.href = '/auth';
      }
    }

    return Promise.reject(error);
  }
);

// API Error Handler
export class APIError extends Error {
  constructor(
    public message: string,
    public code?: string,
    public details?: any,
    public status?: number
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Utility functions
export const handleAPIError = (error: any): APIError => {
  if (error.response) {
    return new APIError(
      error.response.data?.error || 'API Error',
      error.response.data?.code,
      error.response.data?.details,
      error.response.status
    );
  } else if (error.request) {
    return new APIError('Network error - please check your connection');
  } else {
    return new APIError(error.message || 'Unknown error occurred');
  }
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await api.get('/api/health');
    return response.data;
  } catch (error) {
    throw handleAPIError(error);
  }
};

// Complete API client with all endpoints
export const apiClient = {
  // Authentication
  auth: {
    sync: (userData: any) => api.post('/api/auth/sync', userData),
    create: (userData: any) => api.post('/api/auth/create', userData),
    token: () => api.post('/api/auth/token'),
    profile: () => api.get('/api/auth/profile'),
    updateProfile: (data: any) => api.put('/api/auth/profile', data),
    preferences: () => api.get('/api/auth/preferences'),
    updatePreferences: (data: any) => api.put('/api/auth/preferences', data),
    sendVerification: () => api.post('/api/auth/send-verification'),
    resetPassword: (email: string) => api.post('/api/auth/reset-password', { email }),
    activity: (params?: { limit?: string, offset?: string }) => 
      api.get('/api/auth/activity', { params }),
    deleteAccount: (data: any) => api.delete('/api/auth/account', { data }),
  },

  // VA Profiles - Enhanced
  va: {
    profile: () => api.get('/api/va/profile'),
    createProfile: (data: any) => api.post('/api/va/profile', data),
    updateProfile: (data: any) => api.put('/api/va/profile', data),
    uploadResume: (data: any) => api.post('/api/va/upload-resume', data),
    uploadPortfolio: (data: any) => api.post('/api/va/upload-portfolio', data),
    uploadVideo: (data: any) => api.post('/api/va/upload-video', data),
    skillsAssessment: (skill: string, category?: string, difficulty?: string) => 
      api.post('/api/va/skills-assessment', { skill, category, difficulty }),
    getSkillsAssessments: (skill?: string, category?: string) => 
      api.get('/api/va/skills-assessments', { params: { skill, category } }),
    verification: (level: 'professional' | 'premium', documents?: any[]) => 
      api.post('/api/va/verification', { level, documents }),
    analytics: (period?: number) => api.get('/api/va/analytics', { params: { period } }),
    getUploadUrl: (fileName: string, fileType: string) => 
      api.get('/api/va/upload-url', { params: { fileName, fileType } }),
  },

  // Company - Enhanced
  company: {
    profile: () => api.get('/api/company/profile'),
    createProfile: (data: any) => api.post('/api/company/profile', data),
    updateProfile: (data: any) => api.put('/api/company/profile', data),
    uploadLogo: (data: any) => api.post('/api/company/upload-logo', data),
    getLogoUploadUrl: (fileName: string, fileType: string) => 
      api.get('/api/company/upload-logo-url', { params: { fileName, fileType } }),
    verification: (level: 'professional' | 'premium', documents?: any[]) => 
      api.post('/api/company/verification', { level, documents }),
    analytics: (period?: number) => api.get('/api/company/analytics', { params: { period } }),
    jobs: {
      list: (params?: { page?: number, limit?: number, status?: string }) => 
        api.get('/api/company/jobs', { params }),
      create: (data: any) => api.post('/api/company/jobs', data),
      update: (id: string, data: any) => api.put(`/api/company/jobs/${id}`, data),
      delete: (id: string) => api.delete(`/api/company/jobs/${id}`),
      toggle: (id: string, isActive: boolean) => 
        api.patch(`/api/company/jobs/${id}/toggle`, { isActive }),
      stats: (id: string) => api.get(`/api/company/jobs/${id}/stats`),
      applicants: (id: string) => api.get(`/api/company/jobs/${id}/applicants`),
    },
  },

  // Jobs - Enhanced
  jobs: {
    list: (params?: { page?: number, limit?: number, category?: string }) => 
      api.get('/api/jobs', { params }),
    get: (id: string) => api.get(`/api/jobs/${id}`),
    create: (data: any) => api.post('/api/jobs', data),
    update: (id: string, data: any) => api.put(`/api/jobs/${id}`, data),
    delete: (id: string) => api.delete(`/api/jobs/${id}`),
    search: (params: any) => api.get('/api/jobs/search', { params }),
    featured: () => api.get('/api/jobs/featured'),
    category: (category: string) => api.get(`/api/jobs/category/${category}`),
  },

  // Matching - Enhanced
  matching: {
    discover: (jobPostingId: string) => 
      api.get('/api/matches/discover', { params: { jobPostingId } }),
    vote: (data: any) => api.post('/api/matches/vote', data),
    matches: (type: 'company' | 'va', params?: { page?: number, limit?: number }) =>
      api.get(`/api/matches/${type}`, { params }),
    score: (vaProfileId: string, jobPostingId: string) =>
      api.get('/api/matches/score', { params: { vaProfileId, jobPostingId } }),
    feedback: (matchId: string, rating: number, comment: string) =>
      api.post('/api/matches/feedback', { matchId, rating, comment }),
    details: (matchId: string) => api.get(`/api/matches/${matchId}`),
    updateStatus: (matchId: string, status: string) => 
      api.put(`/api/matches/${matchId}/status`, { status }),
  },

  // Payments - Enhanced
  payments: {
    createIntent: (matchId: string) => 
      api.post('/api/payments/create-intent', { matchId }),
    confirm: (paymentIntentId: string) => 
      api.post('/api/payments/confirm', { paymentIntentId }),
    status: (matchId: string) => 
      api.get(`/api/payments/status/${matchId}`),
    history: (params?: { page?: number, limit?: number }) =>
      api.get('/api/payments/history', { params }),
    refund: (paymentId: string) => api.post('/api/payments/refund', { paymentId }),
    subscription: {
      create: (planId: string) => api.post('/api/payments/subscription/create', { planId }),
      cancel: (subscriptionId: string) => api.post('/api/payments/subscription/cancel', { subscriptionId }),
      update: (subscriptionId: string, planId: string) => 
        api.post('/api/payments/subscription/update', { subscriptionId, planId }),
      list: () => api.get('/api/payments/subscription/list'),
    },
  },

  // Notifications - Enhanced
  notifications: {
    list: (params?: { unread?: boolean, page?: number, limit?: number }) =>
      api.get('/api/notifications', { params }),
    markRead: (notificationId: string) => 
      api.post('/api/notifications/mark-read', { notificationId }),
    markAllRead: () => api.post('/api/notifications/mark-all-read'),
    preferences: (data: any) => api.put('/api/notifications/preferences', data),
    unread: () => api.get('/api/notifications/unread'),
    count: () => api.get('/api/notifications/count'),
  },

  // Reviews - Enhanced
  reviews: {
    create: (data: any) => api.post('/api/reviews', data),
    list: (targetId: string, targetType: 'va' | 'company', params?: { page?: number, limit?: number }) =>
      api.get('/api/reviews', { params: { targetId, targetType, ...params } }),
    helpful: (reviewId: string, isHelpful: boolean) =>
      api.post('/api/reviews/helpful', { reviewId, isHelpful }),
    report: (reviewId: string, reason: string) =>
      api.post('/api/reviews/report', { reviewId, reason }),
    respond: (reviewId: string, response: string) =>
      api.post('/api/reviews/respond', { reviewId, response }),
  },

  // Analytics - Enhanced
  analytics: {
    dashboard: () => api.get('/api/analytics/dashboard'),
    hiring: (params?: { startDate?: string, endDate?: string }) =>
      api.get('/api/analytics/hiring', { params }),
    performance: (params?: { period?: string }) =>
      api.get('/api/analytics/performance', { params }),
    revenue: (params?: { startDate?: string, endDate?: string }) =>
      api.get('/api/analytics/revenue', { params }),
    trends: (params?: { period?: string, metric?: string }) =>
      api.get('/api/analytics/trends', { params }),
    export: (type: string, params?: any) =>
      api.get(`/api/analytics/export/${type}`, { params }),
  },

  // File Upload - Enhanced
  upload: {
    getPresignedUrl: (fileName: string, fileType: string, uploadType: string) =>
      api.post('/api/upload/presigned-url', { fileName, fileType, uploadType }),
    confirm: (data: any) => api.post('/api/upload/confirm', data),
    status: (uploadId: string) => api.get(`/api/upload/status/${uploadId}`),
    delete: (fileKey: string) => api.delete(`/api/upload/${fileKey}`),
    list: (params?: { uploadType?: string, page?: number, limit?: number }) =>
      api.get('/api/uploads', { params }),
    process: (fileKey: string, processingType: string) =>
      api.post('/api/upload/process', { fileKey, processingType }),
    uploadToS3: (url: string, file: File) => {
      return axios.put(url, file, {
        headers: {
          'Content-Type': file.type,
          'x-amz-acl': 'public-read'
        }
      });
    },
  },

  // Search - Enhanced
  search: {
    profiles: (params: any) => api.get('/api/search/profiles', { params }),
    jobs: (params: any) => api.get('/api/search/jobs', { params }),
    companies: (params: any) => api.get('/api/search/companies', { params }),
    suggestions: (query: string) => api.get('/api/search/suggestions', { params: { query } }),
    autocomplete: (query: string, type: string) => 
      api.get('/api/search/autocomplete', { params: { query, type } }),
  },

  // Messaging - New
  messaging: {
    conversations: () => api.get('/api/messaging/conversations'),
    messages: (conversationId: string, params?: { page?: number, limit?: number }) =>
      api.get(`/api/messaging/conversations/${conversationId}/messages`, { params }),
    send: (conversationId: string, message: string, attachments?: any[]) =>
      api.post(`/api/messaging/conversations/${conversationId}/send`, { message, attachments }),
    start: (userId: string, message?: string) => 
      api.post('/api/messaging/start', { userId, message }),
    markRead: (conversationId: string, messageId: string) =>
      api.post(`/api/messaging/conversations/${conversationId}/read`, { messageId }),
    typing: (conversationId: string) => 
      api.post(`/api/messaging/conversations/${conversationId}/typing`),
    online: () => api.get('/api/messaging/online'),
  },
};

export default api;