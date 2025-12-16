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

  console.log('🔍 Firebase config check:', {
    hasApiKey: !!config.apiKey,
    hasAuthDomain: !!config.authDomain,
    hasProjectId: !!config.projectId,
    apiKeyPreview: config.apiKey ? config.apiKey.substring(0, 10) + '...' : 'missing'
  });

  // Check if essential variables are present
  const essentialVars = ['apiKey', 'authDomain', 'projectId'];
  const hasEssentialVars = essentialVars.every(varName => {
    const value = config[varName as keyof typeof config];
    return value && value.trim() !== '' && !value.includes('REPLACE_WITH_');
  });

  if (hasEssentialVars) {
    console.log('✅ Firebase configuration is valid');
    return config;
  }

  console.error('❌ Firebase configuration is incomplete');
  console.error('Missing essential variables:', essentialVars.filter(varName => {
    const value = config[varName as keyof typeof config];
    return !value || value.trim() === '' || value.includes('REPLACE_WITH_');
  }));
  
  return null;
};

// Mock Firebase services for when config is missing
const createMockAuth = () => {
  console.log('🔧 Using mock Firebase auth - configuration incomplete');
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
    console.error('❌ Cannot initialize Firebase - configuration incomplete');
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
    console.error('❌ Firebase initialization failed:', error);
    firebaseApp = { name: '[DEFAULT]', options: config };
    firebaseAuth = createMockAuth();
  }

  return { app: firebaseApp, auth: firebaseAuth };
};

// Export a function that ensures Firebase is initialized
export const getFirebase = () => {
  return initializeFirebase();
};

// Export auth state change monitoring
export const onAuthStateChange = (callback: (user: any) => void) => {
  const { auth } = getFirebase();
  if (!auth) {
    console.warn('Auth not available for state monitoring');
    return () => {}; // Return unsubscribe function
  }
  
  // Import onAuthStateChanged dynamically
  try {
    const { onAuthStateChanged } = require('firebase/auth');
    return onAuthStateChanged(auth, callback);
  } catch (error) {
    console.error('Failed to setup auth state monitoring:', error);
    return () => {}; // Return unsubscribe function
  }
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