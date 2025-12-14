# Firebase Configuration Guide

This guide will help you configure Firebase for the BlytzWork platform. The platform requires both frontend (Client SDK) and backend (Admin SDK) Firebase credentials.

## Prerequisites

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication in your Firebase project
3. Enable Email/Password and Google Sign-In methods
4. (Optional) Enable Firestore if you need additional database features

## Step 1: Get Frontend Firebase Credentials (Client SDK)

1. In the Firebase Console, go to Project Settings
2. Click on "General" tab
3. Scroll down to "Your apps" section
4. Click on the web app icon (`</>`) to create a new web app or select an existing one
5. Copy the Firebase configuration object

Your frontend Firebase configuration should look like this:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789012345678"
};
```

## Step 2: Get Backend Firebase Credentials (Admin SDK)

1. In the Firebase Console, go to Project Settings
2. Click on "Service accounts" tab
3. Click "Generate new private key"
4. Save the JSON file securely - this contains your private key

The downloaded JSON file will contain:
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "abcdef123456789012345678",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com",
  "client_id": "123456789012345678901",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project-id.iam.gserviceaccount.com"
}
```

## Step 3: Update Your Environment Variables

Update the `.env.dokploy` file with your actual Firebase credentials:

### Frontend Variables (Client SDK)
- `NEXT_PUBLIC_FIREBASE_API_KEY`: The apiKey from your Firebase config
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Your project's auth domain (usually `project-id.firebaseapp.com`)
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Your Firebase project ID
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: Your storage bucket (usually `project-id.appspot.com`)
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: The messagingSenderId from your config
- `NEXT_PUBLIC_FIREBASE_APP_ID`: The appId from your config

### Backend Variables (Admin SDK)
- `FIREBASE_PROJECT_ID`: Your Firebase project ID (same as above)
- `FIREBASE_CLIENT_EMAIL`: The client_email from your service account JSON
- `FIREBASE_PRIVATE_KEY`: The private_key from your service account JSON (with proper escaping)

## Important Notes

### Private Key Format
The private key must be properly formatted in your environment file:
1. Keep the `\n` characters as-is (they represent actual newlines)
2. Wrap the entire key in double quotes
3. Make sure there are no extra spaces or characters

Example:
```
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

### Environment Variable Security
- Never commit your actual Firebase credentials to version control
- Use environment variables in production
- Keep your service account JSON file secure and private
- Regularly rotate your keys if they might be compromised

## Testing Your Configuration

After updating your environment variables:

1. Test the backend Firebase connection:
   ```bash
   cd backend
   npm run test:firebase
   ```

2. Test the frontend Firebase connection:
   - Visit your application
   - Check the browser console for Firebase initialization messages
   - Try to sign in with email/password or Google

3. Use the debug endpoint:
   - Visit `/debug/firebase` to see your Firebase configuration status
   - This will show which variables are missing or invalid

## Troubleshooting

### Common Issues

1. **"Invalid Firebase configuration" error**
   - Check that all required environment variables are set
   - Verify there are no template syntax placeholders (`your-...` values)
   - Ensure the private key is properly formatted with `\n` characters

2. **"Permission denied" errors**
   - Verify your service account has the necessary Firebase permissions
   - Check that the Firebase project ID matches between frontend and backend

3. **"Network error" when connecting to Firebase**
   - Verify your project ID is correct
   - Check that Authentication is enabled in your Firebase console
   - Ensure your domain is added to the authorized domains in Firebase Auth settings

### Debug Commands

Use these commands to debug your Firebase configuration:

```bash
# Check environment variables
./scripts/debug-auth.sh

# Test backend Firebase connection
cd backend && npm run test:firebase

# Check frontend Firebase initialization
# Open browser console and look for Firebase logs
```

## Firebase Console Configuration Checklist

- [ ] Project created and selected
- [ ] Authentication enabled
- [ ] Email/Password sign-in method enabled
- [ ] Google sign-in method enabled
- [ ] Web app registered (for frontend)
- [ ] Service account created with private key downloaded (for backend)
- [ ] Authorized domains configured (include your production domain)
- [ ] Security rules configured for Firestore/Storage (if using)

## Production Deployment Notes

For production deployment:

1. Use different Firebase projects for development and production
2. Set up proper Firebase Security Rules
3. Configure Firebase Analytics and monitoring
4. Set up alerts for unusual authentication activity
5. Regularly backup your Firebase configuration

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication Guide](https://firebase.google.com/docs/auth)
- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)