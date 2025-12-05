// Runtime authentication utilities for Dokploy deployment
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirebase } from './firebase-runtime';

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
    
    console.log("🔍 Runtime auth check - user:", user);
    
    if (user) {
      // Create a promise for token refresh to prevent concurrent requests
      tokenRefreshPromise = user.getIdToken(true).then(token => {
        console.log("🔍 Runtime Firebase token refreshed:", token ? `${token.substring(0, 20)}...` : 'null');
        return token;
      }).catch(error => {
        console.error('🔍 Runtime error getting auth token:', error);
        return null;
      }).finally(() => {
        tokenRefreshPromise = null;
      });
      
      return await tokenRefreshPromise;
    }
    
    console.log("🔍 Runtime - No Firebase user found");
    return null; // No user logged in
  } catch (error) {
    console.error('🔍 Runtime error getting auth token:', error);
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
          token: token
        };
        
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        console.log("🔍 Runtime - Auth state changed: user signed in", user.email);
      } catch (error) {
        console.error('🔍 Runtime error in auth state change:', error);
      }
    } else {
      // User signed out
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      console.log("🔍 Runtime - Auth state changed: user signed out");
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
    console.log("🔍 Runtime - User signed out successfully");
  } catch (error) {
    console.error('🔍 Runtime error signing out:', error);
  }
};