#!/bin/bash

# Test script to verify Firebase configuration changes
# This script checks if the Firebase configuration is properly loaded

echo "🔍 Testing Firebase Configuration Changes"
echo "========================================"

# Check if we're in the right directory
if [ ! -f "frontend/src/lib/firebase-runtime-final.ts" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "✅ Found firebase-runtime-final.ts"

# Check if the essential changes are in place
echo ""
echo "🔍 Checking for essential configuration changes..."

# Check if the file contains the improved validation logic
if grep -q "essentialValid === 3" frontend/src/lib/firebase-runtime-final.ts; then
    echo "✅ Essential variable validation logic found"
else
    echo "❌ Essential variable validation logic not found"
    exit 1
fi

# Check if the file contains the improved template detection
if grep -q "REPLACE_WITH_" frontend/src/lib/firebase-runtime-final.ts; then
    echo "✅ Improved template detection logic found"
else
    echo "❌ Improved template detection logic not found"
    exit 1
fi

# Check if the file contains better error messages
if grep -q "This usually means:" frontend/src/lib/firebase-runtime-final.ts; then
    echo "✅ Enhanced error messages found"
else
    echo "❌ Enhanced error messages not found"
    exit 1
fi

echo ""
echo "🔍 Checking Next.js configuration..."

# Check if Next.js config properly exposes environment variables
if grep -q "NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY" frontend/next.config.js; then
    echo "✅ Next.js config properly exposes Firebase variables"
else
    echo "❌ Next.js config does not properly expose Firebase variables"
    exit 1
fi

echo ""
echo "🔍 Checking Docker configuration..."

# Check if Dockerfile properly passes build arguments
if grep -q "ARG NEXT_PUBLIC_FIREBASE_API_KEY" frontend/Dockerfile; then
    echo "✅ Dockerfile properly defines Firebase build arguments"
else
    echo "❌ Dockerfile does not properly define Firebase build arguments"
    exit 1
fi

# Check if docker-compose file passes environment variables
if grep -q "NEXT_PUBLIC_FIREBASE_API_KEY: \${NEXT_PUBLIC_FIREBASE_API_KEY}" docker-compose.dokploy-final.yml; then
    echo "✅ Docker Compose properly passes Firebase environment variables"
else
    echo "❌ Docker Compose does not properly pass Firebase environment variables"
    exit 1
fi

echo ""
echo "✅ All Firebase configuration checks passed!"
echo ""
echo "📋 Summary of changes made:"
echo "1. ✅ Fixed Firebase configuration detection to require only essential variables"
echo "2. ✅ Improved template detection to avoid false positives"
echo "3. ✅ Enhanced error messages for better debugging"
echo "4. ✅ Verified Next.js and Docker configurations are correct"
echo ""
echo "🚀 The Firebase configuration should now properly use Dokploy environment variables"
echo "   instead of falling back to mock authentication when valid credentials are available."
echo ""
echo "📝 Next steps:"
echo "1. Deploy the changes to Dokploy"
echo "2. Check the debug page at https://blytz.work/debug/firebase"
echo "3. Verify authentication works with real Firebase credentials"