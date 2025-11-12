// Firebase v10 - Direct approach without custom helpers
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, signOut, onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID,
};

// Debug logging
console.log('Firebase config:', {
  apiKey: firebaseConfig.apiKey ? 'SET' : 'NOT_SET',
  authDomain: firebaseConfig.authDomain ? 'SET' : 'NOT_SET',
  projectId: firebaseConfig.projectId ? 'SET' : 'NOT_SET',
  window: typeof window !== 'undefined' ? 'BROWSER' : 'SERVER',
});

// Initialize Firebase
let app: ReturnType<typeof initializeApp> | null = null;
let auth: ReturnType<typeof getAuth> | null = null;

try {
  if (typeof window !== 'undefined' && firebaseConfig.apiKey && firebaseConfig.apiKey !== 'placeholder_key') {
    console.log('Initializing Firebase with config...');
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    console.log('Firebase initialized successfully');
  } else {
    console.log('Firebase not initialized:', {
      window: typeof window,
      apiKey: firebaseConfig.apiKey,
      isPlaceholder: firebaseConfig.apiKey === 'placeholder_key'
    });
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Export auth instance directly - not wrappers
export { auth };

// Export individual functions that work with auth instance
export const useAuthStateListener = (callback: (user: FirebaseUser | null) => void) => {
  if (!auth) {
    console.log('Auth not available, returning empty unsubscribe');
    return () => {}; // Return empty unsubscribe function
  }
  console.log('Setting up auth state listener');
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
  const available = typeof window !== 'undefined' && auth !== null;
  console.log('Firebase availability check:', available, {
    window: typeof window,
    auth: auth !== null
  });
  return available;
};

// Export default for compatibility
export default app;