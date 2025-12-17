#!/usr/bin/env node

// Firebase Authentication Debug Script
// This script helps diagnose Firebase authentication issues

// Load environment variables from .env file
require('dotenv').config();

const https = require('https');

// Firebase configuration from environment variables
const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const FIREBASE_AUTH_DOMAIN = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

console.log('🔍 Firebase Authentication Debug Tool');
console.log('=====================================');

// Test 1: Check Firebase API key validity
console.log('\n1. Testing Firebase API Key...');

const testApiKey = () => {
  return new Promise((resolve, reject) => {
    const url = `https://identitytoolkit.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}:lookup?key=${FIREBASE_API_KEY}`;
    
    const req = https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`Status Code: ${res.statusCode}`);
        
        if (res.statusCode === 200) {
          console.log('✅ API key is valid');
          try {
            const response = JSON.parse(data);
            console.log('Project info:', response);
          } catch (e) {
            console.log('Response:', data);
          }
        } else {
          console.log('❌ API key issue detected');
          console.log('Response:', data);
        }
        
        resolve(res.statusCode);
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Network error:', error.message);
      reject(error);
    });
    
    req.end();
  });
};

// Test 2: Test sign in with test credentials
console.log('\n2. Testing Sign In Flow...');

const testSignIn = () => {
  return new Promise((resolve, reject) => {
    const testData = {
      email: 'test@example.com',
      password: 'password123',
      returnSecureToken: true
    };
    
    const postData = JSON.stringify(testData);
    
    const options = {
      hostname: 'identitytoolkit.googleapis.com',
      path: `/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`Status Code: ${res.statusCode}`);
        console.log('Response:', data);
        
        if (res.statusCode === 400) {
          try {
            const error = JSON.parse(data);
            console.log('❌ Authentication failed with error:', error.error);
            
            if (error.error.message.includes('EMAIL_NOT_FOUND')) {
              console.log('💡 This is expected for test credentials - API key is working');
            } else if (error.error.message.includes('API_KEY_NOT_VALID')) {
              console.log('❌ API key is invalid or restricted');
            } else if (error.error.message.includes('PASSWORD_LOGIN_DISABLED')) {
              console.log('❌ Email/Password authentication is disabled in Firebase console');
            }
          } catch (e) {
            console.log('Failed to parse error response');
          }
        }
        
        resolve(res.statusCode);
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Network error:', error.message);
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
};

// Test 3: Check Firebase project configuration
console.log('\n3. Firebase Configuration Summary...');
console.log('Project ID:', FIREBASE_PROJECT_ID);
console.log('Auth Domain:', FIREBASE_AUTH_DOMAIN);
console.log('API Key:', FIREBASE_API_KEY.substring(0, 10) + '...');

// Run tests
async function runDiagnostics() {
  try {
    await testApiKey();
    await testSignIn();
    
    console.log('\n🔧 Recommendations:');
    console.log('1. Ensure Email/Password authentication is enabled in Firebase console');
    console.log('2. Check that API key has no IP restrictions in Firebase console');
    console.log('3. Verify authDomain matches your Firebase project settings');
    console.log('4. Make sure project ID is correct');
    
  } catch (error) {
    console.error('Diagnostic failed:', error.message);
  }
}

runDiagnostics();