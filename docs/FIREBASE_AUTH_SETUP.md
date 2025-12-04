# Firebase Authentication Setup Guide for Hyred Platform

## 🔐 Overview

This guide walks you through setting up Firebase Authentication for the Hyred platform, including both frontend and backend configuration.

## 📋 Prerequisites

- Firebase project created at [Firebase Console](https://console.firebase.google.com/)
- Firebase Authentication enabled in your project
- Service account created with proper permissions

## 🚀 Step-by-Step Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or select existing project
3. Enable Google Analytics (optional)
4. Click "Create project"

### Step 2: Enable Authentication Methods

1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Enable the following sign-in methods:
   - **Email/Password** (Required)
   - **Google** (Optional but recommended)
   - **Phone** (Optional)

### Step 3: Get Frontend Configuration

1. Go to Project Settings (gear icon)
2. Under "Your apps" section, click "Web" icon (</>)
3. Register your app with a nickname (e.g., "hyred-frontend")
4. Copy the configuration object

### Step 4: Create Service Account (Backend)

1. Still in Project Settings, go to "Service accounts" tab
2. Click "Generate new private key"
3. Save the downloaded JSON file securely
4. Note these values from the JSON:
   - `project_id`
   - `client_email`
   - `private_key`

### Step 5: Configure Environment Variables

Create or update your `.env` file with these values:

```bash
# Backend Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"

# Frontend Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyYourApiKey
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### Step 6: Private Key Formatting

**Important**: The private key must be properly formatted:

1. **Include the entire key** including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
2. **Escape newlines** as `\n` in the environment variable
3. **Include quotes** around the entire key

Example:
```bash
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

### Step 7: Test the Configuration

Run the setup verification script:

```bash
# Make the script executable
chmod +x scripts/setup-firebase-env.sh

# Run the verification
./scripts/setup-firebase-env.sh
```

## 🔧 Troubleshooting

### Issue: "Failed to parse private key"

**Symptoms**: 
- Backend logs show `Failed to parse private key: Error: Unparsed DER bytes remain`

**Solutions**:
1. Ensure the private key includes proper begin/end markers
2. Check that newlines are escaped as `\n`
3. Verify the key is quoted in the .env file
4. Use the provided key formatting in `firebaseAuth.ts`

### Issue: "Firebase Admin not properly initialized"

**Symptoms**:
- Authentication endpoints return 500 errors
- "Firebase Admin not properly initialized" in logs

**Solutions**:
1. Verify all three Firebase environment variables are set
2. Check that the service account has proper permissions
3. Ensure the private key is valid and not expired
4. Run the setup script to validate configuration

### Issue: Frontend authentication fails

**Symptoms**:
- Login/register forms show errors
- Firebase Auth errors in browser console

**Solutions**:
1. Verify all `NEXT_PUBLIC_FIREBASE_*` variables are set
2. Check that Firebase Auth domain matches your project
3. Ensure Firebase Auth is enabled in Firebase Console
4. Check browser console for specific Firebase error codes

### Issue: Token refresh problems

**Symptoms**:
- Users get logged out unexpectedly
- API calls fail with 401 errors

**Solutions**:
1. Check token refresh logic in `auth-utils.ts`
2. Verify the `getToken()` function handles race conditions
3. Ensure proper error handling in API client
4. Check browser localStorage for token corruption

## 🧪 Testing Authentication

### Test the Backend

```bash
# Test backend health
curl https://gateway.blytz.work/api/health

# Test with development token (if in dev mode)
curl -H "Authorization: Bearer dev-token-admin" https://gateway.blytz.work/api/auth/profile
```

### Test the Frontend

1. Navigate to `/auth`
2. Try registering a new user
3. Check browser console for Firebase errors
4. Verify successful login redirects to appropriate dashboard

### Test the Integration

1. Register a new user through the frontend
2. Verify user appears in Firebase Console Authentication section
3. Check that user profile is created in backend database
4. Test logout and login functionality

## 📱 Mobile Authentication Preparation

The platform includes mobile authentication preparation:

### Firebase Configuration for Mobile
- Uses the same Firebase project as web
- Supports phone authentication for mobile apps
- Includes custom token generation for mobile clients

### Cross-Platform Features
- Unified user management across web and mobile
- Consistent authentication state
- Shared user profiles and roles

### Mobile-Specific Setup
When building mobile apps:
1. Use the same Firebase project configuration
2. Implement platform-specific Firebase SDK
3. Use custom tokens for seamless web-to-mobile transition
4. Handle deep linking for authentication flows

## 🔒 Security Considerations

### Environment Variables
- Never commit `.env` files to version control
- Use different Firebase projects for development/staging/production
- Rotate service account keys regularly
- Use Firebase App Check for additional security

### Authentication Security
- Enable email verification for production
- Implement proper password policies
- Use HTTPS for all authentication endpoints
- Implement rate limiting on auth endpoints
- Monitor for suspicious authentication patterns

### Token Management
- Use short-lived access tokens
- Implement proper token refresh logic
- Clear tokens on logout
- Handle token expiration gracefully

## 📚 Additional Resources

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Firebase Admin SDK Node.js](https://firebase.google.com/docs/admin/setup)
- [Firebase Client SDK](https://firebase.google.com/docs/web/setup)
- [Platform Security Guide](../SECURITY_FIXES_AND_GUIDE.md)

## 🆘 Getting Help

If you encounter issues:

1. **Check the logs**: Both frontend and backend provide detailed debug logs
2. **Run the setup script**: Use `./scripts/setup-firebase-env.sh` for diagnostics
3. **Verify configuration**: Double-check all environment variables
4. **Test incrementally**: Start with backend, then frontend, then integration
5. **Check Firebase status**: Visit [Firebase Status](https://status.firebase.google.com/)

For additional support, check the project's troubleshooting documentation or create an issue in the repository.