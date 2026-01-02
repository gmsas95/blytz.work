#!/bin/bash

# Test script for simplified Firebase configuration
echo "🔍 Testing Simplified Firebase Configuration"
echo "=========================================="

# Test backend configuration
echo ""
echo "📋 Testing Backend Firebase Configuration..."
cd backend

# Check if required environment variables are set
echo "Checking environment variables:"
if [ -z "$FIREBASE_PROJECT_ID" ]; then
  echo "❌ FIREBASE_PROJECT_ID is not set"
else
  echo "✅ FIREBASE_PROJECT_ID is set"
fi

if [ -z "$FIREBASE_CLIENT_EMAIL" ]; then
  echo "❌ FIREBASE_CLIENT_EMAIL is not set"
else
  echo "✅ FIREBASE_CLIENT_EMAIL is set"
fi

if [ -z "$FIREBASE_PRIVATE_KEY" ]; then
  echo "❌ FIREBASE_PRIVATE_KEY is not set"
else
  echo "✅ FIREBASE_PRIVATE_KEY is set"
fi

# Try to initialize Firebase Admin
echo ""
echo "Attempting to initialize Firebase Admin..."
node -e "
try {
  const { initializeFirebaseAdmin } = require('./dist/config/firebaseConfig-simplified.js');
  const admin = initializeFirebaseAdmin();
  console.log('✅ Firebase Admin initialized successfully');
  console.log('🔗 Project ID:', admin.options.credential.projectId);
} catch (error) {
  console.error('❌ Firebase Admin initialization failed:', error.message);
}
" 2>/dev/null || echo "❌ Could not test Firebase Admin (build required)"

cd ..

# Test frontend configuration
echo ""
echo "📋 Testing Frontend Firebase Configuration..."
cd frontend

# Check if required environment variables are set
echo "Checking environment variables:"
if [ -z "$NEXT_PUBLIC_FIREBASE_API_KEY" ]; then
  echo "❌ NEXT_PUBLIC_FIREBASE_API_KEY is not set"
else
  echo "✅ NEXT_PUBLIC_FIREBASE_API_KEY is set"
fi

if [ -z "$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" ]; then
  echo "❌ NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is not set"
else
  echo "✅ NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is set"
fi

if [ -z "$NEXT_PUBLIC_FIREBASE_PROJECT_ID" ]; then
  echo "❌ NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set"
else
  echo "✅ NEXT_PUBLIC_FIREBASE_PROJECT_ID is set"
fi

# Check for template syntax in environment variables
echo ""
echo "Checking for template syntax in environment variables:"
for var in NEXT_PUBLIC_FIREBASE_API_KEY NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN NEXT_PUBLIC_FIREBASE_PROJECT_ID; do
  value="${!var}"
  if [[ "$value" == *'${{ '* ]] || [[ "$value" == *'${environment'* ]] || [[ "$value" == *'REPLACE_WITH_'* ]]; then
    echo "❌ $var contains template syntax"
  elif [ -n "$value" ]; then
    echo "✅ $var has valid value"
  fi
done

cd ..

echo ""
echo "📝 Summary:"
echo "=========="
echo "To use the simplified Firebase configuration:"
echo ""
echo "1. Backend:"
echo "   - Set FIREBASE_PROJECT_ID"
echo "   - Set FIREBASE_CLIENT_EMAIL"
echo "   - Set FIREBASE_PRIVATE_KEY"
echo "   - Update imports to use firebaseConfig-simplified.js"
echo "   - Update auth plugin to use firebaseAuth-simplified.js"
echo ""
echo "2. Frontend:"
echo "   - Set NEXT_PUBLIC_FIREBASE_API_KEY"
echo "   - Set NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
echo "   - Set NEXT_PUBLIC_FIREBASE_PROJECT_ID"
echo "   - Update imports to use firebase-simplified.ts"
echo ""
echo "3. Benefits of simplified configuration:"
echo "   - No complex template syntax detection"
echo "   - Clear error messages when configuration is missing"
echo "   - Single source of truth for Firebase config"
echo "   - Reliable initialization across environments"
echo ""