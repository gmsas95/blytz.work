import { getEnvVar } from '../utils/envValidator.js';

// Handle both literal \n and single-line formats for private key
let privateKey = getEnvVar('FIREBASE_PRIVATE_KEY');

if (privateKey && privateKey.includes('\\n')) {
  privateKey = privateKey.replace(/\\n/g, '\n');
} else if (privateKey && !privateKey.includes('\n')) {
  // Handle single-line key format
  privateKey = privateKey.replace(/-----BEGIN PRIVATE KEY-----/, '-----BEGIN PRIVATE KEY-----\n');
  privateKey = privateKey.replace(/-----END PRIVATE KEY-----/, '\n-----END PRIVATE KEY-----');
  
  // Add newlines every 64 characters for key content
  const keyContent = privateKey.match(/-----BEGIN PRIVATE KEY-----(.+)-----END PRIVATE KEY-----/s);
  if (keyContent && keyContent[1]) {
    const keyParts = keyContent[1].match(/.{1,64}/g);
    if (keyParts) {
      const formattedContent = keyParts.join('\n');
      privateKey = '-----BEGIN PRIVATE KEY-----\n' + formattedContent + '\n-----END PRIVATE KEY-----';
    }
  }
}

export const firebaseConfig = {
  projectId: getEnvVar('FIREBASE_PROJECT_ID'),
  clientEmail: getEnvVar('FIREBASE_CLIENT_EMAIL'),
  privateKey: privateKey,
};

export function validateFirebaseConfig(): void {
  console.log('🔍 Validating Firebase configuration...');
  
  const required = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY'
  ];
  
  let allValid = true;
  
  for (const key of required) {
    try {
      const value = getEnvVar(key);
      const isValid = value && value.trim() !== '' && !value.includes('YOUR_') && !value.includes('REPLACE_WITH_');
      
      if (isValid) {
        if (key.includes('PRIVATE_KEY')) {
          console.log(`✅ ${key}: FOUND (${value.length} characters)`);
        } else if (key.includes('EMAIL')) {
          console.log(`✅ ${key}: FOUND (${value})`);
        } else {
          console.log(`✅ ${key}: FOUND`);
        }
      } else {
        console.error(`❌ ${key}: INVALID OR MISSING`);
        allValid = false;
      }
    } catch (error) {
      console.error(`❌ ${key}: MISSING - ${error instanceof Error ? error.message : 'Unknown error'}`);
      allValid = false;
    }
  }
  
  if (!allValid) {
    console.error('❌ Firebase configuration validation failed');
    console.error('Please check your environment variables and ensure all required Firebase variables are set:');
    console.error('- FIREBASE_PROJECT_ID');
    console.error('- FIREBASE_CLIENT_EMAIL');
    console.error('- FIREBASE_PRIVATE_KEY');
    throw new Error('Firebase configuration validation failed');
  }
  
  // Additional validation for project ID format
  const projectId = firebaseConfig.projectId;
  if (projectId && !projectId.match(/^[a-z0-9-]+$/)) {
    console.warn(`⚠️ Firebase project ID format may be invalid: ${projectId}`);
  }
  
  // Additional validation for client email format
  const clientEmail = firebaseConfig.clientEmail;
  if (clientEmail && !clientEmail.includes('@') && !clientEmail.includes('.iam.gserviceaccount.com')) {
    console.warn(`⚠️ Firebase client email format may be invalid: ${clientEmail}`);
  }
  
  console.log('✅ Firebase configuration validated successfully');
  console.log(`🔗 Project ID: ${projectId}`);
  console.log(`📧 Service Account: ${clientEmail?.split('@')[0]}@...`);
}