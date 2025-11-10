// Simplified API Client for Development
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

export default api;