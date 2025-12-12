// Safe Firebase initialization for Dokploy deployment
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Debug: Log all available environment variables at initialization
if (typeof window !== 'undefined') {
  console.log('🔍 Firebase Safe Init - Environment check:', {
    hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    hasAuthDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    hasProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    apiKeyPreview: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 
      `${process.env.NEXT_PUBLIC_FIREBASE_API_KEY.substring(0, 10)}...` : 'none'
  });
}

// Check for Dokploy template syntax (indicates failed substitution)
const isDokployTemplate = (value: string | undefined) => {
  return value && (value.includes('${environment') || value.includes('$${environment'));
};

// Get environment variable with fallback handling
const getEnvVar = (name: string, fallback?: string): string | undefined => {
  const value = process.env[name];
  
  if (isDokployTemplate(value)) {
    console.warn(`⚠️ Dokploy template detected for ${name}:`, value);
    return fallback;
  }
  
  return value || fallback;
};

// Firebase configuration with robust error handling
const getFirebaseConfig = () => {
  const config = {
    apiKey: getEnvVar('NEXT_PUBLIC_FIREBASE_API_KEY'),
    authDomain: getEnvVar('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
    projectId: getEnvVar('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
    storageBucket: getEnvVar('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: getEnvVar('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
    appId: getEnvVar('NEXT_PUBLIC_FIREBASE_APP_ID'),
  };

  // Log configuration status
  if (typeof window !== 'undefined') {
    console.log('🔍 Firebase Config Status:', {
      apiKey: config.apiKey ? '✅ Present' : '❌ Missing',
      authDomain: config.authDomain ? '✅ Present' : '❌ Missing',
      projectId: config.projectId ? '✅ Present' : '❌ Missing',
      hasTemplate: Object.values(config).some(val => isDokployTemplate(val))
    });
  }

  return config;
};

const firebaseConfig = getFirebaseConfig();

// Mock Firebase services for when config is missing
const createMockAuth = () => {
  console.log('🔧 Using mock Firebase auth - config missing or invalid');
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
    getAuth: () => createMockAuth(),
    GoogleAuthProvider: class {
      static PROVIDER_ID = 'google.com';
    },
  };
};

// Safe Firebase initialization
let app: any;
let auth: any;

// Check if we have valid Firebase configuration
const hasValidConfig = firebaseConfig.apiKey && 
                      firebaseConfig.authDomain && 
                      firebaseConfig.projectId &&
                      !isDokployTemplate(firebaseConfig.apiKey);

if (hasValidConfig) {
  try {
    console.log('✅ Firebase: Initializing with provided config');
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    
    // Test the configuration
    if (typeof window !== 'undefined') {
      console.log('✅ Firebase initialized successfully:', {
        projectId: firebaseConfig.projectId,
        authDomain: firebaseConfig.authDomain,
        apiKeyLength: firebaseConfig.apiKey?.length
      });
    }
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    app = { name: '[DEFAULT]', options: firebaseConfig };
    auth = createMockAuth();
  }
} else {
  console.warn('⚠️ Firebase configuration invalid or missing - using mock mode');
  console.warn('Config status:', {
    hasApiKey: !!firebaseConfig.apiKey,
    hasAuthDomain: !!firebaseConfig.authDomain,
    hasProjectId: !!firebaseConfig.projectId,
    hasTemplate: isDokployTemplate(firebaseConfig.apiKey)
  });
  
  app = { name: '[DEFAULT]', options: firebaseConfig };
  auth = createMockAuth();
}

export { app, auth };