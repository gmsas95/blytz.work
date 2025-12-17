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
      hasStorageBucket: !!config.storageBucket,
      hasAppId: !!config.appId,
      apiKeyPreview: config.apiKey ? `${config.apiKey.substring(0, 10)}...` : 'missing',
      authDomain: config.authDomain || 'missing',
      projectId: config.projectId || 'missing',
      appUrl: typeof window !== 'undefined' ? window.location.origin : 'server-side'
    });
  }

  // Check if essential variables are present
  const essentialVars = ['apiKey', 'authDomain', 'projectId'];
  const hasEssentialVars = essentialVars.every(varName => {
    const value = config[varName as keyof typeof config];
    return value && value.trim() !== '' && !value.includes('REPLACE_WITH_') && !value.includes('your-firebase-');
  });

  // During build time, return null silently if config is incomplete
  if (!hasEssentialVars) {
    if (typeof window !== 'undefined' || process.env.NODE_ENV === 'development') {
      console.error('❌ Firebase configuration is incomplete');
      console.error('Missing essential variables:', essentialVars.filter(varName => {
        const value = config[varName as keyof typeof config];
        return !value || value.trim() === '' || value.includes('REPLACE_WITH_') || value.includes('your-firebase-');
      }));
      console.error('Please check your .env file and ensure all Firebase variables are set correctly');
      console.error('Required variables:');
      console.error('- NEXT_PUBLIC_FIREBASE_API_KEY');
      console.error('- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
      console.error('- NEXT_PUBLIC_FIREBASE_PROJECT_ID');
    }
    return null;
  }

  // Additional validation for API key format
  if (config.apiKey && !config.apiKey.startsWith('AIza')) {
    if (typeof window !== 'undefined' || process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Firebase API key format appears invalid (should start with "AIza")');
    }
  }

  // Additional validation for project ID format
  if (config.projectId && !config.projectId.match(/^[a-z0-9-]+$/)) {
    if (typeof window !== 'undefined' || process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Firebase project ID format appears invalid');
    }
  }

  if (typeof window !== 'undefined' || process.env.NODE_ENV === 'development') {
    console.log('✅ Firebase configuration is valid');
    console.log(`🔗 Project: ${config.projectId}`);
    console.log(`🌐 Auth Domain: ${config.authDomain}`);
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
      console.log('🔗 Firebase app options:', {
        apiKey: config.apiKey ? `${config.apiKey.substring(0, 10)}...` : 'missing',
        authDomain: config.authDomain || 'missing',
        projectId: config.projectId || 'missing',
        storageBucket: config.storageBucket || 'missing',
        appId: config.appId ? `${config.appId.substring(0, 10)}...` : 'missing'
      });
      console.log('🔍 Auth instance created:', !!firebaseAuth);
      console.log('🌐 Current origin:', typeof window !== 'undefined' ? window.location.origin : 'server-side');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : 'No stack trace';
    
    if (typeof window !== 'undefined' || process.env.NODE_ENV === 'development') {
      console.error('❌ Firebase initialization failed:', errorMessage);
      console.error('🔍 Error details:', {
        message: errorMessage,
        stack: errorStack,
        config: {
          hasApiKey: !!config.apiKey,
          hasAuthDomain: !!config.authDomain,
          hasProjectId: !!config.projectId,
          projectId: config.projectId || 'missing'
        }
      });
      console.error('💡 Possible solutions:');
      console.error('  1. Check Firebase project configuration in console');
      console.error('  2. Verify API key is valid and not restricted');
      console.error('  3. Ensure project ID matches Firebase console');
      console.error('  4. Check network connectivity to Firebase APIs');
    }
    
    // Provide more specific error messages for common issues
    if (errorMessage.includes('auth-domain-config-required')) {
      throw new Error('Firebase auth domain is missing. Please check NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN in your environment variables.');
    } else if (errorMessage.includes('invalid-api-key')) {
      throw new Error('Firebase API key is invalid. Please check NEXT_PUBLIC_FIREBASE_API_KEY in your environment variables.');
    } else if (errorMessage.includes('project-not-found')) {
      throw new Error('Firebase project not found. Please check NEXT_PUBLIC_FIREBASE_PROJECT_ID in your environment variables.');
    } else {
      throw new Error(`Firebase initialization failed: ${errorMessage}`);
    }
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