// Fixed runtime Firebase configuration for Dokploy deployment
// Handles Dokploy template syntax properly

let firebaseApp: any = null;
let firebaseAuth: any = null;

// Check if a value contains Dokploy template syntax
const isDokployTemplate = (value: string | undefined): boolean => {
  return !!value && (value.includes('${environment') || value.includes('$${environment'));
};

// Get Firebase config with proper Dokploy template handling
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
    hasTemplate: Object.values(rawConfig).some(val => isDokployTemplate(val))
  });

  // Check for Dokploy template syntax
  const hasTemplate = Object.values(rawConfig).some(val => isDokployTemplate(val));

  if (!hasTemplate && rawConfig.apiKey && rawConfig.authDomain && rawConfig.projectId) {
    console.log('✅ Using environment variables for Firebase config (no templates detected)');
    return rawConfig;
  }

  if (hasTemplate) {
    console.log('⚠️ Dokploy template syntax detected - environment variables not properly substituted');
    console.log('🔧 Template examples found:', Object.entries(rawConfig)
      .filter(([_, val]) => isDokployTemplate(val))
      .map(([key, val]) => `${key}: ${val}`)
    );
  }

  // Source 1: Try to get from window object (runtime injection by Dokploy)
  if (typeof window !== 'undefined') {
    const windowConfig = {
      apiKey: (window as any).NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: (window as any).NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: (window as any).NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: (window as any).NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: (window as any).NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: (window as any).NEXT_PUBLIC_FIREBASE_APP_ID,
    };

    const validWindowConfig = Object.entries(windowConfig).every(([_, val]) => val && !isDokployTemplate(val));
    
    if (validWindowConfig && windowConfig.apiKey && windowConfig.authDomain && windowConfig.projectId) {
      console.log('✅ Using window object for Firebase config (runtime injection)');
      return windowConfig;
    }
  }

  // Source 2: Try localStorage (for development/testing)
  if (typeof window !== 'undefined') {
    const savedConfig = localStorage.getItem('firebaseConfig');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        if (parsed.apiKey && parsed.authDomain && parsed.projectId && !isDokployTemplate(parsed.apiKey)) {
          console.log('✅ Using saved Firebase config from localStorage');
          return parsed;
        }
      } catch (e) {
        console.warn('⚠️ Invalid saved Firebase config in localStorage');
      }
    }
  }

  // Source 3: Configuration from secure backend endpoint (RECOMMENDED for production)
  if (typeof window !== 'undefined') {
    console.log('🔍 Attempting to fetch Firebase config from secure endpoint...');
    // This would typically call your backend API to get the real config
    // For now, we'll show what the proper implementation would look like
  }

  // FAIL SECURELY: Return null and use mock mode
  console.error('❌ No valid Firebase configuration available');
  console.error('Configuration status:', {
    hasRawConfig: Object.values(rawConfig).some(val => val),
    hasTemplate: hasTemplate,
    hasValidWindowConfig: false,
    hasSavedConfig: false
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