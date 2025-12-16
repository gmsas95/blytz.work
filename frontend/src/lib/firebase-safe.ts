// Safe Firebase initialization for build process
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Check if we're in a build environment OR if Firebase config is missing
const isBuildProcess = typeof window === 'undefined' && process.env.NODE_ENV === 'production';
const hasFirebaseConfig = !!(process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
                           process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
                           process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Mock Firebase services for build process
const createMockAuth = () => {
  console.log('🔧 Using mock Firebase auth for build process');
  return {
    currentUser: null,
    onAuthStateChanged: () => () => {
      console.log('🔧 Mock onAuthStateChanged called');
      return () => {};
    },
    signInWithEmailAndPassword: async () => {
      console.log('🔧 Mock signInWithEmailAndPassword called');
      return { user: null };
    },
    createUserWithEmailAndPassword: async () => {
      console.log('🔧 Mock createUserWithEmailAndPassword called');
      return { user: null };
    },
    signInWithPopup: async () => {
      console.log('🔧 Mock signInWithPopup called');
      return { user: null };
    },
    signOut: async () => {
      console.log('🔧 Mock signOut called');
    },
  };
};

// Safe Firebase initialization
let app: any;
let auth: any;

// During build process without config, use mocks
if (isBuildProcess && !hasFirebaseConfig) {
  console.log('⚠️ Build process without Firebase config - using mock mode');
  app = {
    name: '[DEFAULT]',
    options: firebaseConfig,
  };
  auth = createMockAuth();
} else if (!hasFirebaseConfig) {
  console.warn('⚠️ Firebase configuration missing - authentication will not work');
  app = {
    name: '[DEFAULT]',
    options: firebaseConfig,
  };
  auth = createMockAuth();
} else {
  try {
    console.log('✅ Firebase: Initializing with provided config');
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
  } catch (error) {
    console.warn('⚠️ Firebase initialization failed, using mock mode:', error);
    app = {
      name: '[DEFAULT]',
      options: firebaseConfig,
    };
    auth = createMockAuth();
  }
}

export { app, auth };