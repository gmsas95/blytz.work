# BlytzWork Deployment Guide

## Quick Deployment to Dokploy

### 1. Repository & Branch
- **Repository**: https://github.com/gmsas95/blytz.work.git
- **Branch**: staging (contains all authentication fixes)

### 2. Docker Compose File
- **Use**: `docker-compose.6-unified-fixed.yml`
- **This file contains**:
  - Corrected service names (`frontend-final`, `backend-final`)
  - Firebase environment variables configuration
  - PostgreSQL database initialization fix
  - API URL fixes

### 3. Environment Variables Required in Dokploy

#### Firebase Frontend Variables:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

#### Firebase Backend Variables:
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

#### Other Required Variables:
```
DATABASE_URL=postgresql://postgres:password@postgres:5432/blytzwork
REDIS_URL=redis://redis:6379
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
NEXT_PUBLIC_API_URL=https://api.blytz.work
```

### 4. Deployment Steps

1. **In Dokploy Dashboard**:
   - Select your application
   - Go to Environment Variables section
   - Add all the variables listed above
   - Make sure there's NO template syntax ({{variable}}) in values

2. **Deploy**:
   - Dokploy will automatically use `docker-compose.6-unified-fixed.yml`
   - Wait for deployment to complete

3. **Verify**:
   - Visit `https://blytz.work/debug/firebase` to check Firebase configuration
   - Try logging in to test authentication

### 5. Troubleshooting

If authentication still fails:
1. Check the debug page at `https://blytz.work/debug/firebase`
2. Verify all Firebase variables are set in Dokploy
3. Check browser console for specific error messages
4. Ensure no template syntax remains in environment variables

The `docker-compose.6-unified-fixed.yml` file is production-ready and contains all fixes for the authentication token issue.