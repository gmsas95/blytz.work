// Firebase v10 - Production configuration
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, signOut, onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Production Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Production logging
console.log('🔥 BlytzHire Production Config:', {
  apiKey: firebaseConfig.apiKey ? '✅' : '❌',
  authDomain: firebaseConfig.authDomain ? '✅' : '❌', 
  projectId: firebaseConfig.projectId ? '✅' : '❌',
  window: typeof window !== 'undefined' ? '🌐 PROD' : '🖥️ BUILD',
});

// Initialize Firebase
let app: ReturnType<typeof initializeApp> | null = null;
let auth: ReturnType<typeof getAuth> | null = null;
let firebaseInitialized = false;

const initializeFirebase = () => {
  if (firebaseInitialized || typeof window === 'undefined' || !firebaseConfig.apiKey) {
    return auth;
  }

  try {
    console.log('🚀 Initializing Firebase for BlytzHire...');
    console.log('🌐 Auth Domain:', firebaseConfig.authDomain);
    console.log('📦 Project ID:', firebaseConfig.projectId);
    
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    firebaseInitialized = true;
    console.log('✅ Firebase initialized successfully - Ready for authentication!');
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    firebaseInitialized = true; // Prevent retry loops
  }
  
  return auth;
};

// Auto-initialize on client-side
if (typeof window !== 'undefined') {
  initializeFirebase();
}

// Also provide manual initialization function
export { initializeFirebase };

// Export auth instance
export { auth };

// Export individual functions
export const useAuthStateListener = (callback: (user: FirebaseUser | null) => void) => {
  if (!auth) {
    console.log('⚠️ Firebase auth not available');
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

export const performSignOut = async () => {
  if (!auth) {
    throw new Error('Firebase is not available');
  }
  return await signOut(auth);
};

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

// Check Firebase availability
export const isFirebaseAvailable = () => {
  // Try to initialize Firebase if not already done and in browser
  if (!firebaseInitialized && typeof window !== 'undefined') {
    initializeFirebase();
  }
  
  const available = typeof window !== 'undefined' && auth !== null;
  console.log('🔍 Firebase status:', available ? '✅ AVAILABLE' : '❌ NOT AVAILABLE');
  return available;
};

export default app;