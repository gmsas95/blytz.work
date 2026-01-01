// Simplified Firebase Admin configuration for reliable authentication
// Eliminates complex fallback mechanisms for robust deployment

import admin from 'firebase-admin';

// Firebase configuration interface
interface FirebaseAdminConfig {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

// Configuration validation result
interface ValidationResult {
  isValid: boolean;
  missingVars: string[];
  invalidVars: string[];
  config: FirebaseAdminConfig | null;
}

// Validate Firebase Admin configuration
function validateFirebaseConfig(): ValidationResult {
  const requiredVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY'
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
      const configKey = varName.replace('FIREBASE_', '').toLowerCase();
      config[configKey] = varName === 'FIREBASE_PRIVATE_KEY' ? value.replace(/\\n/g, '\n') : value;
    }
  }

  const isValid = missingVars.length === 0 && invalidVars.length === 0;

  return {
    isValid,
    missingVars,
    invalidVars,
    config: isValid ? config as FirebaseAdminConfig : null
  };
}

// Initialize Firebase Admin with simplified configuration
let firebaseAdmin: admin.app.App | null = null;

export function initializeFirebaseAdmin(): admin.app.App {
  if (firebaseAdmin) {
    return firebaseAdmin;
  }

  console.log('🔍 Initializing Firebase Admin with simplified configuration...');
  
  const validation = validateFirebaseConfig();
  
  if (!validation.isValid) {
    console.error('❌ Firebase Admin configuration is invalid:');
    
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
    console.error('1. Set the required environment variables in your deployment environment');
    console.error('2. Ensure variables contain actual values, not template syntax');
    console.error('3. Restart your application after setting the variables');
    
    throw new Error('Firebase Admin configuration is invalid. Check server logs for details.');
  }

  console.log('✅ Firebase Admin configuration is valid');
  console.log('🔗 Project ID:', validation.config!.projectId);
  
  console.log('🔧 Service account object being created...');
  console.log('  projectId:', validation.config!.projectId);
  console.log('  clientEmail:', validation.config!.clientEmail);
  console.log('  has privateKey:', !!validation.config!.privateKey);

  try {
    // Firebase Admin SDK requires snake_case keys for service account credential
    const serviceAccount: any = {
      project_id: validation.config!.projectId,
      client_email: validation.config!.clientEmail,
      private_key: validation.config!.privateKey,
    };

    console.log('✅ Service account object created:', JSON.stringify({
      project_id: '***', // masked for logs
      client_email: validation.config!.clientEmail,
      private_key: validation.config!.privateKey ? '***PRESENT***' : 'undefined',
    }));

    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error);
    console.error('This might be due to:');
    console.error('1. Invalid Firebase configuration values');
    console.error('2. Network connectivity issues');
    console.error('3. Firebase service unavailability');
    
    throw new Error(`Failed to initialize Firebase Admin: ${error}`);
  }

  return firebaseAdmin;
}

// Export function to get Firebase Admin instance
export function getFirebaseAdmin(): admin.app.App {
  if (!firebaseAdmin) {
    return initializeFirebaseAdmin();
  }
  return firebaseAdmin;
}

// Export authentication functions for convenience
export function getAuth(): admin.auth.Auth {
  return admin.auth(getFirebaseAdmin());
}

// Export validation function for debugging
export { validateFirebaseConfig };

// Export the Firebase admin instance for direct access
export { firebaseAdmin };