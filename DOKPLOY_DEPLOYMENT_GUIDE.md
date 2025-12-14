# Dokploy Deployment Guide

## Overview

This guide explains how to properly deploy the BlytzWork platform using Dokploy with all environment variables correctly configured.

## Fixed Issues

1. **Removed obsolete Docker Compose version**: The `version: '3.8'` attribute has been removed as it's no longer needed in modern Docker Compose.

2. **Fixed environment variable injection**: All environment variables are now properly defined for Dokploy's injection system without fallback values that could mask missing variables.

3. **Created dedicated Dokploy configuration**: New `docker-compose.dokploy-final.yml` specifically optimized for Dokploy deployment.

## Files Created/Modified

1. **docker-compose.dokploy-final.yml**: Production-ready Docker Compose file for Dokploy
2. **.env.dokploy**: Template environment file with all required variables
3. **docker-compose.6-unified-fixed.yml**: Removed obsolete version and fixed variable definitions

## Deployment Steps

### 1. Set Up Environment Variables in Dokploy

In your Dokploy dashboard, navigate to your application's environment variables section and add the following variables:

#### Database Configuration
```
POSTGRES_DB=blytzwork
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password_here
DATABASE_URL=postgresql://postgres:your_secure_password_here@postgres:5432/blytzwork
REDIS_URL=redis://redis:6379
```

#### Firebase Configuration - Frontend (Client SDK)
```
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

#### Firebase Configuration - Backend (Admin SDK)
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef123456
FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

#### Stripe Configuration
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

#### JWT Configuration
```
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
```

#### API Configuration
```
API_URL=https://gateway.blytz.work
FRONTEND_URL=https://blytz.work
NEXT_PUBLIC_API_URL=https://gateway.blytz.work/api
ALLOWED_ORIGINS=https://blytz.work,gateway.blytz.work,sudo.blytz.work
```

### 2. Use the Correct Docker Compose File

In your Dokploy application, use the `docker-compose.dokploy-final.yml` file instead of the previous versions. This file:

- Has no obsolete version declaration
- Requires all environment variables to be explicitly set (no fallbacks)
- Is optimized for Dokploy's environment variable injection system

### 3. Network Configuration

Ensure the `dokploy-network` external network exists in your Docker environment:

```bash
docker network create dokploy-network
```

### 4. Deploy the Application

1. Push your changes to your repository
2. In Dokploy, trigger a new deployment
3. Monitor the deployment logs to ensure all environment variables are properly injected

## Troubleshooting

### Environment Variables Not Showing Up

If you see warnings about environment variables not being set:

1. Check that all variables are properly configured in Dokploy's environment variables section
2. Ensure there are no syntax errors in your variable values (especially for the Firebase private key)
3. Verify that the variable names match exactly between Dokploy and your Docker Compose file

### Firebase Private Key Issues

The Firebase private key must be properly formatted:

1. Include the entire key including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines
2. Replace all actual newlines with `\n` characters
3. Wrap the entire key in quotes

Example:
```
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

### Database Connection Issues

If the backend can't connect to the database:

1. Verify the `DATABASE_URL` format is correct
2. Ensure the PostgreSQL container is healthy
3. Check that both containers are on the same Docker network

## Verification

After deployment, you can verify that all environment variables are properly set by:

1. Checking the application logs for any environment variable warnings
2. Visiting the `/health` endpoint on the backend
3. Testing Firebase authentication in the frontend
4. Verifying Stripe payment processing

## Security Notes

1. Never commit actual secrets to your repository
2. Use strong, unique passwords for the database
3. Regularly rotate your JWT secret and API keys
4. Ensure all sensitive variables are properly marked as secret in Dokploy

## Next Steps

1. Configure your domain names in Traefik
2. Set up SSL certificates with Let's Encrypt
3. Configure monitoring and alerting
4. Set up automated backups for the database