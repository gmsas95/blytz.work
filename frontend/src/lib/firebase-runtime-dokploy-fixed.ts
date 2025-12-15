// Fixed Firebase configuration for Dokploy with proper runtime injection handling
let firebaseApp: any = null;
let firebaseAuth: any = null;

// Check if a value contains Dokploy runtime injection (not template syntax)
const isRuntimeInjected = (value: string | undefined): boolean => {
  if (!value) return false;
  
  // Check for actual runtime values (not template syntax)
  // Runtime injected values will be actual Firebase keys/IDs, not template placeholders
  return (
    // Real Firebase API keys start with specific patterns
    value.startsWith('AIza') || // Firebase API keys
    value.startsWith('1:') || // Firebase app IDs  
    value.includes('.firebaseapp.com') || // Firebase auth domains
    value.includes('.appspot.com') || // Firebase storage buckets
    value.includes('gserviceaccount.com') || // Firebase service emails
    value.includes('-----BEGIN') || // Private keys
    // And NOT template syntax
    (!value.includes('${') && !value.includes('}}') && !value.includes('environment'))
  );
};

// Get Firebase config with proper runtime injection detection
const getFirebaseConfig = () => {
  // Get raw environment variables
  const rawConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  console.log('🔍 Raw Firebase config from environment:', {
    apiKey: rawConfig.apiKey ? 'Present' : 'Missing',
    authDomain: rawConfig.authDomain ? 'Present' : 'Missing',
    projectId: rawConfig.projectId ? 'Present' : 'Missing',
    apiKeyPreview: rawConfig.apiKey ? rawConfig.apiKey.substring(0, 20) + '...' : 'none'
  });

  // Check each variable for runtime injection vs template syntax
  const configAnalysis = Object.entries(rawConfig).map(([key, value]) => ({
    key,
    value,
    isRuntimeInjected: isRuntimeInjected(value),
    isTemplate: !value || (value.includes('${') && value.includes('}'))
  }));

  console.log('🔍 Runtime injection analysis:', configAnalysis.map(({key, isRuntimeInjected, isTemplate}) => ({
    [key]: isRuntimeInjected ? '✅ RUNTIME' : (isTemplate ? '❌ TEMPLATE' : '❌ MISSING')
  })));

  // Check if three essential variables are properly injected (not just present, but actually runtime values)
  const essentialVars = ['apiKey', 'authDomain', 'projectId'];
  const runtimeInjectedCount = essentialVars.filter(varName => {
    const config = configAnalysis.find(item => item.key === varName);
    return config && config.isRuntimeInjected;
  }).length;

  // If essential variables are runtime injected, use the config
  if (runtimeInjectedCount >= 3) {
    console.log('✅ Firebase configuration is properly runtime-injected');
    return rawConfig;
  }

  console.error('❌ Firebase configuration is not runtime-injected');
  console.error('This usually means:');
  console.error('1. Environment variables are not set in Dokploy');
  console.error('2. Dokploy runtime injection is not working');
  console.error('3. Values are still in template format');
  
  return null;
};

// Mock Firebase services for when config is missing
const createMockAuth = () => {
  console.log('🔧 Using mock Firebase auth - no valid configuration available');
  return {
    currentUser: null,
    onAuthStateChanged: () => () => {},
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

// Initialize Firebase at runtime
export const initializeFirebase = () => {
  if (firebaseApp && firebaseAuth) {
    return { app: firebaseApp, auth: firebaseAuth };
  }

  const config = getFirebaseConfig();
  
  if (!config) {
    console.error('❌ Cannot initialize Firebase - no valid configuration');
    firebaseApp = { name: '[DEFAULT]', options: {} };
    firebaseAuth = createMockAuth();
    return { app: firebaseApp, auth: firebaseAuth };
  }

  try {
    // Import Firebase modules dynamically
    const { initializeApp } = require('firebase/app');
    const { getAuth } = require('firebase/auth');
    
    firebaseApp = initializeApp(config);
    firebaseAuth = getAuth(firebaseApp);
    console.log('✅ Firebase initialized successfully');
    console.log('🔗 Firebase app name:', firebaseApp.name);
  } catch (error) {
    console.error('❌ Runtime Firebase initialization failed:', error);
    console.error('This could be due to:');
    console.error('1. Invalid Firebase configuration values');
    console.error('2. Network connectivity issues');
    console.error('3. Firebase service unavailability');
    
    // Fall back to mock mode if there's a critical error
    firebaseApp = { name: '[DEFAULT]', options: config };
    firebaseAuth = createMockAuth();
  }

  return { app: firebaseApp, auth: firebaseAuth };
};

// Export a function that ensures Firebase is initialized
export const getFirebase = () => {
  return initializeFirebase();
};

// Export app and auth for compatibility
export const app = (() => {
  const { app } = getFirebase();
  return app;
})();

export const auth = (() => {
  const { auth } = getFirebase();
  return auth;
})();

// Export auth state change monitoring
export const onAuthStateChange = (callback: (user: any) => void) => {
  const { auth } = getFirebase();
  if (!auth) {
    console.warn('Firebase auth not initialized, cannot set up auth state change listener');
    return;
  }
  
  return auth.onAuthStateChanged(callback);
};