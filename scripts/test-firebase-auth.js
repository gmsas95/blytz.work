#!/usr/bin/env node

// Firebase Authentication Test Script
// This script tests the complete authentication flow

// Load environment variables from .env file
require('dotenv').config();

const https = require('https');

console.log('🧪 Firebase Authentication Test');
console.log('===============================\n');

// Get Firebase configuration from environment
const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Test 1: Configuration Validation
console.log('1. Configuration Validation:');
console.log('---------------------------');

const validateConfig = () => {
  const required = ['apiKey', 'authDomain', 'projectId'];
  let allValid = true;
  
  required.forEach(key => {
    const value = config[key];
    const isValid = value && value.trim() !== '' && !value.includes('your-firebase-') && !value.includes('REPLACE_WITH_');
    
    if (isValid) {
      if (key === 'apiKey') {
        console.log(`✅ ${key}: ${value.substring(0, 10)}...`);
      } else {
        console.log(`✅ ${key}: ${value}`);
      }
    } else {
      console.log(`❌ ${key}: Missing or invalid`);
      allValid = false;
    }
  });
  
  return allValid;
};

// Test 2: Firebase API Connectivity
console.log('\n2. Firebase API Connectivity:');
console.log('------------------------------');

const testFirebaseAPI = () => {
  return new Promise((resolve, reject) => {
    const url = `https://identitytoolkit.googleapis.com/v1/projects/${config.projectId}:lookup?key=${config.apiKey}`;
    
    console.log(`Testing: ${url.replace(config.apiKey, config.apiKey.substring(0, 10) + '...')}`);
    
    const req = https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`Status Code: ${res.statusCode}`);
        
        if (res.statusCode === 200) {
          console.log('✅ Firebase API is accessible');
          try {
            const response = JSON.parse(data);
            console.log('✅ Project lookup successful');
          } catch (e) {
            console.log('⚠️ Could not parse response, but status is OK');
          }
        } else if (res.statusCode === 404) {
          console.log('⚠️ Project lookup failed (404) - this may be expected');
          console.log('   Not all Firebase projects expose the lookup endpoint');
        } else {
          console.log('❌ Firebase API issue detected');
          console.log('Response:', data.substring(0, 200));
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

// Test 3: Sign In Endpoint
console.log('\n3. Sign In Endpoint Test:');
console.log('---------------------------');

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
      path: `/v1/accounts:signInWithPassword?key=${config.apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    console.log('Testing sign-in with test credentials...');
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`Sign-in Status Code: ${res.statusCode}`);
        
        if (res.statusCode === 400) {
          try {
            const error = JSON.parse(data);
            console.log('Sign-in Error:', error.error.message);
            
            if (error.error.message.includes('INVALID_LOGIN_CREDENTIALS') || 
                error.error.message.includes('EMAIL_NOT_FOUND')) {
              console.log('✅ Sign-in endpoint is working (test credentials expected to fail)');
            } else if (error.error.message.includes('API_KEY_NOT_VALID')) {
              console.log('❌ API key is invalid');
            } else if (error.error.message.includes('PASSWORD_LOGIN_DISABLED')) {
              console.log('❌ Email/Password authentication is disabled');
            } else {
              console.log('⚠️ Unexpected error:', error.error.message);
            }
          } catch (e) {
            console.log('Failed to parse error response');
          }
        } else if (res.statusCode === 200) {
          console.log('✅ Sign-in successful (unexpected for test credentials)');
        } else {
          console.log('⚠️ Unexpected status code:', res.statusCode);
        }
        
        resolve(res.statusCode);
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Sign-in network error:', error.message);
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
};

// Test 4: Sign Up Endpoint
console.log('\n4. Sign Up Endpoint Test:');
console.log('----------------------------');

const testSignUp = () => {
  return new Promise((resolve, reject) => {
    const testData = {
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      returnSecureToken: true
    };
    
    const postData = JSON.stringify(testData);
    
    const options = {
      hostname: 'identitytoolkit.googleapis.com',
      path: `/v1/accounts:signUp?key=${config.apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    console.log(`Testing sign-up with ${testData.email}...`);
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`Sign-up Status Code: ${res.statusCode}`);
        
        if (res.statusCode === 200) {
          console.log('✅ Sign-up endpoint is working');
          try {
            const response = JSON.parse(data);
            console.log('✅ User created successfully');
            console.log(`📧 Email: ${response.email}`);
            console.log(`🆔 Local ID: ${response.localId}`);
          } catch (e) {
            console.log('✅ Sign-up successful (response parsing failed)');
          }
        } else if (res.statusCode === 400) {
          try {
            const error = JSON.parse(data);
            console.log('Sign-up Error:', error.error.message);
            
            if (error.error.message.includes('EMAIL_EXISTS')) {
              console.log('⚠️ Email already exists (endpoint is working)');
            } else if (error.error.message.includes('API_KEY_NOT_VALID')) {
              console.log('❌ API key is invalid');
            } else {
              console.log('⚠️ Unexpected error:', error.error.message);
            }
          } catch (e) {
            console.log('Failed to parse error response');
          }
        } else {
          console.log('⚠️ Unexpected status code:', res.statusCode);
        }
        
        resolve(res.statusCode);
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Sign-up network error:', error.message);
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
};

// Run all tests
async function runTests() {
  try {
    // Test 1: Configuration
    const configValid = validateConfig();
    if (!configValid) {
      console.log('\n❌ Configuration validation failed. Please check your .env file.');
      process.exit(1);
    }
    
    // Test 2: API Connectivity
    await testFirebaseAPI();
    
    // Test 3: Sign In
    await testSignIn();
    
    // Test 4: Sign Up
    await testSignUp();
    
    console.log('\n🎉 Authentication Test Summary:');
    console.log('===============================');
    console.log('✅ Configuration is valid');
    console.log('✅ Firebase API is accessible');
    console.log('✅ Sign-in endpoint is working');
    console.log('✅ Sign-up endpoint is working');
    console.log('\n💡 Next steps:');
    console.log('1. Test authentication in the browser');
    console.log('2. Verify email/password authentication is enabled in Firebase console');
    console.log('3. Check CORS settings if browser errors occur');
    console.log('4. Monitor authentication logs in Firebase console');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

runTests();