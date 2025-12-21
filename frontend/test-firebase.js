// Simple test to verify Firebase configuration
const { getFirebase } = require('./src/lib/firebase-simplified.ts');

console.log('Testing Firebase configuration...');
try {
  const { app, auth } = getFirebase();
  console.log('✅ Firebase test passed');
  console.log('App:', app ? 'initialized' : 'not initialized');
  console.log('Auth:', auth ? 'initialized' : 'not initialized');
} catch (error) {
  console.error('❌ Firebase test failed:', error.message);
}