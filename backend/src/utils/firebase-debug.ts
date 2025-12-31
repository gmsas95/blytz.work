// Debug logging for Firebase configuration
import { validateFirebaseConfig } from '../config/firebaseConfig-simplified.js';

console.log('=== Firebase Configuration Debug ===');
console.log('Environment variables loaded:');
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? 'SET' : 'NOT SET');
console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? 'SET' : 'NOT SET');
console.log('FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? `${process.env.FIREBASE_PRIVATE_KEY.substring(0, 20)}...` : 'NOT SET');
console.log('');

const validation = validateFirebaseConfig();
if (validation.isValid) {
  console.log('✅ Firebase configuration is VALID');
  console.log('Project ID:', validation.config!.projectId);
  console.log('');
} else {
  console.log('❌ Firebase configuration is INVALID');
  if (validation.missingVars.length > 0) {
    console.log('Missing variables:', validation.missingVars);
  }
  if (validation.invalidVars.length > 0) {
    console.log('Invalid variables (contain placeholders):', validation.invalidVars);
  }
}

// Export for use in server startup
export function logFirebaseDebug() {
  const validation = validateFirebaseConfig();
  if (!validation.isValid) {
    console.warn('');
    console.warn('⚠️  FIREBASE CONFIGURATION WARNING ⚠️');
    console.warn('');
    console.warn('The Firebase configuration appears to have placeholder values.');
    console.warn('Please ensure your dokploy environment variables contain actual Firebase credentials.');
    console.warn('');
    console.warn('Expected variables:');
    console.warn('  - FIREBASE_PROJECT_ID');
    console.warn('  - FIREBASE_CLIENT_EMAIL');
    console.warn('  - FIREBASE_PRIVATE_KEY');
    console.warn('');
  }
}
