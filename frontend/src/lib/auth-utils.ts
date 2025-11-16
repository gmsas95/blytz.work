import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from './firebase';

// Token management utilities
export const getToken = async (): Promise<string | null> => {
  try {
    const auth = getAuth(app);
    const user = auth.currentUser;
    
    if (user) {
      // Firebase user exists, get real token
      return await user.getIdToken(true); // Force refresh
    } else {
      // Check if we're in development mode without Firebase config
      const storedUser = localStorage.getItem('user');
      const storedRole = localStorage.getItem('userRole');
      
      if (storedUser && storedRole) {
        // Use development token based on role
        const userData = JSON.parse(storedUser);
        if (storedRole === 'employer') {
          return 'dev-token-company';
        } else if (storedRole === 'va') {
          return 'dev-token-va';
        }
      }
      return null;
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
    // Fallback to development tokens
    const storedRole = localStorage.getItem('userRole');
    if (storedRole === 'employer') {
      return 'dev-token-company';
    } else if (storedRole === 'va') {
      return 'dev-token-va';
    }
    return null;
  }
};

// Monitor auth state and automatically update token in localStorage
export const setupTokenRefresh = (): (() => void) => {
  const auth = getAuth(app);
  
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const token = await user.getIdToken();
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        }));
      } catch (error) {
        console.error('Error refreshing token:', error);
        // Clear invalid token
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    } else {
      // User signed out, clear tokens
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
    }
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

// Create a mock user for development when Firebase is not configured
export const createMockUser = async (email: string, password: string, role: 'va' | 'company'): Promise<any> => {
  const mockUser = {
    uid: `dev-${role}-${Date.now()}`,
    email: email,
    displayName: email.split('@')[0],
  };
  
  // Store mock user and set development token
  localStorage.setItem('user', JSON.stringify(mockUser));
  localStorage.setItem('userRole', role === 'company' ? 'employer' : 'va');
  localStorage.setItem('authToken', role === 'company' ? 'dev-token-company' : 'dev-token-va');
  
  return mockUser;
};