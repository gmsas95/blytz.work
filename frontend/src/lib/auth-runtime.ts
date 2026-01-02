// Runtime authentication utilities using simplified Firebase configuration
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirebase } from './firebase-simplified';

// Token management utilities
let tokenRefreshPromise: Promise<string | null> | null = null;

export const getToken = async (): Promise<string | null> => {
  try {
    // Ensure Firebase is initialized
    const { auth } = getFirebase();
    
    if (!auth) {
      console.warn('⚠️ Firebase auth not initialized');
      return null;
    }

    // If we have a pending token refresh, return it to prevent race conditions
    if (tokenRefreshPromise) {
      return await tokenRefreshPromise;
    }
    
    const user = auth.currentUser;
    
    if (user) {
      // Create a promise for token refresh to prevent concurrent requests
      tokenRefreshPromise = user.getIdToken(true).then(token => {
        console.log("✅ Firebase token refreshed successfully");
        return token;
      }).catch(error => {
        console.error('Error getting auth token:', error);
        return null;
      }).finally(() => {
        tokenRefreshPromise = null;
      });
      
      return await tokenRefreshPromise;
    }
    
    console.log("No Firebase user found");
    return null; // No user logged in
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null; // Return null on error instead of dev tokens
  }
};

// Monitor auth state and automatically update token in localStorage
export const setupTokenRefresh = (): (() => void) => {
  const { auth } = getFirebase();
  
  if (!auth) {
    console.warn('⚠️ Firebase auth not available for token refresh setup');
    return () => {};
  }

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
      // User signed out, clear tokens and cookies
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      // Clear cookies
      document.cookie = 'authToken=; path=/; max-age=0';
      document.cookie = 'user=; path=/; max-age=0';
      console.log("👋 User signed out, tokens and cookies cleared");
    }
    
    isUpdating = false;
  });

  return unsubscribe;
};

// Get current auth state
export const onAuthStateChange = (callback: (user: User | null) => void): (() => void) => {
  const { auth } = getFirebase();
  
  if (!auth) {
    console.warn('⚠️ Firebase auth not available for state monitoring');
    callback(null);
    return () => {};
  }

  return onAuthStateChanged(auth, callback);
};

// Sign out user
export const signOutUser = async (): Promise<void> => {
  const { auth } = getFirebase();

  if (!auth) {
    console.warn('⚠️ Firebase auth not available for sign out');
    return;
  }

  try {
    await auth.signOut();
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    // Clear cookies
    document.cookie = 'authToken=; path=/; max-age=0';
    document.cookie = 'user=; path=/; max-age=0';
    console.log("✅ User signed out successfully");
  } catch (error) {
    console.error('Error signing out:', error);
  }
};