import { getEnvVar } from '../utils/envValidator.js';

export const firebaseConfig = {
  projectId: getEnvVar('FIREBASE_PROJECT_ID'),
  clientEmail: getEnvVar('FIREBASE_CLIENT_EMAIL'),
  privateKey: getEnvVar('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
};

export function validateFirebaseConfig(): void {
  console.log('🔍 Validating Firebase configuration...');
  
  const required = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL', 
    'FIREBASE_PRIVATE_KEY'
  ];
  
  for (const key of required) {
    try {
      const value = getEnvVar(key);
      console.log(`✅ ${key}: ${value ? 'FOUND' : 'MISSING'}`);
    } catch (error) {
      console.error(`❌ ${key}: MISSING`);
      throw error;
    }
  }
  
  console.log('✅ Firebase configuration validated successfully');
}