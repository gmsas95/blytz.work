# Environment Variables Setup

## Backend Environment Variables
Add these in your Dokploy backend app settings:

```
DATABASE_URL=postgresql://username:password@host:5432/database
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
NODE_ENV=production
```

## Frontend Environment Variables
Add these in your Dokploy frontend app settings:

```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890abcdef12
```

## Nginx Environment Variables (Optional)
Add these in your Dokploy nginx app settings:

```
BACKEND_URL=blytz-backend:3000
FRONTEND_URL=blytz-frontend:3001
SERVER_NAME=your-domain.com
HTTP_PORT=80
HTTPS_PORT=443
```