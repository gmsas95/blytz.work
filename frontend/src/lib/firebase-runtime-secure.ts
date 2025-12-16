// Secure runtime Firebase configuration for Dokploy deployment
// IMPORTANT: Never hardcode credentials in production code

let firebaseApp: any = null;
let firebaseAuth: any = null;

// Get Firebase config from environment or secure sources
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

  // Source 2: Runtime configuration from secure endpoint
  if (typeof window !== 'undefined') {
    // Try to get config from a secure API endpoint or localStorage
    const savedConfig = localStorage.getItem('firebaseConfig');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        if (parsed.apiKey && parsed.authDomain && parsed.projectId) {
          console.log('✅ Using saved Firebase config from localStorage');
          return parsed;
        }
      } catch (e) {
        console.warn('⚠️ Invalid saved Firebase config');
      }
    }
  }

  // Source 3: Configuration API endpoint (recommended for production)
  if (typeof window !== 'undefined') {
    console.log('🔍 Attempting to fetch Firebase config from API...');
    // This would typically call your backend to get secure config
    // For now, we'll fail gracefully
  }

  // FAIL SECURELY: Return null instead of hardcoded credentials
  console.error('❌ No valid Firebase configuration available');
  console.error('Environment status:', {
    hasApiKey: !!envConfig.apiKey,
    hasAuthDomain: !!envConfig.authDomain,
    hasProjectId: !!envConfig.projectId,
    hasTemplate: hasDokployTemplate
  });
  
  return null;
};

// Mock Firebase services for when config is missing
const createMockAuth = () => {
  console.log('🔧 Using mock Firebase auth - no valid configuration available');
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
  
  console.log('🔍 Runtime Firebase config:', {
    hasApiKey: !!config.apiKey,
    hasAuthDomain: !!config.authDomain,
    hasProjectId: !!config.projectId,
    apiKeyPreview: config.apiKey ? `${config.apiKey.substring(0, 10)}...` : 'none'
  });

  try {
    // Import Firebase modules dynamically
    const { initializeApp } = require('firebase/app');
    const { getAuth } = require('firebase/auth');
    
    firebaseApp = initializeApp(config);
    firebaseAuth = getAuth(firebaseApp);
    console.log('✅ Firebase initialized successfully at runtime');
  } catch (error) {
    console.error('❌ Runtime Firebase initialization failed:', error);
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