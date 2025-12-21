// Simplified Firebase configuration for reliable authentication
// Eliminates complex template syntax detection for robust deployment

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase configuration interface
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

// Configuration validation result
interface ValidationResult {
  isValid: boolean;
  missingVars: string[];
  invalidVars: string[];
  config: FirebaseConfig | null;
}

// Validate Firebase configuration
function validateFirebaseConfig(): ValidationResult {
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
  ];

  const optionalVars = [
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ];

  const missingVars: string[] = [];
  const invalidVars: string[] = [];
  const config: any = {};

  // Check required variables
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value) {
      missingVars.push(varName);
    } else if (value.includes('${{') || value.includes('${environment') || value.includes('REPLACE_WITH_')) {
      invalidVars.push(varName);
    } else {
      // Convert env var name to config key
      const configKey = varName.replace('NEXT_PUBLIC_FIREBASE_', '').toLowerCase();
      config[configKey] = value;
    }
  }

  // Check optional variables
  for (const varName of optionalVars) {
    const value = process.env[varName];
    if (value && !value.includes('${{') && !value.includes('${environment') && !value.includes('REPLACE_WITH_')) {
      const configKey = varName.replace('NEXT_PUBLIC_FIREBASE_', '').toLowerCase();
      config[configKey] = value;
    }
  }

  const isValid = missingVars.length === 0 && invalidVars.length === 0;

  return {
    isValid,
    missingVars,
    invalidVars,
    config: isValid ? config as FirebaseConfig : null
  };
}

// Mock Firebase auth for development without configuration
function createMockAuth() {
  console.warn('🔧 Using mock Firebase auth - authentication will not work in production');
  return {
    currentUser: null,
    onAuthStateChanged: (callback: Function) => {
      console.log('🔧 Mock onAuthStateChanged called');
      callback(null);
      return () => {}; // Unsubscribe function
    },
    signInWithEmailAndPassword: async (email: string, password: string) => {
      console.log('🔧 Mock signInWithEmailAndPassword called');
      throw new Error('Firebase authentication is not configured');
    },
    createUserWithEmailAndPassword: async (email: string, password: string) => {
      console.log('🔧 Mock createUserWithEmailAndPassword called');
      throw new Error('Firebase authentication is not configured');
    },
    signInWithPopup: async (provider: any) => {
      console.log('🔧 Mock signInWithPopup called');
      throw new Error('Firebase authentication is not configured');
    },
    signOut: async () => {
      console.log('🔧 Mock signOut called');
    },
  };
}

// Initialize Firebase with simplified configuration
let firebaseApp: any = null;
let firebaseAuth: any = null;

export function initializeFirebase() {
  if (firebaseApp && firebaseAuth) {
    return { app: firebaseApp, auth: firebaseAuth };
  }

  console.log('🔍 Initializing Firebase with simplified configuration...');
  
  const validation = validateFirebaseConfig();
  
  if (!validation.isValid) {
    console.error('❌ Firebase configuration is invalid:');
    
    if (validation.missingVars.length > 0) {
      console.error('Missing environment variables:');
      validation.missingVars.forEach(varName => {
        console.error(`  - ${varName}`);
      });
    }
    
    if (validation.invalidVars.length > 0) {
      console.error('Invalid environment variables (contain template syntax):');
      validation.invalidVars.forEach(varName => {
        console.error(`  - ${varName}`);
      });
    }
    
    console.error('\nTo fix this issue:');
    console.error('1. Set required environment variables in your deployment environment');
    console.error('2. Ensure variables contain actual values, not template syntax');
    console.error('3. Restart your application after setting the variables');
    
    // Create mock Firebase instance
    firebaseApp = { name: '[MOCK]', options: {} };
    firebaseAuth = createMockAuth();
    
    return { app: firebaseApp, auth: firebaseAuth };
  }

  console.log('✅ Firebase configuration is valid');
  console.log('🔗 Project ID:', validation.config!.projectId);
  console.log('🔗 Auth Domain:', validation.config!.authDomain);
  
  try {
    firebaseApp = initializeApp(validation.config!);
    firebaseAuth = getAuth(firebaseApp);
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase:', error);
    console.error('This might be due to:');
    console.error('1. Invalid Firebase configuration values');
    console.error('2. Network connectivity issues');
    console.error('3. Firebase service unavailability');
    
    // Fall back to mock Firebase
    firebaseApp = { name: '[MOCK]', options: validation.config };
    firebaseAuth = createMockAuth();
  }

  return { app: firebaseApp, auth: firebaseAuth };
}

// Export functions to get Firebase instances
export function getFirebase() {
  return initializeFirebase();
}

// Export individual instances for compatibility
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

// Export validation function for debugging
export { validateFirebaseConfig };