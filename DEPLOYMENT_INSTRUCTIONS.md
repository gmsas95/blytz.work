# Deployment Instructions for Fixed Docker Compose Configuration

## Overview

The service naming issue in `docker-compose.minimal.yml` has been fixed and committed to Git. The changes resolve the "service not found" error during deployment by updating service names to match what Dokploy expects:

- `frontend` → `frontend-final`
- `backend` → `backend-final`

## Quick Deployment Steps

### 1. Pull the Latest Changes

First, ensure you have the latest changes from the repository:

```bash
git pull origin main
```

### 2. Deploy with Dokploy

1. **Update your Dokploy project configuration** to use the `docker-compose.minimal.yml` file
2. **Verify the service names** in your Dokploy routing configuration match:
   - Frontend: `blytzwork-frontend-final:3001`
   - Backend: `blytzwork-backend-final:3002`
3. **Trigger a new deployment** in Dokploy

### 3. Verify the Deployment

After deployment, verify that all services are running correctly:

```bash
# Check service status
docker-compose -f docker-compose.minimal.yml ps

# Check service logs
docker-compose -f docker-compose.minimal.yml logs -f

# Test health endpoints
curl http://localhost:3002/health  # Backend health
curl http://localhost:3001/        # Frontend health
```

## Detailed Deployment Guide

### Prerequisites

Ensure you have the following environment variables set in your `.env` file:

```bash
# Database
DATABASE_URL="postgresql://postgres:blytzwork_secure_password_2024@postgres:5432/blytzwork"
REDIS_URL="redis://redis:6379"

# Firebase - Backend
FIREBASE_PROJECT_ID="your-firebase-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# Firebase - Frontend
NEXT_PUBLIC_FIREBASE_API_KEY="your-firebase-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-firebase-project-id"

# Application URLs
NEXT_PUBLIC_API_URL="https://gateway.blytz.work/api"
NEXT_PUBLIC_APP_URL="https://blytz.work"
API_URL="https://gateway.blytz.work"
FRONTEND_URL="https://blytz.work"

# Security
JWT_SECRET="your-jwt-secret-here"
ALLOWED_ORIGINS="https://blytz.work,https://staging.blytz.work,https://www.blytz.work"

# Stripe (if applicable)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

### Step-by-Step Deployment

#### Step 1: Update Your Repository

```bash
# Navigate to your project directory
cd /path/to/blytz.work

# Pull the latest changes with the fixed configuration
git pull origin main

# Verify the fixed file is present
cat docker-compose.minimal.yml | grep -E "(backend-final|frontend-final)"
```

#### Step 2: Update Dokploy Configuration

1. Log in to your Dokploy dashboard
2. Navigate to your BlytzWork project
3. Update the Docker Compose file path to point to `docker-compose.minimal.yml`
4. Ensure the service names in your routing configuration match:
   - Frontend service: `blytzwork-frontend-final`
   - Backend service: `blytzwork-backend-final`
5. Save the configuration

#### Step 3: Deploy the Application

1. Click "Deploy" in Dokploy to trigger a new deployment
2. Monitor the deployment logs for any errors
3. Wait for all services to become healthy

#### Step 4: Verify the Deployment

1. **Check Service Status**:
   ```bash
   docker-compose -f docker-compose.minimal.yml ps
   ```
   You should see all services (postgres, redis, backend-final, frontend-final) as "healthy" or "running".

2. **Test Health Endpoints**:
   ```bash
   # Backend health check
   curl http://localhost:3002/health
   
   # Frontend health check
   curl http://localhost:3001/
   ```

3. **Check Application URLs**:
   - Frontend: https://blytz.work
   - Backend API: https://gateway.blytz.work/api/health

## Troubleshooting

### If Services Fail to Start

1. **Check Logs**:
   ```bash
   docker-compose -f docker-compose.minimal.yml logs backend-final
   docker-compose -f docker-compose.minimal.yml logs frontend-final
   ```

2. **Verify Environment Variables**:
   ```bash
   docker-compose -f docker-compose.minimal.yml config
   ```

3. **Check Network Connectivity**:
   ```bash
   # Test backend to database connectivity
   docker exec blytzwork-backend-final ping postgres
   
   # Test frontend to backend connectivity
   docker exec blytzwork-frontend-final curl http://blytzwork-backend-final:3000/health
   ```

### If 503 Errors Persist

1. **Verify Service Names**: Ensure Dokploy is routing to the correct service names (`blytzwork-frontend-final` and `blytzwork-backend-final`)
2. **Check Port Mappings**: Verify ports 3001 (frontend) and 3002 (backend) are correctly mapped
3. **Review Health Checks**: Ensure all services pass their health checks

### If Authentication Issues Occur

1. **Verify Firebase Configuration**: Check all Firebase-related environment variables
2. **Check CORS Settings**: Ensure your domain is in the ALLOWED_ORIGINS list
3. **Review Firebase Console**: Verify your Firebase project settings

## What Was Fixed

The issue was that the service names in `docker-compose.minimal.yml` didn't match what Dokploy expected:

1. **Service Name Mismatch**:
   - Before: `frontend` and `backend`
   - After: `frontend-final` and `backend-final`

2. **Container Name Consistency**:
   - Frontend container: `blytzwork-frontend-final`
   - Backend container: `blytzwork-backend-final`

3. **Dependency Updates**:
   - Frontend now correctly depends on `backend-final` instead of `backend`

These changes ensure that Dokploy can properly discover and route to the services, eliminating the "service not found" error.

## Next Steps

After successful deployment:

1. Monitor the application for any issues
2. Test user registration and authentication flows
3. Verify all platform features are working correctly
4. Set up monitoring and alerts for production

## Support

If you encounter any issues during deployment:

1. Check the logs for error messages
2. Review the troubleshooting section above
3. Refer to the full documentation in `docs/DOCKER_COMPOSE_MINIMAL_GUIDE.md`
4. Test with the minimal configuration script: `./scripts/test-minimal-config.sh`

The fixed configuration is now committed to the repository and ready for production deployment.