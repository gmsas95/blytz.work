# Firebase Environment Variables Setup for Dokploy

## Current Issue

The application is deployed successfully, but Firebase authentication is not working because environment variables are not configured in Dokploy. The frontend shows:

```
❌ No valid Firebase configuration available
Configuration analysis: {
  totalVariables: 6,
  validVariables: 0,
  essentialValid: 0,
  templateVariables: 0,
  status: 'Essential variables (apiKey, authDomain, projectId) are either missing or contain template syntax'
}
```

## Required Firebase Environment Variables

You need to set these environment variables in your Dokploy dashboard:

### Frontend Variables (NEXT_PUBLIC_*)
1. `NEXT_PUBLIC_FIREBASE_API_KEY`
   - Your Firebase Web API key
   - Found in Firebase Console → Project Settings → General → Your apps → Web App → Config

2. `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - Your Firebase auth domain
   - Format: `your-project-id.firebaseapp.com`
   - Found in Firebase Console → Project Settings → General → Your apps → Web App → Config

3. `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - Your Firebase project ID
   - Found in Firebase Console → Project Settings → General

4. `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - Your Firebase storage bucket name
   - Format: `your-project-id.appspot.com`
   - Found in Firebase Console → Storage → Files

5. `NEXT_PUBLIC_FIREBASE_APP_ID`
   - Your Firebase app ID
   - Found in Firebase Console → Project Settings → General → Your apps → Web App → Config

6. `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - Your Firebase messaging sender ID (optional)
   - Found in Firebase Console → Project Settings → Cloud Messaging

### Backend Variables
1. `FIREBASE_PROJECT_ID`
   - Same as frontend: Your Firebase project ID

2. `FIREBASE_CLIENT_EMAIL`
   - Firebase service account email
   - Found in Firebase Console → Project Settings → Service Accounts

3. `FIREBASE_PRIVATE_KEY`
   - Firebase service account private key
   - Download JSON file from Firebase Console → Project Settings → Service Accounts
   - Copy the `private_key` value from the JSON

## Steps to Configure in Dokploy

1. Log in to your Dokploy dashboard
2. Navigate to your application (blytzwork-webapp-uvey24)
3. Go to Environment Variables section
4. Add all the variables listed above with their correct values
5. Save and redeploy the application

## After Configuration

Once you've set these variables:
1. Redeploy the application in Dokploy
2. The Firebase authentication should work properly
3. Users will be able to register and login
4. Mock authentication will be replaced with real Firebase authentication

## Verification

After redeployment, check the browser console to confirm:
- ✅ Firebase initialized successfully
- ✅ No "Mock user creation is disabled" message
- ✅ Login/registration forms work properly

## Security Notes

- Never commit Firebase credentials to git
- Keep your service account JSON file secure
- Use different Firebase projects for development and production
- Regularly rotate your Firebase private keys if compromised