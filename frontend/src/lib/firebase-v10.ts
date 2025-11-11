// Firebase v10 - Direct approach without custom helpers
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, signOut, onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let app: ReturnType<typeof initializeApp> | null = null;
let auth: ReturnType<typeof getAuth> | null = null;

try {
  if (typeof window !== 'undefined' && firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Export auth instance directly - not wrappers
export { auth };

// Export individual functions that work with the auth instance
export const useAuthStateListener = (callback: (user: FirebaseUser | null) => void) => {
  if (!auth) {
    return () => {}; // Return empty unsubscribe function
  }
  return onAuthStateChanged(auth, callback);
};

export const performSignOut = async () => {
  if (!auth) {
    throw new Error('Firebase is not available');
  }
  return await signOut(auth);
};

// Export other functions as-is
export { 
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged
};

export type { FirebaseUser };

// Helper function to check if Firebase is available
export const isFirebaseAvailable = () => {
  return typeof window !== 'undefined' && auth !== null;
};

// Export default for compatibility
export default app;