#!/bin/bash

# Script to check if all required environment variables are set
# Usage: ./scripts/check-env.sh

echo "🔍 Checking environment variables..."
echo ""

# Frontend variables
echo "📱 Frontend Firebase Variables:"
echo "NEXT_PUBLIC_FIREBASE_API_KEY: ${NEXT_PUBLIC_FIREBASE_API_KEY:+✅ Set}${NEXT_PUBLIC_FIREBASE_API_KEY:-❌ Missing}"
echo "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:+✅ Set}${NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:-❌ Missing}"
echo "NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${NEXT_PUBLIC_FIREBASE_PROJECT_ID:+✅ Set}${NEXT_PUBLIC_FIREBASE_PROJECT_ID:-❌ Missing}"
echo "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: ${NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:+✅ Set}${NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:-❌ Missing}"
echo "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: ${NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:+✅ Set}${NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:-❌ Missing}"
echo "NEXT_PUBLIC_FIREBASE_APP_ID: ${NEXT_PUBLIC_FIREBASE_APP_ID:+✅ Set}${NEXT_PUBLIC_FIREBASE_APP_ID:-❌ Missing}"
echo "NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL:+✅ Set to $NEXT_PUBLIC_API_URL}${NEXT_PUBLIC_API_URL:-❌ Missing (using default)}"
echo ""

# Backend variables
echo "🔧 Backend Firebase Variables:"
echo "FIREBASE_PROJECT_ID: ${FIREBASE_PROJECT_ID:+✅ Set}${FIREBASE_PROJECT_ID:-❌ Missing}"
echo "FIREBASE_CLIENT_EMAIL: ${FIREBASE_CLIENT_EMAIL:+✅ Set}${FIREBASE_CLIENT_EMAIL:-❌ Missing}"
echo "FIREBASE_PRIVATE_KEY: ${FIREBASE_PRIVATE_KEY:+✅ Set}${FIREBASE_PRIVATE_KEY:-❌ Missing}"
echo ""

# Database variables
echo "🗄️ Database Variables:"
echo "DATABASE_URL: ${DATABASE_URL:+✅ Set}${DATABASE_URL:-❌ Missing}"
echo "REDIS_URL: ${REDIS_URL:+✅ Set}${REDIS_URL:-❌ Missing}"
echo ""

# Other important variables
echo "🔐 Other Variables:"
echo "JWT_SECRET: ${JWT_SECRET:+✅ Set}${JWT_SECRET:-❌ Missing}"
echo "STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY:+✅ Set}${STRIPE_SECRET_KEY:-❌ Missing}"
echo ""

# Check for template syntax
echo "🚨 Checking for Dokploy template syntax:"
if [[ "$NEXT_PUBLIC_FIREBASE_API_KEY" == *'{{'* ]]; then
  echo "❌ NEXT_PUBLIC_FIREBASE_API_KEY contains template syntax"
fi
if [[ "$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" == *'{{'* ]]; then
  echo "❌ NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN contains template syntax"
fi
if [[ "$NEXT_PUBLIC_FIREBASE_PROJECT_ID" == *'{{'* ]]; then
  echo "❌ NEXT_PUBLIC_FIREBASE_PROJECT_ID contains template syntax"
fi

echo ""
echo "📋 Summary:"
echo "If any variables are missing, please set them in your Dokploy environment."
echo "If template syntax is detected, Dokploy is not properly substituting variables."