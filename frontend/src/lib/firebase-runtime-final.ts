// Final Firebase configuration for Dokploy deployment
let firebaseApp: any = null;
let firebaseAuth: any = null;

// Get Firebase config from environment
const getFirebaseConfig = () => {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };

  // During build time, environment variables might not be available
  // Only log during runtime (when window is available)
  if (typeof window !== 'undefined' || process.env.NODE_ENV === 'development') {
    console.log('🔍 Firebase config check:', {
      hasApiKey: !!config.apiKey,
      hasAuthDomain: !!config.authDomain,
      hasProjectId: !!config.projectId,
      apiKeyPreview: config.apiKey ? '[REDACTED]' : 'missing'
    });
  }

  // Check if essential variables are present
  const essentialVars = ['apiKey', 'authDomain', 'projectId'];
  const hasEssentialVars = essentialVars.every(varName => {
    const value = config[varName as keyof typeof config];
    return value && value.trim() !== '' && !value.includes('REPLACE_WITH_');
  });

  // During build time, return null silently if config is incomplete
  if (!hasEssentialVars) {
    if (typeof window !== 'undefined' || process.env.NODE_ENV === 'development') {
      console.error('❌ Firebase configuration is incomplete');
      console.error('Missing essential variables:', essentialVars.filter(varName => {
        const value = config[varName as keyof typeof config];
        return !value || value.trim() === '' || value.includes('REPLACE_WITH_');
      }));
    }
    return null;
  }

  if (typeof window !== 'undefined' || process.env.NODE_ENV === 'development') {
    console.log('✅ Firebase configuration is valid');
  }
  return config;
};


// Initialize Firebase at runtime
export const initializeFirebase = () => {
  if (firebaseApp && firebaseAuth) {
    return { app: firebaseApp, auth: firebaseAuth };
  }

  const config = getFirebaseConfig();
  
  if (!config) {
    const error = new Error('Firebase configuration is incomplete. Please check environment variables.');
    if (typeof window !== 'undefined' || process.env.NODE_ENV === 'development') {
      console.error('❌ Cannot initialize Firebase - configuration incomplete');
      console.error('Required environment variables:');
      console.error('- NEXT_PUBLIC_FIREBASE_API_KEY');
      console.error('- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
      console.error('- NEXT_PUBLIC_FIREBASE_PROJECT_ID');
    }
    throw error;
  }

  try {
    // Import Firebase modules dynamically
    const { initializeApp } = require('firebase/app');
    const { getAuth, connectAuthEmulator } = require('firebase/auth');
    
    firebaseApp = initializeApp(config);
    firebaseAuth = getAuth(firebaseApp);
    
    // Add additional debugging for auth instance
    if (typeof window !== 'undefined' || process.env.NODE_ENV === 'development') {
      console.log('✅ Firebase initialized successfully');
      console.log('🔗 Firebase app name:', firebaseApp.name);
      console.log('🔍 Auth settings:', {
        apiKey: config.apiKey ? 'present' : 'missing',
        authDomain: config.authDomain || 'missing',
        projectId: config.projectId || 'missing'
      });
    }
  } catch (error) {
    if (typeof window !== 'undefined' || process.env.NODE_ENV === 'development') {
      console.error('❌ Firebase initialization failed:', error);
    }
    throw new Error(`Firebase initialization failed: ${error.message}`);
  }

  return { app: firebaseApp, auth: firebaseAuth };
};

// Export a function that ensures Firebase is initialized
export const getFirebase = () => {
  return initializeFirebase();
};

// Export auth state change monitoring
export const onAuthStateChange = (callback: (user: any) => void) => {
  try {
    const { auth } = getFirebase();
    if (!auth) {
      throw new Error('Firebase auth not initialized');
    }
    
    // Import onAuthStateChanged dynamically
    const { onAuthStateChanged } = require('firebase/auth');
    return onAuthStateChanged(auth, callback);
  } catch (error) {
    if (typeof window !== 'undefined' || process.env.NODE_ENV === 'development') {
      console.error('Failed to setup auth state monitoring:', error);
    }
    throw error;
  }
};

// Export app and auth for compatibility - direct initialization
export const app = initializeFirebase().app;
export const auth = initializeFirebase().auth;