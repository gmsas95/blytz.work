// Runtime authentication for Dokploy deployment
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { onAuthStateChange } from './firebase-runtime-final';

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

// Sign in user using backend proxy to bypass network issues
export const signInUser = async (email: string, password: string): Promise<AuthUser> => {
  try {
    console.log('🔍 Attempting sign in with email via backend proxy:', email);
    
    // Use backend proxy API instead of direct Firebase SDK call
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Backend sign-in error:', data.error);
      // Convert backend error to Firebase-like error for compatibility
      const firebaseError = new Error(data.error || 'Authentication failed');
      (firebaseError as any).code = mapBackendErrorToFirebaseCode(data.error, response.status);
      throw firebaseError;
    }
    
    console.log('✅ Backend sign-in successful:', data.user.email);
    
    // Store token for future API calls
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }
    
    return {
      uid: data.user.uid,
      email: data.user.email,
      displayName: data.user.displayName || undefined,
    };
  } catch (error: any) {
    console.error('❌ Sign-in error:', error);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error message:', error.message);
    
    throw error;
  }
};

// Register new user using backend proxy to bypass network issues
export const registerUser = async (email: string, password: string, name?: string): Promise<AuthUser> => {
  try {
    console.log('🔍 Attempting registration with email via backend proxy:', email);
    
    // Use backend proxy API instead of direct Firebase SDK call
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Backend registration error:', data.error);
      // Convert backend error to Firebase-like error for compatibility
      const firebaseError = new Error(data.error || 'Registration failed');
      (firebaseError as any).code = mapBackendErrorToFirebaseCode(data.error, response.status);
      throw firebaseError;
    }
    
    console.log('✅ Backend registration successful:', data.user.email);
    
    // Store token for future API calls
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }
    
    return {
      uid: data.user.uid,
      email: data.user.email,
      displayName: data.user.displayName || name || undefined,
    };
  } catch (error: any) {
    console.error('❌ Registration error:', error);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error message:', error.message);
    
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

// Get Firebase ID token for API calls
export const getToken = async (): Promise<string | null> => {
  try {
    // First check if we have a stored token from backend proxy
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      console.log('✅ Using stored auth token');
      return storedToken;
    }
    
    // Fallback to Firebase SDK if no stored token
    const auth = await getAuthInstance();
    
    // Ensure auth is properly initialized
    if (!auth) {
      console.warn('Firebase auth not initialized properly');
      return null;
    }
    
    const user = auth.currentUser;
    
    if (!user) {
      console.warn('No current user to get token from');
      return null;
    }
    
    const token = await user.getIdToken();
    console.log('✅ Firebase ID token retrieved successfully');
    return token;
  } catch (error) {
    console.error('Failed to get Firebase ID token:', error);
    return null;
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

// Helper function to map backend errors to Firebase error codes for compatibility
function mapBackendErrorToFirebaseCode(errorMessage: string, statusCode: number): string {
  const errorMap: Record<string, string> = {
    'No account found with this email address': 'auth/user-not-found',
    'Incorrect password': 'auth/wrong-password',
    'The email address is not valid': 'auth/invalid-email',
    'An account already exists with this email address': 'auth/email-already-in-use',
    'Password should be at least 6 characters': 'auth/weak-password',
    'Too many failed attempts. Please try again later': 'auth/too-many-requests',
    'Authentication service temporarily unavailable. Please try again later': 'auth/network-request-failed',
  };
  
  // Map by error message first
  if (errorMap[errorMessage]) {
    return errorMap[errorMessage];
  }
  
  // Map by HTTP status code as fallback
  switch (statusCode) {
    case 400: return 'auth/invalid-email';
    case 401: return 'auth/wrong-password';
    case 404: return 'auth/user-not-found';
    case 409: return 'auth/email-already-in-use';
    case 429: return 'auth/too-many-requests';
    case 500: return 'auth/internal-error';
    case 503: return 'auth/network-request-failed';
    default: return 'auth/unknown-error';
  }
}

// Export runtime auth state monitoring
export { onAuthStateChange };