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
  let retryCount = 0;
  const maxRetries = 2;
  
  // Helper function to make the actual API call
  const makeRequest = async (authToken: string | null) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };
    
    // Add auth header if token is available
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    // Add custom header to indicate auth state for middleware
    if (authToken || localStorage.getItem('authUser')) {
      headers['x-has-auth'] = 'true';
    }
    
    return fetchWithTimeout(`${API_URL}${endpoint}`, {
      ...options,
      headers
    }, timeout);
  };
  
  // Helper function to handle auth errors
  const handleAuthError = async () => {
    console.log('🔍 Handling authentication error...');
    // Clear all auth-related storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('isMockAuth');
    
    // Use a more graceful redirect
    if (typeof window !== 'undefined') {
      // Only redirect if we're not already on auth page
      if (!window.location.pathname.includes('/auth')) {
        window.location.href = '/auth?expired=true';
      }
    }
    throw new Error('Authentication expired. Please sign in again.');
  };
  
  while (retryCount <= maxRetries) {
    try {
      // If no token, try to get a fresh one
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
      
      const response = await makeRequest(token);
      
      // Check if response was successful before processing
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }
      
      // Handle 401 unauthorized - token might be expired
      if (response.status === 401 && retryCount < maxRetries) {
        const errorData = await response.json().catch(() => null);
        const isSyncError = errorData?.code === 'USER_NOT_FOUND' ||
                            errorData?.code === 'MISSING_AUTH_HEADER' ||
                            errorData?.code === 'MISSING_TOKEN';
        
        // NEW: Handle USER_NOT_FOUND by calling create-from-firebase directly
        if (isSyncError) {
          console.log('🔍 User not found in database, calling create-from-firebase...');
          
          // Call create-from-firebase directly to sync user to database
          try {
            const createResponse = await apiCall('/auth/create-from-firebase', {
              method: 'POST',
              body: JSON.stringify({
                uid: JSON.parse(localStorage.getItem('authUser') || '{}')?.uid,
                email: JSON.parse(localStorage.getItem('authUser') || '{}')?.email
              })
            });
            
            console.log('User sync response:', createResponse);
            
            // If sync was successful, retry the original request
            if (createResponse.ok) {
              console.log('✅ User synced successfully, retrying original request...');
              token = await getToken();
              if (token) {
                localStorage.setItem('authToken', token);
              }
              retryCount++;
              continue;
            } else {
              console.log('❌ User sync failed, cannot continue');
              throw new Error('Failed to sync user to database');
            }
          } catch (syncError) {
            console.error('Failed to sync user to database:', syncError);
            throw new Error('Failed to sync user to database');
          }
        }
        
        console.log('🔄 Token expired, attempting refresh...');
        // Try to refresh token
        try {
          const freshToken = await getToken();
          if (freshToken && freshToken !== token) {
            // Retry with fresh token
            console.log('🔄 Retrying with fresh token...');
            token = freshToken;
            localStorage.setItem('authToken', freshToken);
            retryCount++;
            continue;
          } else {
            // Token refresh failed, but don't redirect immediately
            console.log('🔄 Token refresh failed, will retry...');
            retryCount++;
            continue;
          }
        } catch (refreshError) {
          console.log('🔄 Token refresh failed:', refreshError);
          // Only handle auth error on final retry
          if (retryCount >= maxRetries - 1) {
            await handleAuthError();
          } else {
            retryCount++;
            continue;
          }
        }
      }
      
      // Handle other auth-related errors
      if (response.status === 403) {
        console.log('🔍 Access forbidden - checking permissions...');
        // Don't automatically redirect for 403, let the component handle it
        throw new Error('Access denied. You do not have permission to perform this action.');
      }
      
      // Check if response was successful (2xx status)
      if (!response.ok || response.status === 401) {
        const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
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
      
      // For abort errors (user cancelled)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request was cancelled');
      }
      
      // If we've exhausted retries and it's an auth error, handle it
      if (retryCount >= maxRetries && error instanceof Error &&
          (error.message.includes('Authentication') || error.message.includes('401'))) {
        await handleAuthError();
      }
      
      // Re-throw other errors
      throw error;
    }
      }
  }
};