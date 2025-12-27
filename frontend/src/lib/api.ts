import { getToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.blytz.work/api';

// Helper function to add timeout to fetch
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 5000): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
};

export const apiCall = async (endpoint: string, options: RequestInit = {}, timeout = 5000) => {
  let token = localStorage.getItem('authToken');

  // If no token, try to get a fresh one from Firebase
  if (!token) {
    try {
      token = await getToken();
      if (token) {
        localStorage.setItem('authToken', token);
      }
    } catch (tokenError) {
      console.log('🔍 Could not get fresh token:', tokenError);
    }
  }

  // Prepare headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  // Add auth header if token is available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Add custom header to indicate auth state for middleware
  if (token || localStorage.getItem('authUser')) {
    headers['x-has-auth'] = 'true';
  }

  // Make the request
  const response = await fetchWithTimeout(`${API_URL}${endpoint}`, {
    ...options,
    headers
  }, timeout);

  // Handle 401 unauthorized - token expired or user not found
  if (response.status === 401) {
    console.log('🔍 Authentication failed (401), clearing auth and redirecting...');
    // Clear all auth-related storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('isMockAuth');

    // Only redirect if we're not already on auth page
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth')) {
      window.location.href = '/auth?expired=true';
    }

    throw new Error('Authentication failed. Please sign in again.');
  }

  // Handle other errors
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }

  return response;
};
