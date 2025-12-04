#!/bin/bash

# Firebase Environment Setup Script for Hyred Platform
# This script helps configure Firebase authentication properly

set -e

echo "🔐 Firebase Environment Configuration Setup"
echo "=========================================="

# Check if running in Docker or locally
if [ -f /.dockerenv ]; then
    echo "🐳 Running inside Docker container"
    IN_DOCKER=true
else
    echo "💻 Running locally"
    IN_DOCKER=false
fi

# Function to format Firebase private key
format_firebase_key() {
    local key="$1"
    # Remove any existing formatting
    key=$(echo "$key" | tr -d '\n' | sed 's/-----BEGIN PRIVATE KEY-----//g' | sed 's/-----END PRIVATE KEY-----//g')
    # Add proper formatting
    echo "-----BEGIN PRIVATE KEY-----
$key
-----END PRIVATE KEY-----"
}

# Function to validate Firebase configuration
validate_firebase_config() {
    local project_id="$1"
    local client_email="$2"
    local private_key="$3"
    
    echo "🔍 Validating Firebase configuration..."
    
    if [ -z "$project_id" ]; then
        echo "❌ FIREBASE_PROJECT_ID is missing"
        return 1
    fi
    
    if [ -z "$client_email" ]; then
        echo "❌ FIREBASE_CLIENT_EMAIL is missing"
        return 1
    fi
    
    if [ -z "$private_key" ]; then
        echo "❌ FIREBASE_PRIVATE_KEY is missing"
        return 1
    fi
    
    # Check key format
    if ! echo "$private_key" | grep -q "-----BEGIN PRIVATE KEY-----"; then
        echo "⚠️  Private key missing BEGIN marker"
        return 1
    fi
    
    if ! echo "$private_key" | grep -q "-----END PRIVATE KEY-----"; then
        echo "⚠️  Private key missing END marker"
        return 1
    fi
    
    echo "✅ Firebase configuration appears valid"
    return 0
}

# Function to test Firebase connection
test_firebase_connection() {
    echo "🧪 Testing Firebase Admin SDK connection..."
    
    # Create a simple test script
    cat > /tmp/test-firebase.js << 'EOF'
const admin = require('firebase-admin');

if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
  try {
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (privateKey.includes('\\n')) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: privateKey,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
    
    console.log('✅ Firebase Admin SDK initialized successfully');
    
    // Test listing users (this will verify the connection works)
    admin.auth().listUsers(1)
      .then(() => {
        console.log('✅ Firebase Auth connection test passed');
        process.exit(0);
      })
      .catch((error) => {
        console.error('❌ Firebase Auth connection test failed:', error.message);
        process.exit(1);
      });
      
  } catch (error) {
    console.error('❌ Firebase Admin SDK initialization failed:', error.message);
    process.exit(1);
  }
} else {
  console.error('❌ Firebase credentials not provided');
  process.exit(1);
}
EOF

    # Run the test
    if node /tmp/test-firebase.js; then
        echo "✅ Firebase connection test passed"
        rm -f /tmp/test-firebase.js
        return 0
    else
        echo "❌ Firebase connection test failed"
        rm -f /tmp/test-firebase.js
        return 1
    fi
}

# Main setup process
main() {
    echo "🚀 Starting Firebase environment setup..."
    
    # Check current environment
    echo "📋 Current Environment Variables:"
    echo "FIREBASE_PROJECT_ID: ${FIREBASE_PROJECT_ID:-"NOT SET"}"
    echo "FIREBASE_CLIENT_EMAIL: ${FIREBASE_CLIENT_EMAIL:-"NOT SET"}"
    echo "FIREBASE_PRIVATE_KEY: $([ -n "$FIREBASE_PRIVATE_KEY" ] && echo "SET (${#FIREBASE_PRIVATE_KEY} chars)" || echo "NOT SET")"
    
    # Validate configuration
    if validate_firebase_config "$FIREBASE_PROJECT_ID" "$FIREBASE_CLIENT_EMAIL" "$FIREBASE_PRIVATE_KEY"; then
        echo "✅ Environment variables are configured"
        
        # Test connection if all vars are present
        if [ -n "$FIREBASE_PROJECT_ID" ] && [ -n "$FIREBASE_CLIENT_EMAIL" ] && [ -n "$FIREBASE_PRIVATE_KEY" ]; then
            test_firebase_connection
        fi
    else
        echo "⚠️  Environment variables need to be configured"
        echo ""
        echo "🔧 To fix this, please:"
        echo "1. Copy .env.example to .env"
        echo "2. Fill in your Firebase project credentials"
        echo "3. Restart your containers"
        echo ""
        echo "📖 For Firebase setup instructions, see:"
        echo "   - Go to Firebase Console > Project Settings > Service Accounts"
        echo "   - Generate new private key"
        echo "   - Copy the values to your .env file"
    fi
    
    echo ""
    echo "✅ Firebase environment setup complete!"
}

# Run main function
main "$@"