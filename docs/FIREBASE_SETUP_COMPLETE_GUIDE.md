# Complete Firebase Setup Guide for BlytzWork

This guide provides detailed, step-by-step instructions to properly configure Firebase for the BlytzWork platform. Follow these instructions carefully to ensure authentication works correctly.

## Table of Contents
1. [Create Firebase Project](#create-firebase-project)
2. [Configure Authentication](#configure-authentication)
3. [Get Frontend Credentials](#get-frontend-credentials)
4. [Get Backend Credentials](#get-backend-credentials)
5. [Update Environment Variables](#update-environment-variables)
6. [Verify Configuration](#verify-configuration)
7. [Troubleshooting](#troubleshooting)

## Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Sign in with your Google account
3. Click "Add project"
4. Enter your project name (e.g., "blytzwork-production")
5. Accept the Firebase terms
6. Choose your Google Analytics account (optional)
7. Click "Create project"
8. Wait for the project to be created (this may take a few minutes)

## Configure Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started" if prompted
3. Go to the "Sign-in method" tab
4. Enable the following providers:
   - **Email/Password**: Click "Email/Password" → Enable → Save
   - **Google**: Click "Google" → Enable → Add your authorized domain → Save

### Authorized Domains
Make sure to add these domains to your authorized domains list:
- `localhost` (for development)
- `blytz.work` (production frontend)
- `api.blytz.work` (production backend)
- `sudo.blytz.work` (admin panel)

## Get Frontend Credentials

1. In Firebase Console, go to Project Settings (gear icon)
2. Click on the "General" tab
3. Scroll down to "Your apps" section
4. Click the web app icon (`</>`) to create a new web app
5. Give your app a name (e.g., "BlytzWork Web App")
6. Click "Register app"
7. Firebase will display your configuration. Copy these values:

```
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789012345678"
};
```

8. Keep this window open - you'll need these values for the next steps

## Get Backend Credentials

1. In Firebase Console, go to Project Settings (gear icon)
2. Click on the "Service accounts" tab
3. Click "Generate new private key"
4. Select "JSON" as the key type
5. Click "Generate key"
6. Save the downloaded JSON file securely - this contains your private key
7. Open the JSON file to find these values:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "abcdef123456789012345678",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com",
  "client_id": "123456789012345678901"
}
```

## Update Environment Variables

### Step 1: Open your .env.dokploy file

Navigate to your project root and open the `.env.dokploy` file.

### Step 2: Update Frontend Variables

Replace these placeholder values with your actual Firebase credentials:

```bash
# Find this line:
NEXT_PUBLIC_FIREBASE_API_KEY=REPLACE_WITH_YOUR_FIREBASE_API_KEY
# Replace with:
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Find this line:
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=REPLACE_WITH_YOUR_PROJECT_ID.firebaseapp.com
# Replace with:
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com

# Find this line:
NEXT_PUBLIC_FIREBASE_PROJECT_ID=REPLACE_WITH_YOUR_PROJECT_ID
# Replace with:
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id

# Find this line:
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=REPLACE_WITH_YOUR_PROJECT_ID.appspot.com
# Replace with:
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com

# Find this line:
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=REPLACE_WITH_YOUR_MESSAGING_SENDER_ID
# Replace with:
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012

# Find this line:
NEXT_PUBLIC_FIREBASE_APP_ID=REPLACE_WITH_YOUR_FIREBASE_APP_ID
# Replace with:
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456789012345678
```

### Step 3: Update Backend Variables

Replace these placeholder values with your service account credentials:

```bash
# Find this line:
FIREBASE_PROJECT_ID=REPLACE_WITH_YOUR_PROJECT_ID
# Replace with:
FIREBASE_PROJECT_ID=your-project-id

# Find this line:
FIREBASE_CLIENT_EMAIL=REPLACE_WITH_YOUR_FIREBASE_CLIENT_EMAIL
# Replace with:
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com

# Find this line:
FIREBASE_PRIVATE_KEY="REPLACE_WITH_YOUR_FIREBASE_PRIVATE_KEY_KEEP_NEWLINES"
# Replace with (IMPORTANT: Keep the \n characters and quotes):
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

### Important Notes About Private Key Format

1. **Keep the \n characters**: These represent actual newlines in the key
2. **Wrap in double quotes**: The entire key must be enclosed in quotes
3. **No extra spaces**: Don't add spaces at the beginning or end
4. **Copy the entire key**: Make sure you include both BEGIN and END markers

### Step 4: Update Other Variables

Don't forget to update these non-Firebase variables as well:

```bash
# Replace with a secure password
POSTGRES_PASSWORD=REPLACE_WITH_SECURE_POSTGRES_PASSWORD
DATABASE_URL=postgresql://postgres:YOUR_SECURE_PASSWORD@postgres:5432/blytzwork

# Replace with your Stripe keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Generate a secure JWT secret
JWT_SECRET=your_secure_random_string_minimum_32_characters
```

## Verify Configuration

### Option 1: Use the Debug Script

Run the provided debug script to check your configuration:

```bash
./scripts/debug-auth.sh
```

This will show you which variables are set correctly and which ones still need attention.

### Option 2: Use the Debug Page

After deploying, visit `https://blytz.work/debug/firebase` to see:
- Which environment variables are detected
- If Firebase is properly initialized
- Any configuration issues

### Option 3: Manual Verification

1. Check that all `REPLACE_WITH_` values have been replaced
2. Verify the Firebase project ID is consistent across all variables
3. Ensure the private key is properly formatted with \n characters

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: "Invalid Firebase configuration" error

**Symptoms**: 
- Authentication fails
- Console shows "Firebase is not initialized"
- Debug page shows missing variables

**Solutions**:
1. Check that all `REPLACE_WITH_` values have been replaced
2. Verify there are no template syntax placeholders
3. Ensure the private key is properly formatted with `\n` characters

#### Issue 2: "Permission denied" errors

**Symptoms**:
- Can sign in but API calls fail
- Backend logs show authentication errors

**Solutions**:
1. Verify your service account has Firebase Admin permissions
2. Check that the Firebase project ID matches between frontend and backend
3. Ensure Authentication is enabled in Firebase Console

#### Issue 3: Private key formatting issues

**Symptoms**:
- Backend fails to start
- Firebase Admin initialization fails
- Error messages about invalid certificates

**Solutions**:
1. Ensure the private key includes both BEGIN and END markers
2. Keep the `\n` characters exactly as they appear in the JSON
3. Wrap the entire key in double quotes
4. Don't add any extra spaces or characters

#### Issue 4: Domain not authorized

**Symptoms**:
- Can sign in on localhost but not on production
- Error about unauthorized domain

**Solutions**:
1. Add your production domains to Firebase Auth settings
2. Include both `blytz.work` and `api.blytz.work`
3. Wait a few minutes for changes to propagate

### Debug Commands

Use these commands to debug your Firebase configuration:

```bash
# Check environment variables
./scripts/debug-auth.sh

# Test backend Firebase connection
cd backend && npm run test:firebase

# Check frontend Firebase initialization
# Open browser console and look for Firebase logs

# Verify environment variables are loaded correctly
grep -E "(FIREBASE|NEXT_PUBLIC_FIREBASE)" .env.dokploy
```

### Getting Help

If you're still having issues:

1. Check the browser console for detailed error messages
2. Review the backend logs for Firebase initialization errors
3. Use the debug page at `/debug/firebase` to see configuration status
4. Ensure all environment variables are properly set in Dokploy

## Final Checklist

Before deploying to production, verify:

- [ ] Firebase project created and configured
- [ ] Authentication enabled (Email/Password and Google)
- [ ] All `REPLACE_WITH_` values replaced with actual credentials
- [ ] Private key properly formatted with \n characters and quotes
- [ ] Project ID consistent across all variables
- [ ] Production domains added to Firebase Auth settings
- [ ] Debug script shows all variables as "VALID"
- [ ] Debug page shows Firebase as properly initialized

## Security Best Practices

1. **Never commit credentials to version control**
2. **Use different Firebase projects for development and production**
3. **Regularly rotate your private keys**
4. **Keep your service account JSON file secure**
5. **Monitor Firebase console for unusual authentication activity**
6. **Set up alerts for suspicious authentication patterns**

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication Guide](https://firebase.google.com/docs/auth)
- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [BlytzWork Platform Documentation](./README.md)