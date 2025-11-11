# Dokploy Deployment Guide

## Quick Setup

### 1. Environment Variables
See [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) for all required environment variables.

**Backend Required Variables:**
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

### 2. Port Configuration
- The app runs on port 3000 internally
- Dokploy will assign external port automatically
- No port conflicts should occur

### 3. Deployment Settings
- **Repository**: https://github.com/gmsas95/blytz-hyred.git
- **Root Path**: `./backend`
- **Compose File**: `docker-compose.backend.yml`
- **Health Check**: http://localhost:3000/health

### 4. Database Setup
Make sure your DATABASE_URL includes:
- PostgreSQL connection string
- Valid credentials
- Database name

### 5. Firebase Setup
1. Go to Firebase Console → Project Settings → Service Accounts
2. Generate new private key
3. Copy the JSON content into the FIREBASE_PRIVATE_KEY variable
4. Use proper newline formatting with `\n`

### 6. Stripe Setup
1. Get keys from Stripe Dashboard
2. Use test keys for development
3. Configure webhook secret for production

## Troubleshooting

### Port Already Allocated
- Fixed: Removed explicit port mapping to let Dokploy handle it

### Missing Environment Variables
- Add all required variables in Dokploy dashboard
- Restart deployment after adding variables

### Health Check Failures
- Wait 60 seconds after deployment
- Check logs in Dokploy dashboard
- Verify all environment variables are set

## Frontend Deployment

### Environment Variables
Copy the variables from `.env.frontend` into your Dokploy frontend app settings:

**Required Variables:**
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

### Frontend Settings
- **Root Path**: `./frontend`
- **Compose File**: `docker-compose.frontend.yml`
- **Health Check**: http://localhost:3001

## Nginx Reverse Proxy (Optional)

### Environment Variables
Copy the variables from `.env.nginx` into your Dokploy nginx app settings:

**Required Variables:**
```
BACKEND_URL=blytz-backend:3000
FRONTEND_URL=blytz-frontend:3001
SERVER_NAME=your-domain.com
HTTP_PORT=80
HTTPS_PORT=443
```

### Nginx Settings
- **Root Path**: `./`
- **Compose File**: `docker-compose.nginx.yml`
- **Health Check**: http://localhost/health

### Important Notes
- Deploy backend and frontend first
- Update service names if your Dokploy containers have different names
- Configure SSL certificates in `nginx/ssl/` directory if needed

## Success Indicators
✅ Backend container builds successfully  
✅ Backend health check passes  
✅ Backend API responds at your-domain.com/health
✅ Frontend container builds successfully
✅ Frontend health check passes
✅ Frontend app responds at your-frontend-domain.com
✅ Nginx reverse proxy routes traffic correctly
✅ Full application accessible via single domain