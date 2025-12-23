#!/usr/bin/env node

// Test script to validate authentication fix
// This script tests both the backend proxy endpoints and direct Firebase calls

require('dotenv').config();

const https = require('https');
const http = require('http');

console.log('🧪 Testing Authentication Fix');
console.log('=============================\n');

// Test configuration
const TEST_EMAIL = `test${Date.now()}@example.com`;
const TEST_PASSWORD = 'password123';
const TEST_NAME = 'Test User';

// Helper function to make HTTP requests
const makeRequest = (url, options = {}, data = null) => {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const requestOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      ...options
    };
    
    const req = client.request(url, requestOptions, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: responseData
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
};

// Test 1: Direct Firebase API (should fail with network issues)
console.log('1. Testing Direct Firebase API (Expected to Fail):');
console.log('--------------------------------------------------');

const testDirectFirebase = async () => {
  try {
    const response = await makeRequest(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
      {
        method: 'POST'
      },
      {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        returnSecureToken: true
      }
    );
    
    console.log(`Status Code: ${response.statusCode}`);
    if (response.statusCode === 200) {
      console.log('✅ Direct Firebase API works (unexpected)');
    } else {
      console.log('❌ Direct Firebase API failed (expected)');
      try {
        const error = JSON.parse(response.data);
        console.log(`Error: ${error.error?.message || 'Unknown error'}`);
      } catch (e) {
        console.log(`Response: ${response.data.substring(0, 200)}...`);
      }
    }
  } catch (error) {
    console.log('❌ Network error (expected):', error.message);
  }
};

// Test 2: Backend Proxy API (should work)
console.log('\n2. Testing Backend Proxy API (Expected to Work):');
console.log('-------------------------------------------------');

const testBackendProxy = async () => {
  try {
    // Test sign-up
    console.log('Testing sign-up...');
    const signupResponse = await makeRequest(
      'https://blytz.work/api/auth/signup',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      },
      {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        name: TEST_NAME
      }
    );
    
    console.log(`Sign-up Status Code: ${signupResponse.statusCode}`);
    
    if (signupResponse.statusCode === 200) {
      console.log('✅ Backend proxy sign-up works');
      try {
        const result = JSON.parse(signupResponse.data);
        console.log(`✅ User created: ${result.user?.email}`);
        console.log(`✅ Token received: ${result.token ? 'YES' : 'NO'}`);
        
        // Test sign-in with same credentials
        console.log('\nTesting sign-in...');
        const signinResponse = await makeRequest(
          'https://blytz.work/api/auth/signin',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            }
          },
          {
            email: TEST_EMAIL,
            password: TEST_PASSWORD
          }
        );
        
        console.log(`Sign-in Status Code: ${signinResponse.statusCode}`);
        
        if (signinResponse.statusCode === 200) {
          console.log('✅ Backend proxy sign-in works');
          try {
            const signinResult = JSON.parse(signinResponse.data);
            console.log(`✅ User signed in: ${signinResult.user?.email}`);
            console.log(`✅ Token received: ${signinResult.token ? 'YES' : 'NO'}`);
          } catch (e) {
            console.log('❌ Failed to parse sign-in response');
          }
        } else {
          console.log('❌ Backend proxy sign-in failed');
          try {
            const error = JSON.parse(signinResponse.data);
            console.log(`Error: ${error.error || 'Unknown error'}`);
          } catch (e) {
            console.log(`Response: ${signinResponse.data}`);
          }
        }
      } catch (e) {
        console.log('❌ Failed to parse sign-up response');
      }
    } else {
      console.log('❌ Backend proxy sign-up failed');
      try {
        const error = JSON.parse(signupResponse.data);
        console.log(`Error: ${error.error || 'Unknown error'}`);
      } catch (e) {
        console.log(`Response: ${signupResponse.data}`);
      }
    }
  } catch (error) {
    console.log('❌ Backend proxy test failed:', error.message);
    console.log('💡 Make sure the frontend server is running on localhost:3000');
  }
};

// Test 3: Compare with forgot password (known working)
console.log('\n3. Testing Forgot Password (Known Working):');
console.log('--------------------------------------------');

const testForgotPassword = async () => {
  try {
    const response = await makeRequest(
      'https://blytz.work/api/auth/forgot-password',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      },
      {
        email: TEST_EMAIL
      }
    );
    
    console.log(`Forgot Password Status Code: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      console.log('✅ Forgot password works (as expected)');
      try {
        const result = JSON.parse(response.data);
        console.log(`✅ Message: ${result.message}`);
      } catch (e) {
        console.log('✅ Response received');
      }
    } else {
      console.log('❌ Forgot password failed');
      try {
        const error = JSON.parse(response.data);
        console.log(`Error: ${error.error || 'Unknown error'}`);
      } catch (e) {
        console.log(`Response: ${response.data}`);
      }
    }
  } catch (error) {
    console.log('❌ Forgot password test failed:', error.message);
  }
};

// Run all tests
async function runTests() {
  console.log(`Test Email: ${TEST_EMAIL}`);
  console.log(`Test Password: ${TEST_PASSWORD}\n`);
  
  await testDirectFirebase();
  await testBackendProxy();
  await testForgotPassword();
  
  console.log('\n🎯 Test Summary:');
  console.log('==================');
  console.log('1. Direct Firebase API: Expected to fail due to network restrictions');
  console.log('2. Backend Proxy API: Should work by bypassing browser restrictions');
  console.log('3. Forgot Password: Should work (confirms backend is functional)');
  console.log('\n💡 If backend proxy works, the authentication issue is fixed!');
  console.log('   The frontend will now use backend endpoints instead of direct Firebase calls.');
}

runTests().catch(console.error);