# Firebase Troubleshooting Guide

This guide provides comprehensive troubleshooting steps for common Firebase authentication issues in the BlytzWork platform.

## Table of Contents
1. [Quick Diagnosis](#quick-diagnosis)
2. [Common Issues](#common-issues)
3. [Debug Tools](#debug-tools)
4. [Step-by-Step Troubleshooting](#step-by-step-troubleshooting)
5. [Advanced Debugging](#advanced-debugging)
6. [Getting Help](#getting-help)

## Quick Diagnosis

### Run These Commands First

```bash
# Check your Firebase configuration
./scripts/verify-firebase-config.sh

# Run the comprehensive debug script
./scripts/debug-auth.sh

# Check environment variables
grep -E "(FIREBASE|NEXT_PUBLIC_FIREBASE)" .env.dokploy
```

### Visit These Pages

- Firebase Debug Page: `https://blytz.work/debug/firebase`
- Backend Health Check: `https://api.blytz.work/api/health`

## Common Issues

### Issue 1: "Firebase is not initialized" Error

**Symptoms:**
- Authentication fails immediately
- Console shows "Cannot initialize Firebase - no valid configuration"
- Debug page shows missing or placeholder values

**Solutions:**

1. **Check Environment Variables**
   ```bash
   # Verify all Firebase variables are set
   ./scripts/verify-firebase-config.sh
   ```

2. **Replace Placeholder Values**
   ```bash
   # Check for REPLACE_WITH_ values
   grep "REPLACE_WITH" .env.dokploy
   ```

3. **Use the Setup Script**
   ```bash
   # Run the interactive setup script
   ./scripts/setup-firebase-env.sh
   ```

4. **Verify Deployment**
   - Ensure environment variables are properly injected by Dokploy
   - Redeploy after updating .env.dokploy

### Issue 2: "Permission denied" or "Invalid token" Errors

**Symptoms:**
- User can sign in but API calls fail
- Backend logs show authentication errors
- Frontend shows "Unauthorized" responses

**Solutions:**

1. **Check Firebase Project Settings**
   - Go to Firebase Console > Authentication > Sign-in method
   - Ensure Email/Password and Google sign-in are enabled
   - Add your domains to authorized domains list

2. **Verify Service Account Permissions**
   ```bash
   # Check backend Firebase configuration
   cd backend && npm run test:firebase
   ```

3. **Ensure Project ID Consistency**
   - Frontend and backend must use the same project ID
   - Check both `NEXT_PUBLIC_FIREBASE_PROJECT_ID` and `FIREBASE_PROJECT_ID`

4. **Check Token Verification**
   - Verify the backend can validate Firebase tokens
   - Check network connectivity to Firebase servers

### Issue 3: Private Key Format Issues

**Symptoms:**
- Backend fails to start
- Firebase Admin initialization fails
- Error messages about invalid certificates

**Solutions:**

1. **Check Private Key Format**
   ```bash
   # Verify private key has proper format
   echo "$FIREBASE_PRIVATE_KEY" | head -1
   # Should show: "-----BEGIN PRIVATE KEY-----
   ```

2. **Ensure Proper Newlines**
   - Private key must contain `\n` characters (not actual newlines)
   - The entire key must be wrapped in double quotes

3. **Regenerate Service Account Key**
   - Go to Firebase Console > Project Settings > Service accounts
   - Generate a new private key
   - Use the setup script to properly format it

### Issue 4: Domain Not Authorized

**Symptoms:**
- Authentication works on localhost but not production
- Error about unauthorized domain in browser console

**Solutions:**

1. **Add Authorized Domains**
   - Go to Firebase Console > Authentication > Settings
   - Add these domains to authorized domains:
     - `blytz.work`
     - `api.blytz.work`
     - `sudo.blytz.work`

2. **Check Auth Domain Configuration**
   - Verify `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` is correct
   - Should be `your-project-id.firebaseapp.com`

3. **Wait for Propagation**
   - Domain changes may take a few minutes to propagate
   - Clear browser cache and retry

## Debug Tools

### 1. Firebase Debug Page

Visit `https://blytz.work/debug/firebase` to see:
- Environment variable status
- Firebase initialization status
- Detailed error messages
- Configuration recommendations

### 2. Verification Script

```bash
./scripts/verify-firebase-config.sh
```

This script provides:
- Frontend and backend variable validation
- Placeholder detection
- Configuration consistency checks
- Connection testing

### 3. Debug Script

```bash
./scripts/debug-auth.sh
```

This script provides:
- Environment variable analysis
- Docker container status
- Backend API testing
- Database connection checks

### 4. Browser Console

Check the browser console for:
- Firebase initialization messages
- Authentication errors
- Network request failures
- JavaScript errors

### 5. Backend Logs

Check backend logs for:
- Firebase Admin initialization
- Token verification attempts
- Database connection issues
- API endpoint errors

## Step-by-Step Troubleshooting

### Step 1: Verify Environment Variables

```bash
# Check all Firebase variables
./scripts/verify-firebase-config.sh

# Look for placeholders
grep -E "(REPLACE_WITH_|your-|XXXXX)" .env.dokploy
```

### Step 2: Test Firebase Connection

```bash
# Test frontend
curl -s https://blytz.work/debug/firebase | grep -E "(firebaseInitialized|error)"

# Test backend
curl -s https://api.blytz.work/api/health | grep -E "(firebase|auth)"
```

### Step 3: Check Firebase Console

1. Verify project exists and is active
2. Check Authentication is enabled
3. Confirm sign-in methods are active
4. Verify authorized domains include your production domains

### Step 4: Test Authentication Flow

1. Open browser developer tools
2. Navigate to `/auth`
3. Attempt to sign in with a test account
4. Check console for Firebase messages
5. Check network tab for API requests

### Step 5: Verify Backend Authentication

```bash
# Test with a valid Firebase token (get from browser)
TOKEN="your_firebase_token_here"
curl -H "Authorization: Bearer $TOKEN" https://api.blytz.work/api/auth/profile
```

## Advanced Debugging

### Check Environment Variable Injection

```bash
# Check if Dokploy is injecting variables correctly
docker exec -it $(docker ps | grep backend | awk '{print $1}') env | grep FIREBASE
```

### Test Firebase Admin SDK Directly

```bash
cd backend
node -e "
const admin = require('firebase-admin');
try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\\\n/g, '\\n')
    })
  });
  console.log('✅ Firebase Admin initialized successfully');
} catch (error) {
  console.error('❌ Firebase Admin initialization failed:', error.message);
}
"
```

### Check Network Connectivity

```bash
# Test connectivity to Firebase servers
curl -I https://firebase.googleapis.com
curl -I https://your-project-id.firebaseio.com
```

### Verify JWT Token Format

```bash
# Decode a Firebase token to check its structure
TOKEN="your_firebase_token_here"
echo $TOKEN | cut -d. -f2 | base64 -d | jq .
```

## Getting Help

### Collect Debug Information

Before seeking help, collect this information:

```bash
# Create a debug report
./scripts/debug-auth.sh > debug-report.txt 2>&1
./scripts/verify-firebase-config.sh >> debug-report.txt 2>&1

# Include browser console output
# Include backend logs
# Include Firebase Console screenshots
```

### Common Questions

**Q: Why does authentication work in development but not production?**
A: Check that your production domains are added to Firebase Console authorized domains.

**Q: I updated my environment variables but nothing changed.**
A: Environment variables require a redeployment to take effect in Dokploy.

**Q: The private key format is confusing.**
A: Use the setup script `./scripts/setup-firebase-env.sh` which handles the formatting automatically.

**Q: How do I know if Firebase is properly initialized?**
A: Visit `/debug/firebase` and look for "Firebase Initialized: ✅ Yes".

### Contact Support

If you're still having issues:

1. Check the complete setup guide: `docs/FIREBASE_SETUP_COMPLETE_GUIDE.md`
2. Run all debug scripts and collect output
3. Provide detailed error messages
4. Include your Firebase project ID (not credentials)
5. Describe what you've already tried

## Prevention Tips

1. **Use the Setup Script**: Always use `./scripts/setup-firebase-env.sh` for initial configuration
2. **Test Before Deploying**: Run `./scripts/verify-firebase-config.sh` before deploying
3. **Monitor Regularly**: Check `/debug/firebase` periodically
4. **Keep Documentation**: Save your Firebase project details securely
5. **Use Different Projects**: Use separate Firebase projects for development and production

## Related Documentation

- [Complete Firebase Setup Guide](./FIREBASE_SETUP_COMPLETE_GUIDE.md)
- [Firebase Configuration Guide](./FIREBASE_CONFIGURATION_GUIDE.md)
- [Platform Documentation](./README.md)
- [Deployment Guide](./DOKPLOY_DEPLOYMENT_GUIDE.md)