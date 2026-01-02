#!/bin/bash

# Script to help set up environment variables for Dokploy
# Usage: ./scripts/setup-dokploy-env.sh

echo "🔧 Dokploy Environment Variable Setup Guide"
echo ""
echo "Please set the following environment variables in your Dokploy dashboard:"
echo ""

# Firebase Frontend Variables
echo "📱 Firebase Frontend Variables (Required for Authentication):"
echo "NEXT_PUBLIC_FIREBASE_API_KEY=REPLACE_WITH_YOUR_FIREBASE_API_KEY"
echo "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=REPLACE_WITH_YOUR_PROJECT_ID.firebaseapp.com"
echo "NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id"
echo "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com"
echo "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789"
echo "NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456"
echo "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX"
echo ""

# Firebase Backend Variables
echo "🔧 Firebase Backend Variables (Required for Token Verification):"
echo "FIREBASE_PROJECT_ID=your-project-id"
echo "FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
echo 'FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"'
echo ""

# Database Variables
echo "🗄️ Database Variables:"
echo "DATABASE_URL=postgresql://postgres:password@postgres:5432/blytzwork"
echo "REDIS_URL=redis://redis:6379"
echo ""

# API Configuration
echo "🌐 API Configuration:"
echo "NEXT_PUBLIC_API_URL=https://api.blytz.work"
echo ""

# Stripe Variables
echo "💳 Stripe Variables:"
echo "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key"
echo "STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key"
echo "STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret"
echo ""

# JWT Secret
echo "🔐 JWT Secret:"
echo "JWT_SECRET=REPLACE_WITH_SECURE_RANDOM_JWT_SECRET_MINIMUM_32_CHARACTERS"
echo ""

echo "⚠️ Important Notes:"
echo "1. Replace all placeholder values with your actual Firebase and Stripe credentials"
echo "2. The FIREBASE_PRIVATE_KEY must be properly formatted with newlines"
echo "3. Make sure there are no Dokploy template syntax ({{variable}}) in the values"
echo "4. After setting these variables, redeploy your application"
echo ""

echo "🔍 To verify your setup after deployment:"
echo "Visit: https://blytz.work/debug/firebase"
echo ""