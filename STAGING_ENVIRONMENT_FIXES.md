# Staging Environment Fixes Required

## 🚨 Critical Issues Identified

Based on the deployment logs, the following issues need immediate attention:

### 1. Missing Environment Variables in Dokploy

The deployment shows multiple warnings about missing environment variables:

```
The "POSTGRES_PASSWORD" variable is not set. Defaulting to a blank string.
The "FIREBASE_STORAGE_BUCKET" variable is not set. Defaulting to a blank string.
The "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET" variable is not set. Defaulting to a blank string.
The "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID" variable is not set. Defaulting to a blank string.
The "FIREBASE_APP_ID" variable is not set. Defaulting to a blank string.
The "FIREBASE_MEASUREMENT_ID" variable is not set. Defaulting to a blank string.
The "FRONTEND_URL" variable is not set. Defaulting to a blank string.
The "FIREBASE_MESSAGING_SENDER_ID" variable is not set. Defaulting to a blank string.
The "API_URL" variable is not set. Defaulting to a blank string.
The "NEXT_PUBLIC_FIREBASE_PROJECT_ID" variable is not set. Defaulting to a blank string.
The "REDIS_URL" variable is not set. Defaulting to a blank string.
```

### 2. Firebase Configuration Issues

The frontend build shows Firebase configuration problems:

```
🔍 Raw Firebase config from environment: {
   apiKey: 'Present',
   authDomain: 'Present',
   projectId: 'Missing',
   apiKeyPreview: 'AIzaSyDy63cQFqr6DT7_...'
}
🔧 Using mock Firebase auth - no valid configuration available
❌ No valid Firebase configuration available
```

### 3. Database Initialization Status

The database initialization commands were added to the Docker Compose file, but we need to verify they executed correctly.

## 🔧 Required Actions

### Step 1: Add Missing Environment Variables to Dokploy

You need to add these environment variables to your Dokploy dashboard for the staging application:

#### Database Variables:
- `POSTGRES_PASSWORD`: Your secure PostgreSQL password
- `POSTGRES_USER`: blytz_user (already set in Docker Compose)
- `POSTGRES_DB`: blytz_work (already set in Docker Compose)
- `REDIS_URL`: redis://blytzwork-unified-redis:6379

#### Firebase Variables (Backend):
- `FIREBASE_PROJECT_ID`: Your Firebase project ID
- `FIREBASE_CLIENT_EMAIL`: Your Firebase service account email
- `FIREBASE_PRIVATE_KEY`: Your Firebase service account private key
- `FIREBASE_STORAGE_BUCKET`: Your Firebase storage bucket
- `FIREBASE_APP_ID`: Your Firebase app ID
- `FIREBASE_MESSAGING_SENDER_ID`: Your Firebase messaging sender ID
- `FIREBASE_MEASUREMENT_ID`: Your Firebase measurement ID

#### Firebase Variables (Frontend - NEXT_PUBLIC_ prefix):
- `NEXT_PUBLIC_FIREBASE_API_KEY`: Your Firebase API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Your Firebase auth domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Your Firebase project ID
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: Your Firebase storage bucket
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: Your Firebase messaging sender ID
- `NEXT_PUBLIC_FIREBASE_APP_ID`: Your Firebase app ID
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`: Your Firebase measurement ID

#### Application URLs:
- `FRONTEND_URL`: https://staging.blytz.work (or your staging URL)
- `API_URL`: https://staging-api.blytz.work (or your staging API URL)

#### Other Variables:
- `STRIPE_SECRET_KEY`: Your Stripe secret key (for staging)
- `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook secret (for staging)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key (for staging)
- `JWT_SECRET`: Your JWT secret for authentication

### Step 2: Verify Firebase Configuration

1. Go to your Firebase Console
2. Select your project
3. Go to Project Settings > General
4. Copy the Firebase configuration object
5. Ensure all required fields are present in your Dokploy environment variables

### Step 3: Test Database Connection

After adding the environment variables, check if the database initialization worked:

1. Check PostgreSQL container logs: `docker logs blytzwork-unified-postgres`
2. Verify the blytz_user and blytz_hire schema were created
3. Check if backend can connect to the database

### Step 4: Redeploy Application

1. Go to your Dokploy dashboard
2. Trigger a redeployment of the staging application
3. Monitor the deployment logs
4. Verify all containers start successfully

## 🔍 Verification Steps

After applying the fixes:

1. **Check Container Status**: All 4 containers should be running without restarts
2. **Check Backend Logs**: Should show successful database connection
3. **Check Frontend Build**: Should show successful Firebase initialization
4. **Test Application**: Access the staging URL and verify functionality

## 📋 Environment Variable Template

Use this template for your Dokploy environment variables:

```
# Database
POSTGRES_PASSWORD=your_secure_password
POSTGRES_USER=blytz_user
POSTGRES_DB=blytz_work
REDIS_URL=redis://blytzwork-unified-redis:6379

# Firebase Backend
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_APP_ID=your_firebase_app_id
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_MEASUREMENT_ID=your_measurement_id

# Firebase Frontend
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Application URLs
FRONTEND_URL=https://staging.blytz.work
API_URL=https://staging-api.blytz.work

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Security
JWT_SECRET=your_jwt_secret_key
```

## 🚨 Important Notes

1. **Security**: Never commit actual credentials to Git
2. **Firebase Private Key**: Ensure proper formatting with newlines
3. **Stripe Keys**: Use test keys for staging environment
4. **URLs**: Update URLs to match your actual staging domain

After applying these fixes, the staging environment should be fully functional.