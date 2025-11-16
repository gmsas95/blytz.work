import { getToken } from './auth-utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://hyred.blytz.app:3010';

export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  let token = localStorage.getItem('authToken');
  
  // If no token, try to get a fresh one
  if (!token) {
    token = await getToken();
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    }
  });
  
  // Handle 401 unauthorized - token might be expired
  if (response.status === 401) {
    // Try to refresh token
    const freshToken = await getToken();
    if (freshToken && freshToken !== token) {
      // Retry with fresh token
      return fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${freshToken}`,
          ...options.headers,
        }
      });
    } else {
      // Token refresh failed, clear auth state
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      // Redirect to login page
      window.location.href = '/auth';
    }
  }
  
  return response;
};