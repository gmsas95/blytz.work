# BlytzWork Platform - Clean Dokploy Deployment Guide

## Overview

This guide provides step-by-step instructions for performing a clean deployment of the BlytzWork platform on Dokploy, ensuring no cached state issues from previous deployments with old service names like `frontend-final`.

## Problem Statement

Previous deployments may have left cached state in Docker or Dokploy referencing old service names (`frontend-final`, `backend-final`). This can cause deployment failures when the current configuration uses the correct service names (`blytzwork-frontend`, `blytzwork-backend`).

## Solution Components

1. **Clean Docker Compose File**: `docker-compose.dokploy.yml` - Isolated configuration with proper service names
2. **Cleanup Script**: `scripts/cleanup-docker.sh` - Removes all cached Docker state
3. **Deployment Script**: `scripts/deploy-dokploy.sh` - Performs clean deployment with health checks
4. **This Guide**: Step-by-step instructions for the entire process

## Prerequisites

- Docker and Docker Compose installed
- Access to the Dokploy server
- All required environment variables set in `.env` file
- Sudo privileges (for Docker operations)

## Step 1: Prepare Environment Variables

Ensure you have a properly configured `.env` file in the project root with all required variables:

```bash
# Database Configuration
POSTGRES_DB=blytzwork
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
DATABASE_URL=postgresql://postgres:your_secure_password@postgres:5432/blytzwork

# Redis Configuration
REDIS_URL=redis://redis:6379

# Firebase Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# API Configuration
API_URL=https://gateway.blytz.work
FRONTEND_URL=https://blytz.work
ALLOWED_ORIGINS=https://blytz.work,https://staging.blytz.work,https://www.blytz.work

# Frontend Environment Variables
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_API_URL=https://gateway.blytz.work/api
NEXT_PUBLIC_APP_URL=https://blytz.work
```

## Step 2: Clean Up Docker State

Before deploying, run the cleanup script to remove any cached state:

```bash
# Make the cleanup script executable
chmod +x scripts/cleanup-docker.sh

# Run the cleanup script
./scripts/cleanup-docker.sh
```

The cleanup script will:
- Stop and remove all BlytzWork containers (including old service names)
- Remove unused containers, images, volumes, and networks
- Clean Docker build cache
- Recreate the dokploy-network if needed

## Step 3: Verify dokploy-network

Ensure the dokploy-network exists and is properly configured:

```bash
# Check if the network exists
docker network ls | grep dokploy-network

# If it doesn't exist, create it
docker network create dokploy-network
```

## Step 4: Deploy with Clean Configuration

Use the new deployment script with the clean docker-compose file:

```bash
# Make the deployment script executable
chmod +x scripts/deploy-dokploy.sh

# Run the deployment
./scripts/deploy-dokploy.sh
```

The deployment script will:
- Verify the dokploy-network exists
- Build and start all services with correct names
- Wait for services to initialize
- Perform health checks on all services
- Display logs and status information

## Step 5: Verify Deployment

After deployment, verify that all services are running correctly:

```bash
# Check container status
docker compose -p blytzwork-webapp-uvey24 -f docker-compose.dokploy.yml ps

# Check logs for any issues
docker compose -p blytzwork-webapp-uvey24 -f docker-compose.dokploy.yml logs -f

# Test API endpoints
curl https://gateway.blytz.work/health

# Test frontend
curl -I https://blytz.work
```

## Service Names and Ports

| Service | Container Name | Internal Port | External URL |
|---------|----------------|---------------|--------------|
| Frontend | blytzwork-frontend | 3001 | https://blytz.work |
| Backend | blytzwork-backend | 3000 | https://gateway.blytz.work |
| Database | blytzwork-postgres | 5432 | Internal only |
| Cache | blytzwork-redis | 6379 | Internal only |

## Troubleshooting

### Issue: Service not accessible after deployment

1. Check if containers are running:
   ```bash
   docker ps -a | grep blytzwork
   ```

2. Check container logs:
   ```bash
   docker logs blytzwork-frontend
   docker logs blytzwork-backend
   ```

3. Verify dokploy-network connectivity:
   ```bash
   docker network inspect dokploy-network
   ```

4. Check Traefik configuration in `dokploy.yml`

### Issue: Database connection failed

1. Check database container health:
   ```bash
   docker exec blytzwork-postgres pg_isready -U postgres -d blytzwork
   ```

2. Check database logs:
   ```bash
   docker logs blytzwork-postgres
   ```

3. Verify DATABASE_URL environment variable

### Issue: Redis connection failed

1. Check Redis container health:
   ```bash
   docker exec blytzwork-redis redis-cli ping
   ```

2. Check Redis logs:
   ```bash
   docker logs blytzwork-redis
   ```

3. Verify REDIS_URL environment variable

## Manual Deployment (Alternative)

If you prefer to deploy manually without the script:

```bash
# 1. Clean up (as shown in Step 2)
./scripts/cleanup-docker.sh

# 2. Create dokploy-network (if needed)
docker network create dokploy-network

# 3. Deploy with docker-compose
docker compose -p blytzwork-webapp-uvey24 -f docker-compose.dokploy.yml up -d --build

# 4. Wait for services to start
sleep 30

# 5. Check status
docker compose -p blytzwork-webapp-uvey24 -f docker-compose.dokploy.yml ps
```

## Maintenance Commands

### View Logs
```bash
# All services
docker compose -p blytzwork-webapp-uvey24 -f docker-compose.dokploy.yml logs -f

# Specific service
docker compose -p blytzwork-webapp-uvey24 -f docker-compose.dokploy.yml logs -f blytzwork-backend
```

### Restart Services
```bash
# All services
docker compose -p blytzwork-webapp-uvey24 -f docker-compose.dokploy.yml restart

# Specific service
docker compose -p blytzwork-webapp-uvey24 -f docker-compose.dokploy.yml restart blytzwork-frontend
```

### Update Services
```bash
# Pull latest code and rebuild
docker compose -p blytzwork-webapp-uvey24 -f docker-compose.dokploy.yml up -d --build
```

### Stop Services
```bash
docker compose -p blytzwork-webapp-uvey24 -f docker-compose.dokploy.yml down
```

## Security Considerations

1. **Environment Variables**: Never commit `.env` files to version control
2. **Database Passwords**: Use strong, unique passwords
3. **Network Isolation**: Services are isolated in internal networks
4. **Health Checks**: All services have health checks configured
5. **Volume Encryption**: Consider encrypting volumes at rest for production

## Backup and Recovery

### Database Backup
```bash
# Create backup
docker exec blytzwork-postgres pg_dump -U postgres blytzwork > backup.sql

# Restore backup
docker exec -i blytzwork-postgres psql -U postgres blytzwork < backup.sql
```

### Volume Backup
```bash
# Backup postgres data
docker run --rm -v blytzwork_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz -C /data .

# Restore postgres data
docker run --rm -v blytzwork_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres-backup.tar.gz -C /data
```

## Conclusion

Following this guide ensures a clean deployment without cached state issues from previous deployments. The key is to:

1. Clean up all Docker state before deployment
2. Use the isolated `docker-compose.dokploy.yml` file
3. Verify all services are healthy after deployment
4. Use the provided scripts for consistent deployment

If you encounter any issues not covered in this guide, check the container logs and ensure all environment variables are properly configured.