// Final fixed runtime Firebase configuration for Dokploy deployment
// Properly handles URL-encoded template syntax

let firebaseApp: any = null;
let firebaseAuth: any = null;

// Check if a value contains Dokploy template syntax (including URL-encoded versions)
const isDokployTemplate = (value: string | undefined): boolean => {
  if (!value) return false;
  
  // First, check if it's a placeholder value from .env.dokploy
  if (value.includes('REPLACE_WITH_')) {
    return true;
  }
  
  // Check for both regular and URL-encoded template syntax
  const decodedValue = decodeURIComponent(value);
  
  // Only flag as template if it contains actual template syntax, not just any occurrence
  return (
    // Direct template syntax
    (value.includes('${{') && value.includes('}}')) ||
    (value.includes('${environment') && value.includes('}')) ||
    // URL-encoded template syntax
    (value.includes('%24%7B%7B') && value.includes('%7D%7D')) ||
    // Decoded template syntax
    (decodedValue.includes('${{') && decodedValue.includes('}}')) ||
    (decodedValue.includes('${environment') && decodedValue.includes('}'))
  );
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
    apiKeyPreview: rawConfig.apiKey ? rawConfig.apiKey.substring(0, 20) + '...' : 'none'
  });

  // Check each variable individually for template syntax
  const templateAnalysis = Object.entries(rawConfig).map(([key, value]) => ({
    key,
    value,
    hasTemplate: isDokployTemplate(value),
    isValid: value && !isDokployTemplate(value)
  }));

  console.log('🔍 Template analysis:', templateAnalysis.map(({key, hasTemplate, isValid}) => ({
    [key]: hasTemplate ? '❌ CONTAINS TEMPLATE' : (isValid ? '✅ VALID' : '❌ INVALID')
  })));

  // Check if the three essential variables are valid (Firebase can work with just these)
  const essentialVars = ['apiKey', 'authDomain', 'projectId'];
  const essentialValid = essentialVars.filter(varName => {
    const config = templateAnalysis.find(item => item.key === varName);
    return config && config.isValid;
  }).length;

  // Count how many have templates
  const templateCount = templateAnalysis.filter(item => item.hasTemplate).length;
  const validCount = templateAnalysis.filter(item => item.isValid).length;

  // If the three essential variables are valid, we can initialize Firebase
  if (essentialValid === 3) {
    console.log('✅ Essential Firebase variables are valid (apiKey, authDomain, projectId)');
    return rawConfig;
  }

  if (templateCount > 0) {
    console.log(`⚠️ Found ${templateCount} variables with Dokploy template syntax:`);
    templateAnalysis.filter(item => item.hasTemplate).forEach(item => {
      console.log(`   ❌ ${item.key}: ${item.value}`);
    });
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

    // Check if essential variables are valid in window config
    const windowEssentialValid = essentialVars.filter(varName => {
      const value = windowConfig[varName as keyof typeof windowConfig];
      return value && !isDokployTemplate(value);
    }).length;
    
    if (windowEssentialValid === 3) {
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
        const savedEssentialValid = essentialVars.filter(varName => {
          const value = parsed[varName];
          return value && !isDokployTemplate(value);
        }).length;
        
        if (savedEssentialValid === 3) {
          console.log('✅ Using saved Firebase config from localStorage');
          return parsed;
        }
      } catch (e) {
        console.warn('⚠️ Invalid saved Firebase config in localStorage');
      }
    }
  }

  // FAIL SECURELY: Return null and use mock mode
  console.error('❌ No valid Firebase configuration available');
  console.error('Configuration analysis:', {
    totalVariables: templateAnalysis.length,
    validVariables: validCount,
    essentialValid: essentialValid,
    templateVariables: templateCount,
    status: 'Essential variables (apiKey, authDomain, projectId) are either missing or contain template syntax'
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
    console.error('This usually means:');
    console.error('1. Environment variables are not set in Dokploy');
    console.error('2. Environment variables contain placeholder values (REPLACE_WITH_)');
    console.error('3. Environment variables contain unresolved template syntax');
    firebaseApp = { name: '[DEFAULT]', options: {} };
    firebaseAuth = createMockAuth();
    return { app: firebaseApp, auth: firebaseAuth };
  }
  
  console.log('🔍 Runtime Firebase config:', {
    hasApiKey: !!config.apiKey,
    hasAuthDomain: !!config.authDomain,
    hasProjectId: !!config.projectId,
    apiKeyPreview: config.apiKey ? `${config.apiKey.substring(0, 10)}...` : 'none',
    authDomain: config.authDomain,
    projectId: config.projectId
  });

  try {
    // Import Firebase modules dynamically
    const { initializeApp } = require('firebase/app');
    const { getAuth } = require('firebase/auth');
    
    firebaseApp = initializeApp(config);
    firebaseAuth = getAuth(firebaseApp);
    console.log('✅ Firebase initialized successfully at runtime');
    console.log('🔗 Firebase app name:', firebaseApp.name);
  } catch (error) {
    console.error('❌ Runtime Firebase initialization failed:', error);
    console.error('This could be due to:');
    console.error('1. Invalid Firebase configuration values');
    console.error('2. Network connectivity issues');
    console.error('3. Firebase service unavailability');
    
    // Only fall back to mock mode if there's a critical error
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