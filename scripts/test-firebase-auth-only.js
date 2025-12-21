#!/usr/bin/env node

// Test script for Firebase authentication only (without database)
// This script tests just the Firebase Admin SDK initialization

require('dotenv').config();

console.log('🔧 Testing Firebase Authentication Only');
console.log('===================================');

// Test Firebase Admin SDK initialization
async function testFirebaseAdmin() {
  try {
    // Change to backend directory to access its node_modules
    const path = require('path');
    process.chdir(path.join(__dirname, '..', 'backend'));
    
    const admin = require('firebase-admin');
    
    // Check if already initialized
    if (admin.apps.length > 0) {
      console.log('✅ Firebase Admin already initialized');
      return true;
    }
    
    // Try to initialize with current environment
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    
    console.log('🔍 Firebase private key format check:', {
      hasKey: !!privateKey,
      length: privateKey?.length,
      hasLiteralNewline: privateKey?.includes('\\n'),
      hasActualNewline: privateKey?.includes('\n')
    });
    
    // Apply the same formatting logic as in the plugin
    if (privateKey && privateKey.includes('\\n')) {
      privateKey = privateKey.replace(/\\n/g, '\n');
      console.log('✅ Fixed literal \\n in private key');
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
      console.log('✅ Fixed single-line private key format');
    }
    
    // Additional fix: Ensure proper PEM format for RS256
    if (privateKey && !privateKey.includes('-----BEGIN PRIVATE KEY-----\n')) {
      privateKey = privateKey.replace(/-----BEGIN PRIVATE KEY-----/, '-----BEGIN PRIVATE KEY-----\n');
      privateKey = privateKey.replace(/-----END PRIVATE KEY-----/, '\n-----END PRIVATE KEY-----');
    }
    
    // Remove any extra whitespace or special characters that might cause issues
    if (privateKey) {
      privateKey = privateKey.trim();
      // Ensure proper line endings
      privateKey = privateKey.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    }
    
    console.log('🔍 Attempting Firebase Admin initialization with:', {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      keyLength: privateKey?.length
    });
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: privateKey,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
    
    const auth = admin.auth();
    
    // Test a simple operation
    try {
      await auth.listUsers(1);
      console.log('✅ Firebase Admin SDK working correctly');
      return true;
    } catch (error) {
      console.log('❌ Firebase Admin SDK test failed:', error.message);
      console.log('🔍 Error details:', {
        name: error.name,
        code: error.code,
        stack: error.stack?.substring(0, 200) + '...'
      });
      return false;
    }
    
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error.message);
    console.error('🔍 Error details:', {
      name: error.name,
      code: error.code,
      stack: error.stack?.substring(0, 200) + '...'
    });
    return false;
  }
}

// Test Firebase project accessibility
function testFirebaseProjectAccess() {
  return new Promise((resolve) => {
    const https = require('https');
    const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    
    console.log('🔍 Testing Firebase project access with:', {
      apiKey: FIREBASE_API_KEY?.substring(0, 10) + '...',
      projectId: FIREBASE_PROJECT_ID
    });
    
    const url = `https://identitytoolkit.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}:lookup?key=${FIREBASE_API_KEY}`;
    
    const req = https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Firebase project accessible');
          resolve(true);
        } else if (res.statusCode === 404) {
          console.log('❌ Firebase project not found or API key mismatch');
          console.log('🔍 Response:', data.substring(0, 200));
          resolve(false);
        } else {
          console.log('⚠️ Unexpected status code:', res.statusCode);
          console.log('🔍 Response:', data.substring(0, 200));
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Network error:', error.message);
      resolve(false);
    });
    
    req.end();
  });
}

// Run tests
async function runTests() {
  console.log('\n🚀 Running Firebase authentication tests...\n');
  
  const results = {
    firebaseAdmin: await testFirebaseAdmin(),
    projectAccess: await testFirebaseProjectAccess()
  };
  
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  console.log(`Firebase Admin SDK: ${results.firebaseAdmin ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Firebase Project Access: ${results.projectAccess ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = Object.values(results).every(result => result === true);
  
  if (allPassed) {
    console.log('\n🎉 Firebase authentication is working correctly!');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the errors above.');
    
    if (!results.projectAccess) {
      console.log('\n🔧 Firebase Project Access Issues:');
      console.log('1. Verify project ID in Firebase Console');
      console.log('2. Check API key restrictions in Firebase Console');
      console.log('3. Ensure project is not disabled or deleted');
    }
    
    if (!results.firebaseAdmin) {
      console.log('\n🔧 Firebase Admin SDK Issues:');
      console.log('1. Check private key format');
      console.log('2. Verify service account permissions');
      console.log('3. Ensure service account is active in Firebase Console');
    }
  }
  
  return allPassed;
}

// Run tests
runTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});