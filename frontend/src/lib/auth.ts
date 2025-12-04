import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User, onAuthStateChanged } from 'firebase/auth';
import { app, auth as firebaseAuth } from './firebase';

// Use the pre-initialized auth from firebase module
export const auth = firebaseAuth || getAuth(app);

export interface AuthUser {
  uid: string;
  email: string;
  displayName?: string;
}

// Sign in user
export const signInUser = async (email: string, password: string): Promise<AuthUser> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    return {
      uid: user.uid,
      email: user.email!,
      displayName: user.displayName || undefined,
    };
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

// Register new user
export const registerUser = async (email: string, password: string, name?: string): Promise<AuthUser> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    return {
      uid: user.uid,
      email: user.email!,
      displayName: name || user.displayName || undefined,
    };
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Sign out user
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

// Listen to auth state changes
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// Error handling helper
export const getAuthErrorMessage = (error: any): string => {
  if (error.code === 'auth/user-not-found') {
    return 'No account found with this email.';
  }
  if (error.code === 'auth/wrong-password') {
    return 'Incorrect password. Please try again.';
  }
  if (error.code === 'auth/email-already-in-use') {
    return 'An account with this email already exists.';
  }
  if (error.code === 'auth/weak-password') {
    return 'Password should be at least 6 characters.';
  }
  if (error.code === 'auth/invalid-email') {
    return 'Please enter a valid email address.';
  }
  if (error.code === 'auth/too-many-requests') {
    return 'Too many failed attempts. Please try again later.';
  }
  return error.message || 'An error occurred during authentication.';
};