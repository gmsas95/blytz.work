#!/usr/bin/env node

// Test script for Firebase authentication fixes (Backend version)
// This script tests both frontend and backend authentication fixes

require('dotenv').config();

const https = require('https');
const path = require('path');

console.log('🔧 Testing Firebase Authentication Fixes (Backend Version)');
console.log('==========================================================');

// Test 1: Check if backend Firebase Admin SDK can initialize
console.log('\n1. Testing Backend Firebase Admin SDK...');

async function testBackendFirebaseAdmin() {
  try {
    // Change to backend directory to access its node_modules
    process.chdir(path.join(__dirname, '..', 'backend'));
    
    const admin = require('firebase-admin');
    
    // Check if already initialized
    if (admin.apps.length > 0) {
      console.log('✅ Firebase Admin already initialized');
      return true;
    }
    
    // Try to initialize with current environment
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    console.log('🔍 Initializing with:', {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      hasPrivateKey: !!privateKey,
      keyLength: privateKey?.length
    });
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
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
      return false;
    }
    
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error.message);
    return false;
  }
}

// Test 2: Check frontend API routes
console.log('\n2. Testing Frontend API Routes...');

async function testFrontendAPI() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
  
  // Test sign-up route
  try {
    const testData = {
      email: `test-${Date.now()}@example.com`,
      password: 'testpassword123',
      name: 'Test User'
    };
    
    console.log('🔍 Testing sign-up endpoint...');
    
    const response = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Sign-up endpoint working');
      console.log('📧 Created user:', data.user.email);
      return true;
    } else {
      console.log('❌ Sign-up endpoint failed:', data.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Sign-up test failed:', error.message);
    return false;
  }
}

// Test 3: Check Firebase project accessibility
console.log('\n3. Testing Firebase Project Access...');

function testFirebaseProjectAccess() {
  return new Promise((resolve) => {
    const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    
    console.log('🔍 Testing with:', {
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

// Test 4: Check environment variables
console.log('\n4. Validating Environment Variables...');

function validateEnvironment() {
  const required = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY'
  ];
  
  let allValid = true;
  
  for (const key of required) {
    const value = process.env[key];
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
      console.error(`❌ ${key}: MISSING OR INVALID`);
      allValid = false;
    }
  }
  
  return allValid;
}

// Run all tests
async function runAllTests() {
  console.log('\n🚀 Running comprehensive authentication tests...\n');
  
  const results = {
    envValid: validateEnvironment(),
    backendAdmin: await testBackendFirebaseAdmin(),
    frontendAPI: await testFrontendAPI(),
    projectAccess: await testFirebaseProjectAccess()
  };
  
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  console.log(`Environment Variables: ${results.envValid ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Backend Firebase Admin: ${results.backendAdmin ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Frontend API Routes: ${results.frontendAPI ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Firebase Project Access: ${results.projectAccess ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = Object.values(results).every(result => result === true);
  
  if (allPassed) {
    console.log('\n🎉 All tests passed! Authentication should be working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the errors above and implement the recommended fixes.');
    
    if (!results.projectAccess) {
      console.log('\n🔧 Firebase Project Access Issues:');
      console.log('1. Verify project ID in Firebase Console');
      console.log('2. Check API key restrictions in Firebase Console');
      console.log('3. Ensure project is not disabled or deleted');
    }
    
    if (!results.backendAdmin) {
      console.log('\n🔧 Backend Firebase Admin Issues:');
      console.log('1. Check private key format');
      console.log('2. Verify service account permissions');
      console.log('3. Ensure Admin SDK is properly initialized');
    }
    
    if (!results.frontendAPI) {
      console.log('\n🔧 Frontend API Issues:');
      console.log('1. Check API route implementations');
      console.log('2. Verify environment variables in frontend');
      console.log('3. Ensure backend is running and accessible');
    }
  }
  
  return allPassed;
}

// Run tests
runAllTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});