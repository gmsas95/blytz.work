#!/usr/bin/env node

// Firebase Configuration Validation Script
// This script validates the actual Firebase configuration from environment variables

// Load environment variables from .env file
require('dotenv').config();

console.log('🔍 Firebase Configuration Validation');
console.log('=====================================\n');

// Check environment variables
console.log('1. Environment Variables Check:');
console.log('-------------------------------');

const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
];

const envStatus = {};
let allVarsPresent = true;

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  envStatus[varName] = {
    present: !!value,
    value: value ? (varName.includes('KEY') ? value.substring(0, 10) + '...' : value) : 'MISSING'
  };
  
  if (!value) {
    allVarsPresent = false;
  }
  
  console.log(`${varName}: ${value ? '✅ PRESENT' : '❌ MISSING'}`);
  if (value && varName.includes('KEY')) {
    console.log(`  Value: ${value.substring(0, 10)}...`);
  } else if (value) {
    console.log(`  Value: ${value}`);
  }
});

if (!allVarsPresent) {
  console.log('\n❌ Some required environment variables are missing!');
  process.exit(1);
}

console.log('\n✅ All required environment variables are present');

// Test Firebase API key with correct project ID
console.log('\n2. Firebase API Key Validation:');
console.log('-------------------------------');

const https = require('https');

const testFirebaseApiKey = (apiKey, projectId) => {
  return new Promise((resolve, reject) => {
    // Test with the correct endpoint format
    const url = `https://identitytoolkit.googleapis.com/v1/projects/${projectId}:lookup?key=${apiKey}`;
    
    console.log(`Testing URL: ${url.replace(apiKey, apiKey.substring(0, 10) + '...')}`);
    
    const req = https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`Status Code: ${res.statusCode}`);
        
        if (res.statusCode === 200) {
          console.log('✅ API key is valid and project ID matches');
          try {
            const response = JSON.parse(data);
            console.log('Project response:', JSON.stringify(response, null, 2));
          } catch (e) {
            console.log('Raw response:', data);
          }
        } else if (res.statusCode === 403) {
          console.log('❌ API key is invalid or has restrictions');
          console.log('Response:', data);
        } else if (res.statusCode === 404) {
          console.log('❌ Project ID not found or API key mismatch');
          console.log('Response:', data);
        } else {
          console.log('⚠️ Unexpected response');
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

// Test sign in endpoint
const testSignInEndpoint = (apiKey, projectId) => {
  return new Promise((resolve, reject) => {
    const testData = {
      email: 'test@example.com',
      password: 'password123',
      returnSecureToken: true
    };
    
    const postData = JSON.stringify(testData);
    
    const options = {
      hostname: 'identitytoolkit.googleapis.com',
      path: `/v1/accounts:signInWithPassword?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    console.log(`Testing sign-in endpoint...`);
    
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
            
            if (error.error.message.includes('INVALID_LOGIN_CREDENTIALS')) {
              console.log('✅ API endpoint is working (test credentials expected to fail)');
            } else if (error.error.message.includes('API_KEY_NOT_VALID')) {
              console.log('❌ API key is invalid');
            } else if (error.error.message.includes('PASSWORD_LOGIN_DISABLED')) {
              console.log('❌ Email/Password authentication is disabled');
            }
          } catch (e) {
            console.log('Failed to parse error response');
          }
        } else {
          console.log('Sign-in Response:', data);
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

// Run tests
async function runValidation() {
  try {
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    
    console.log('\n3. Running Firebase Tests:');
    console.log('--------------------------');
    
    await testFirebaseApiKey(apiKey, projectId);
    console.log('');
    await testSignInEndpoint(apiKey, projectId);
    
    console.log('\n🔧 Configuration Recommendations:');
    console.log('---------------------------------');
    console.log('1. If API key validation fails:');
    console.log('   - Check Firebase console for correct API key');
    console.log('   - Ensure API key has no IP restrictions');
    console.log('   - Verify HTTP referrer restrictions include your domain');
    console.log('');
    console.log('2. If project ID validation fails:');
    console.log('   - Verify project ID matches Firebase console');
    console.log('   - Check that project is not deleted or disabled');
    console.log('');
    console.log('3. If sign-in endpoint fails:');
    console.log('   - Ensure Email/Password authentication is enabled');
    console.log('   - Check Firebase console authentication settings');
    console.log('   - Verify no CORS issues in browser console');
    
  } catch (error) {
    console.error('Validation failed:', error.message);
  }
}

runValidation();