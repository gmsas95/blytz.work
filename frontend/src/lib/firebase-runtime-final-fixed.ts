// Final fixed Firebase configuration for Dokploy with proper URL decoding
let firebaseApp: any = null;
let firebaseAuth: any = null;

// Decode URL-encoded values from Dokploy
const decodeDokployValue = (value: string | undefined): string => {
  if (!value) return '';
  try {
    return decodeURIComponent(value);
  } catch {
    return value; // Return original if decoding fails
  }
};

// Check if a value contains Dokploy template syntax (both regular and URL-encoded)
const isDokployTemplate = (value: string | undefined): boolean => {
  if (!value) return false;
  
  // First, check if it's a placeholder value from .env.dokploy
  if (value.includes('REPLACE_WITH_')) {
    return true;
  }
  
  // Check for both regular and URL-encoded template syntax
  const decodedValue = decodeDokployValue(value);
  
  return (
    // Direct template syntax
    (value.includes('${{') && value.includes('}')) ||
    (value.includes('${environment') && value.includes('}')) ||
    // URL-encoded template syntax
    (value.includes('%24%7B%7D') && value.includes('%7D%7D')) ||
    // Decoded template syntax
    (decodedValue.includes('${{') && decodedValue.includes('}')) ||
    (decodedValue.includes('${environment') && decodedValue.includes('}'))
  );
};

// Get Firebase config with proper Dokploy template handling
const getFirebaseConfig = () => {
  // Get raw environment variables
  const rawConfig = {
    apiKey: decodeDokployValue(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
    authDomain: decodeDokployValue(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
    projectId: decodeDokployValue(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
    storageBucket: decodeDokployValue(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
    messagingSenderId: decodeDokployValue(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
    appId: decodeDokployValue(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
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

  // Check if three essential variables are valid (Firebase can work with just these)
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
    console.error('This usually means:');
    console.error('1. Environment variables are not set in Dokploy');
    console.error('2. Environment variables contain placeholder values (REPLACE_WITH_)');
    console.error('3. Environment variables contain unresolved template syntax');
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