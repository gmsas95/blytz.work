import { getToken } from './auth-utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://hyred.blytz.app/api';

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

export const apiCall = async (endpoint: string, options: RequestInit = {}, timeout = 3000) => {
  let token = localStorage.getItem('authToken');
  
  // If no token, try to get a fresh one
  if (!token) {
    token = await getToken();
  }
  
  try {
    const response = await fetchWithTimeout(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      }
    }, timeout);
    
    // Handle 401 unauthorized - token might be expired
    if (response.status === 401) {
      console.log('Token expired, attempting refresh...');
      // Try to refresh token
      const freshToken = await getToken();
      if (freshToken && freshToken !== token) {
        // Retry with fresh token
        console.log('Retrying with fresh token...');
        return fetchWithTimeout(`${API_URL}${endpoint}`, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${freshToken}`,
            ...options.headers,
          }
        }, timeout);
      } else {
        // Token refresh failed, clear auth state
        console.log('Token refresh failed, clearing auth state');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        // Redirect to login page
        window.location.href = '/auth';
      }
    }
    
    return response;
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    // Don't redirect on timeout, let the caller handle it
    if (error instanceof Error && error.message.includes('timeout')) {
      throw error;
    }
    // For other errors, also let the caller handle
    throw error;
  }
};