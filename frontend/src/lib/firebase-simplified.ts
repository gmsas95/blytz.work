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
  emptyVars: string[];
  config: FirebaseConfig | null;
}

// Store validation result globally for debugging
let lastValidationResult: ValidationResult | null = null;

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
  const emptyVars: string[] = [];
  const config: any = {};

  // Check required variables - use direct access for Next.js build-time replacement
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  };

  // Validate required variables
  for (const varName of requiredVars) {
    const configKey = varName.replace('NEXT_PUBLIC_FIREBASE_', '')
      .toLowerCase()
      .split('_')
      .map((word, index) => index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
      .join('') as keyof typeof firebaseConfig;
    
    const value = firebaseConfig[configKey];
    if (value === undefined) {
      missingVars.push(varName);
    } else if (value === '') {
      emptyVars.push(varName);
    } else if (value.includes('${{') || value.includes('${environment') || value.includes('REPLACE_WITH_')) {
      invalidVars.push(varName);
    } else {
      config[configKey] = value;
    }
  }

  // Check optional variables
  for (const varName of optionalVars) {
    const configKey = varName.replace('NEXT_PUBLIC_FIREBASE_', '')
      .toLowerCase()
      .split('_')
      .map((word, index) => index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
      .join('') as keyof typeof firebaseConfig;
    
    const value = firebaseConfig[configKey];
    if (value && !value.includes('${{') && !value.includes('${environment') && !value.includes('REPLACE_WITH_')) {
      config[configKey] = value;
    }
  }

  const isValid = missingVars.length === 0 && invalidVars.length === 0 && emptyVars.length === 0;

  const result: ValidationResult = {
    isValid,
    missingVars,
    invalidVars,
    emptyVars,
    config: isValid ? config as FirebaseConfig : null
  };

  lastValidationResult = result;
  return result;
}

// Mock Firebase auth for development without configuration
function createMockAuth() {
  console.warn('🔧 Using mock Firebase auth - authentication will not work in production');
  
  // Build detailed error message from validation result
  const buildErrorMessage = () => {
    if (!lastValidationResult) {
      return 'Firebase authentication is not configured (no validation result)';
    }

    const errors: string[] = [];
    
    if (lastValidationResult.missingVars.length > 0) {
      errors.push(`Missing environment variables:\n  - ${lastValidationResult.missingVars.join('\n  - ')}`);
    }
    
    if (lastValidationResult.emptyVars.length > 0) {
      errors.push(`Empty environment variables (set but no value):\n  - ${lastValidationResult.emptyVars.join('\n  - ')}`);
    }
    
    if (lastValidationResult.invalidVars.length > 0) {
      errors.push(`Invalid environment variables (contain template syntax):\n  - ${lastValidationResult.invalidVars.join('\n  - ')}`);
    }

    if (errors.length === 0) {
      return 'Firebase authentication is not configured (unknown error)';
    }

    return `Firebase authentication failed:\n\n${errors.join('\n\n')}\n\nTo fix:\n1. Check your Dokploy environment variables\n2. Ensure all required variables are set with actual values\n3. Restart the application after updating variables\n\nRequired variables:\n- NEXT_PUBLIC_FIREBASE_API_KEY\n- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN\n- NEXT_PUBLIC_FIREBASE_PROJECT_ID`;
  };

  const errorMessage = buildErrorMessage();

  return {
    currentUser: null,
    onAuthStateChanged: (callback: Function) => {
      console.log('🔧 Mock onAuthStateChanged called');
      console.error(errorMessage);
      callback(null);
      return () => {}; // Unsubscribe function
    },
    signInWithEmailAndPassword: async (email: string, password: string) => {
      console.log('🔧 Mock signInWithEmailAndPassword called for:', email);
      console.error(errorMessage);
      throw new Error(errorMessage);
    },
    createUserWithEmailAndPassword: async (email: string, password: string) => {
      console.log('🔧 Mock createUserWithEmailAndPassword called for:', email);
      console.error(errorMessage);
      throw new Error(errorMessage);
    },
    signInWithPopup: async (provider: any) => {
      console.log('🔧 Mock signInWithPopup called with provider:', provider?.providerId || 'unknown');
      console.error(errorMessage);
      throw new Error(errorMessage);
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
  console.log('🌍 Running in:', process.env.NODE_ENV || 'development');
  
  // Debug: Show environment variable status
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  };

  console.log('📋 Environment variable status:');
  const varMapping = {
    'NEXT_PUBLIC_FIREBASE_API_KEY': firebaseConfig.apiKey,
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN': firebaseConfig.authDomain,
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID': firebaseConfig.projectId,
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET': firebaseConfig.storageBucket,
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID': firebaseConfig.messagingSenderId,
    'NEXT_PUBLIC_FIREBASE_APP_ID': firebaseConfig.appId
  };

  Object.entries(varMapping).forEach(([varName, value]) => {
    if (value === undefined) {
      console.log(`  ❌ ${varName}: NOT SET`);
    } else if (value === '') {
      console.log(`  ⚠️  ${varName}: EMPTY`);
    } else if (value.includes('${{') || value.includes('${environment') || value.includes('REPLACE_WITH_')) {
      console.log(`  ❌ ${varName}: CONTAINS TEMPLATE SYNTAX`);
      console.log(`     Value preview: ${value?.substring(0, 50)}...`);
    } else {
      // Mask sensitive values
      const masked = varName.includes('API_KEY') || varName.includes('PRIVATE_KEY')
        ? `${value?.substring(0, 8)}...${value?.substring(value.length - 4)}`
          : value;
      console.log(`  ✅ ${varName}: ${masked}`);
    }
  });
  
  const validation = validateFirebaseConfig();
  
  if (!validation.isValid) {
    console.error('❌ Firebase configuration is invalid:');
    
    if (validation.missingVars.length > 0) {
      console.error('Missing environment variables:');
      validation.missingVars.forEach(varName => {
        console.error(`  - ${varName}`);
      });
    }
    
    if (validation.emptyVars.length > 0) {
      console.error('Empty environment variables (set but no value):');
      validation.emptyVars.forEach(varName => {
        console.error(`  - ${varName}`);
      });
    }
    
    if (validation.invalidVars.length > 0) {
      console.error('Invalid environment variables (contain template syntax):');
      validation.invalidVars.forEach(varName => {
        const value = process.env[varName];
        console.error(`  - ${varName}`);
        console.error(`     Preview: ${value ? value.substring(0, 100) : 'undefined'}...`);
      });
    }
    
    console.error('\n🔧 To fix this issue:');
    console.error('1. Set required environment variables in Dokploy');
    console.error('2. Ensure variables contain actual Firebase values, not template syntax');
    console.error('3. Restart the application after setting the variables');
    console.error('4. Verify Dokploy is properly injecting the variables');
    console.error('\n📝 Required variables:');
    console.error('   - NEXT_PUBLIC_FIREBASE_API_KEY');
    console.error('   - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
    console.error('   - NEXT_PUBLIC_FIREBASE_PROJECT_ID');
    
    // Create mock Firebase instance
    firebaseApp = { name: '[MOCK]', options: {} };
    firebaseAuth = createMockAuth();
    
    return { app: firebaseApp, auth: firebaseAuth };
  }

  console.log('✅ Firebase configuration is valid');
  console.log('🔗 Project ID:', validation.config?.projectId);
  console.log('🔗 Auth Domain:', validation.config?.authDomain);
  console.log('🔗 API Key:', validation.config?.apiKey ? `${validation.config.apiKey.substring(0, 8)}...` : 'undefined');
  
  try {
    firebaseApp = initializeApp(validation.config!);
    firebaseAuth = getAuth(firebaseApp);
    console.log('✅ Firebase initialized successfully');
    console.log('🔐 Firebase auth instance created');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase:', error);
    console.error('This might be due to:');
    console.error('1. Invalid Firebase configuration values');
    console.error('2. Network connectivity issues');
    console.error('3. Firebase service unavailability');
    console.error('4. Firebase project disabled or deleted');
    console.error('\n📋 Config that was used:', JSON.stringify(validation.config, null, 2));
    
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

// Debug helper to inspect Firebase configuration
export function debugFirebaseConfig() {
  console.log('🔍 Firebase Configuration Debug:');
  console.log('=================================');
  
  const validation = validateFirebaseConfig();
  
  console.log('\nValidation Result:');
  console.log(`  Valid: ${validation.isValid}`);
  console.log(`  Missing variables: ${validation.missingVars.length}`);
  console.log(`  Empty variables: ${validation.emptyVars.length}`);
  console.log(`  Invalid variables: ${validation.invalidVars.length}`);
  
  if (validation.missingVars.length > 0) {
    console.log('\nMissing Variables:');
    validation.missingVars.forEach(v => console.log(`  - ${v}`));
  }
  
  if (validation.emptyVars.length > 0) {
    console.log('\nEmpty Variables:');
    validation.emptyVars.forEach(v => console.log(`  - ${v}`));
  }
  
  if (validation.invalidVars.length > 0) {
    console.log('\nInvalid Variables:');
    validation.invalidVars.forEach(v => {
      console.log(`  - ${v}`);
      const value = v.includes('API_KEY') ? process.env.NEXT_PUBLIC_FIREBASE_API_KEY :
                   v.includes('AUTH_DOMAIN') ? process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN :
                   v.includes('PROJECT_ID') ? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID :
                   v.includes('STORAGE_BUCKET') ? process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET :
                   v.includes('MESSAGING_SENDER_ID') ? process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID :
                   v.includes('APP_ID') ? process.env.NEXT_PUBLIC_FIREBASE_APP_ID : undefined;
      console.log(`    Value: ${value ? value.substring(0, 100) : 'undefined'}...`);
    });
  }
  
  if (validation.config) {
    console.log('\nFirebase Config:');
    console.log(`  Project ID: ${validation.config.projectId}`);
    console.log(`  Auth Domain: ${validation.config.authDomain}`);
    console.log(`  API Key: ${validation.config.apiKey ? validation.config.apiKey.substring(0, 8) : 'undefined'}...`);
    if (validation.config.storageBucket) {
      console.log(`  Storage Bucket: ${validation.config.storageBucket}`);
    }
    if (validation.config.appId) {
      console.log(`  App ID: ${validation.config.appId}`);
    }
  }
  
  console.log('\nEnvironment:');
  console.log(`  Node Environment: ${process.env.NODE_ENV || 'undefined'}`);
  console.log(`  Running in browser: ${typeof window !== 'undefined'}`);
  
  console.log('\n=================================');
  
  return validation;
}