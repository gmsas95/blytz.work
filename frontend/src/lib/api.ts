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

export const apiCall = async (endpoint: string, options: RequestInit = {}, timeout = 3000) => {
  let token = localStorage.getItem('authToken');
  let retryCount = 0;
  const maxRetries = 1;
  
  // Helper function to make the actual API call
  const makeRequest = async (authToken: string | null) => {
    return fetchWithTimeout(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        ...options.headers,
      }
    }, timeout);
  };
  
  // Helper function to handle auth errors
  const handleAuthError = async () => {
    // Token refresh failed after retry, clearing auth state
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    // Use a more graceful redirect
    if (typeof window !== 'undefined') {
      window.location.href = '/auth?expired=true';
    }
    throw new Error('Authentication expired. Please sign in again.');
  };
  
  while (retryCount <= maxRetries) {
    try {
      // If no token, try to get a fresh one
      if (!token) {
        token = await getToken();
      }
      
      const response = await makeRequest(token);
      
      // Handle 401 unauthorized - token might be expired
      if (response.status === 401 && retryCount < maxRetries) {
        console.log('🔄 Token expired, attempting refresh...');
        // Try to refresh token
        const freshToken = await getToken();
        if (freshToken && freshToken !== token) {
          // Retry with fresh token
          console.log('🔄 Retrying with fresh token...');
          token = freshToken;
          retryCount++;
          continue;
        } else {
          // Token refresh failed
          await handleAuthError();
        }
      }
      
      return response;
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      
      // Handle timeout errors specifically
      if (error instanceof Error && error.message.includes('timeout')) {
        throw new Error(`Request timeout after ${timeout}ms. Please check your connection.`);
      }
      
      // For network errors, provide more helpful message
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      // Re-throw other errors
      throw error;
    }
  }
  
  // If we've exhausted retries, handle auth error
  await handleAuthError();
};