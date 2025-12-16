import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app, auth as firebaseAuth } from './firebase';

// Token management utilities
let tokenRefreshPromise: Promise<string | null> | null = null;

export const getToken = async (): Promise<string | null> => {
  try {
    // If we have a pending token refresh, return it to prevent race conditions
    if (tokenRefreshPromise) {
      return await tokenRefreshPromise;
    }
    
    const auth = firebaseAuth || getAuth(app);
    const user = auth.currentUser;
    
    // Debug: Firebase user check
    
    if (user) {
      // Create a promise for token refresh to prevent concurrent requests
      tokenRefreshPromise = user.getIdToken(true).then(token => {
        // Debug: Firebase token refreshed
        return token;
      }).catch(error => {
        // Debug: Error getting auth token
        return null;
      }).finally(() => {
        tokenRefreshPromise = null;
      });
      
      return await tokenRefreshPromise;
    }
    
    // Debug: No Firebase user found
    return null; // No user logged in
  } catch (error) {
    // Debug: Error getting auth token
    return null; // Return null on error instead of dev tokens
  }
};

// Monitor auth state and automatically update token in localStorage
export const setupTokenRefresh = (): (() => void) => {
  const auth = firebaseAuth || getAuth(app);
  let isUpdating = false;
  
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (isUpdating) return; // Prevent concurrent updates
    isUpdating = true;
    
    if (user) {
      try {
        const token = await user.getIdToken();
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        };
        
        // Only update if token or user data has changed
        const currentToken = localStorage.getItem('authToken');
        const currentUser = localStorage.getItem('user');
        
        if (token !== currentToken) {
          localStorage.setItem('authToken', token);
        }
        
        const userDataStr = JSON.stringify(userData);
        if (userDataStr !== currentUser) {
          localStorage.setItem('user', userDataStr);
        }
        
        console.log('✅ Auth state updated for user:', user.email);
      } catch (error) {
        console.error('Error refreshing token:', error);
        // Clear invalid token
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
      }
    } else {
      // User signed out, clear tokens
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      console.log('👋 User signed out, tokens cleared');
    }
    
    isUpdating = false;
  });
  
  return unsubscribe;
};

// Check if user is currently authenticated
export const isUserAuthenticated = (): boolean => {
  return !!localStorage.getItem('authToken') && !!localStorage.getItem('user');
};

// Get current user from localStorage
export const getCurrentUser = (): any => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
};

// Mock user creation disabled for security
// This function should not be used in production
export const createMockUser = async (email: string, password: string, role: 'va' | 'company'): Promise<any> => {
  throw new Error('Mock user creation is disabled for security. Please configure Firebase authentication.');
};