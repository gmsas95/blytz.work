// Firebase v9+ Configuration
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, signOut, onAuthStateChanged as firebaseOnAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
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
let app;
let auth;
let analytics;

try {
  if (typeof window !== 'undefined' && firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    analytics = getAnalytics(app);
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Export auth functions
export { 
  auth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  firebaseOnAuthStateChanged as onAuthStateChanged
};

export type { FirebaseUser };

// Helper function to check if Firebase is available
export const isFirebaseAvailable = () => {
  return typeof window !== 'undefined' && auth !== undefined;
};

// Helper for onAuthStateChanged with proper auth parameter
export const useAuthStateListener = (callback: (user: FirebaseUser | null) => void) => {
  if (isFirebaseAvailable()) {
    return firebaseOnAuthStateChanged(auth, callback);
  }
  return () => {}; // Return empty unsubscribe function
};

// Export default for compatibility
export default app;