// Runtime authentication for Dokploy deployment
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { onAuthStateChange } from './firebase-runtime-dokploy-fixed';

export interface AuthUser {
  uid: string;
  email: string;
  displayName?: string;
}

// Get Firebase auth instance at runtime
const getAuthInstance = () => {
  // Dynamic import to avoid build-time issues
  return import('./firebase-runtime-final').then(({ getFirebase }) => {
    const { auth } = getFirebase();
    if (!auth) {
      throw new Error('Firebase auth not initialized');
    }
    return auth;
  });
};

// Sign in user
export const signInUser = async (email: string, password: string): Promise<AuthUser> => {
  try {
    const auth = await getAuthInstance();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('✅ Runtime sign in successful:', user.email);
    
    return {
      uid: user.uid,
      email: user.email!,
      displayName: user.displayName || undefined,
    };
  } catch (error) {
    console.error('Runtime sign in error:', error);
    throw error;
  }
};

// Register new user
export const registerUser = async (email: string, password: string, name?: string): Promise<AuthUser> => {
  try {
    const auth = await getAuthInstance();
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('✅ Runtime registration successful:', user.email);
    
    return {
      uid: user.uid,
      email: user.email!,
      displayName: user.displayName || name || undefined,
    };
  } catch (error) {
    console.error('Runtime registration error:', error);
    throw error;
  }
};

// Sign out user
export const signOutUser = async (): Promise<void> => {
  try {
    const auth = await getAuthInstance();
    await signOut(auth);
    console.log('✅ Runtime sign out successful');
  } catch (error) {
    console.error('Runtime sign out error:', error);
    throw error;
  }
};

// Get auth error message from Firebase error
export const getAuthErrorMessage = (error: any): string => {
  if (!error) return 'Unknown error occurred';
  
  // Firebase Auth errors
  if (error.code) {
    switch (error.code) {
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/user-disabled':
        return 'This account has been disabled';
      case 'auth/user-not-found':
        return 'No account found with this email';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/email-already-in-use':
        return 'An account already exists with this email';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters';
      case 'auth/operation-not-allowed':
        return 'This operation is not allowed';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection';
      case 'auth/api-key-not-valid':
        return 'Firebase configuration error. Please contact support';
      case 'auth/invalid-api-key':
        return 'Invalid Firebase configuration. Please contact support';
      default:
        return error.message || 'Authentication failed';
    }
  }
  
  // Generic error handling
  if (error.message) {
    return error.message;
  }
  
  return 'Authentication failed. Please try again.';
};

// Export runtime auth state monitoring
export { onAuthStateChange };