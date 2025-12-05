// Runtime Firebase configuration for Dokploy deployment
// This attempts to load Firebase config at runtime instead of build time

let firebaseApp: any = null;
let firebaseAuth: any = null;

// Fallback Firebase configuration (your real config)
const FALLBACK_CONFIG = {
  apiKey: "AIzaSyDy63cQFqr6DT7_y9pmhgASd8NX5GW0oio",
  authDomain: "blytz-hyred.firebaseapp.com",
  projectId: "blytz-hyred",
  storageBucket: "blytz-hyred.appspot.com",
  messagingSenderId: "100201094663",
  appId: "1:100201094663:web:d78f0857db3c1dcda8d4a2"
};

// Try to get Firebase config from various sources
const getFirebaseConfig = () => {
  // Source 1: Environment variables (standard Next.js)
  const envConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  // Check if any env vars contain Dokploy template syntax
  const hasDokployTemplate = Object.values(envConfig).some(val => 
    val && (val.includes('${environment') || val.includes('$${environment'))
  );

  if (!hasDokployTemplate && envConfig.apiKey && envConfig.authDomain && envConfig.projectId) {
    console.log('✅ Using environment variables for Firebase config');
    return envConfig;
  }

  // Source 2: Use fallback config (your real Firebase config)
  console.log('⚠️ Using fallback Firebase config - environment variables not available or contain templates');
  return FALLBACK_CONFIG;
};

// Initialize Firebase at runtime
const initializeFirebase = () => {
  if (firebaseApp && firebaseAuth) {
    return { app: firebaseApp, auth: firebaseAuth };
  }

  const config = getFirebaseConfig();
  
  console.log('🔍 Runtime Firebase config:', {
    hasApiKey: !!config.apiKey,
    hasAuthDomain: !!config.authDomain,
    hasProjectId: !!config.projectId,
    apiKeyPreview: config.apiKey ? `${config.apiKey.substring(0, 10)}...` : 'none'
  });

  if (config.apiKey && config.authDomain && config.projectId) {
    try {
      // Import Firebase modules
      const { initializeApp } = require('firebase/app');
      const { getAuth } = require('firebase/auth');
      
      firebaseApp = initializeApp(config);
      firebaseAuth = getAuth(firebaseApp);
      console.log('✅ Firebase initialized successfully at runtime');
    } catch (error) {
      console.error('❌ Runtime Firebase initialization failed:', error);
    }
  } else {
    console.error('❌ Invalid Firebase configuration for runtime initialization');
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