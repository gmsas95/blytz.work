#!/bin/bash

echo "🔍 Firebase Environment Variables Diagnostic"
echo "============================================="

# Check if running in Docker context
if [ -f /.dockerenv ]; then
    echo "✅ Running inside Docker container"
else
    echo "⚠️  Running on host system"
fi

echo ""
echo "📋 Checking Firebase Environment Variables:"
echo "--------------------------------------------"

# Check each Firebase environment variable
vars=(
    "NEXT_PUBLIC_FIREBASE_API_KEY"
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" 
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
    "NEXT_PUBLIC_FIREBASE_APP_ID"
    "FIREBASE_PROJECT_ID"
    "FIREBASE_CLIENT_EMAIL"
    "FIREBASE_PRIVATE_KEY"
)

for var in "${vars[@]}"; do
    value="${!var}"
    if [ -n "$value" ]; then
        if [[ "$var" == *"KEY"* ]] || [[ "$var" == *"PRIVATE"* ]]; then
            echo "✅ $var: [CONFIGURED] (length: ${#value})"
        else
            echo "✅ $var: $value"
        fi
    else
        echo "❌ $var: [NOT SET]"
    fi
done

echo ""
echo "🔧 Build-time Environment Check:"
echo "---------------------------------"

# Check if we're in a Next.js build context
if [ -n "$NEXT_PUBLIC_FIREBASE_API_KEY" ]; then
    echo "✅ NEXT_PUBLIC_FIREBASE_API_KEY is set"
    # Check if it contains the literal placeholder
    if [[ "$NEXT_PUBLIC_FIREBASE_API_KEY" == *"\${environment"* ]]; then
        echo "❌ ERROR: API key contains literal placeholder!"
        echo "   Current value: $NEXT_PUBLIC_FIREBASE_API_KEY"
    fi
else
    echo "❌ NEXT_PUBLIC_FIREBASE_API_KEY is not set"
fi

echo ""
echo "🐳 Docker Environment Info:"
echo "---------------------------"
echo "Docker env vars available:"
env | grep -i firebase | grep -v PRIVATE | grep -v KEY || echo "No Firebase env vars found"

echo ""
echo "📁 Current Directory: $(pwd)"
echo "📝 Script Location: $0"

# Test Firebase initialization
echo ""
echo "🧪 Testing Firebase Config:"
echo "----------------------------"
if [ -n "$NEXT_PUBLIC_FIREBASE_API_KEY" ] && [ -n "$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" ] && [ -n "$NEXT_PUBLIC_FIREBASE_PROJECT_ID" ]; then
    echo "✅ Minimum Firebase config present"
    if [[ "$NEXT_PUBLIC_FIREBASE_API_KEY" == *"\${environment"* ]]; then
        echo "❌ CRITICAL: API key contains template literal!"
        echo "   This means the environment variable substitution failed."
    else
        echo "✅ API key format looks correct"
    fi
else
    echo "❌ Minimum Firebase config missing"
fi

echo ""
echo "🔍 Diagnostic Complete"