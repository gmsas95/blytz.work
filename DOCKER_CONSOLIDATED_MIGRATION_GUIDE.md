# Docker Compose Consolidation Migration Guide

## Overview

This guide explains how to migrate from the current multiple Docker Compose files setup to the consolidated `docker-compose.consolidated.yml` file optimized for Dokploy Method 1.

## Key Changes in Consolidated File

### Service Name Standardization
- `backend-final` → `blytzwork-backend` (consistent naming with container names)
- `frontend-final` → `blytzwork-frontend` (consistent naming with container names)
- `postgres` and `redis` remain unchanged

### Port Configuration
- Backend (blytzwork-backend): Standardized to port 3000 (was inconsistent between 3000 and 3002)
- Frontend (blytzwork-frontend): Remains at port 3001
- Removed all host port mappings for Dokploy Method 1 compatibility

### Network Configuration
- Uses only `dokploy-network` (removed internal `blytzwork-network`)
- All services connect to the external dokploy network for proper routing

### Health Checks
- Standardized health check endpoints
- Consistent intervals and retry policies
- Proper startup periods for all services

## Migration Steps

### 1. Backup Current Configuration

```bash
# Create backup directory
mkdir -p backup/$(date +%Y%m%d)

# Backup existing files
cp docker-compose.yml backup/$(date +%Y%m%d)/
cp dokploy.yml backup/$(date +%Y%m%d)/
```

### 2. Stop Current Services

```bash
# Stop all running containers
docker-compose down

# Using the standard docker-compose.yml
docker-compose -f docker-compose.yml down
```

### 3. Update Environment Variables

Ensure your `.env` file contains all required variables:

```bash
# Database
DATABASE_URL=postgresql://postgres:blytzwork_secure_password_2024@postgres:5432/blytzwork
REDIS_URL=redis://redis:6379

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Frontend Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Application URLs
API_URL=https://gateway.blytz.work
FRONTEND_URL=https://blytz.work
NEXT_PUBLIC_API_URL=https://gateway.blytz.work/api
NEXT_PUBLIC_APP_URL=https://blytz.work

# Security
JWT_SECRET=your-jwt-secret
ALLOWED_ORIGINS=https://blytz.work,https://staging.blytz.work,https://www.blytz.work
```

### 4. Deploy with Consolidated File

```bash
# Start services with consolidated configuration
docker-compose -f docker-compose.consolidated.yml up -d

# Verify services are running
docker-compose -f docker-compose.consolidated.yml ps
```

### 5. Verify Health Checks

```bash
# Check service health
docker-compose -f docker-compose.consolidated.yml exec blytzwork-backend curl -f http://localhost:3000/health
docker-compose -f docker-compose.consolidated.yml exec blytzwork-frontend curl -f http://localhost:3001/
docker-compose -f docker-compose.consolidated.yml exec postgres pg_isready -U postgres -d blytzwork
docker-compose -f docker-compose.consolidated.yml exec redis redis-cli ping
```

### 6. Update Dokploy Configuration

The `dokploy.yml` file has been updated to reference the new service names:
- `blytzwork-backend-final:3002` → `blytzwork-backend:3000`
- `blytzwork-frontend-final:3001` → `blytzwork-frontend:3001`

Note: The service names in docker-compose.consolidated.yml have been fixed to ensure consistency between the service names and container names. Both now use the `blytzwork-backend` and `blytzwork-frontend` naming convention.

If you're using Dokploy, restart the Traefik service to apply the changes:

```bash
# Restart Traefik to apply new routing
docker restart traefik
```

## Verification Checklist

- [ ] All containers start successfully
- [ ] Health checks pass for all services
- [ ] Frontend loads at https://blytz.work
- [ ] Backend API responds at https://gateway.blytz.work
- [ ] Database connections work properly
- [ ] Redis caching functions correctly
- [ ] Firebase authentication works
- [ ] Stripe payment processing functions

## Troubleshooting

### Common Issues

1. **Container Name Conflicts**
   ```bash
   # Remove old containers if they exist
   docker rm blytzwork-backend-final blytzwork-frontend-final
   
   # Or if using the old service names
   docker stop backend frontend
   docker rm backend frontend
   ```

2. **Network Issues**
   ```bash
   # Verify dokploy-network exists
   docker network ls | grep dokploy-network
   
   # Create if missing
   docker network create dokploy-network
   ```

3. **Port Conflicts**
   ```bash
   # Check for port conflicts
   netstat -tulpn | grep :3000
   netstat -tulpn | grep :3001
   ```

4. **Environment Variables**
   ```bash
   # Verify environment variables are loaded
   docker-compose -f docker-compose.consolidated.yml config
   ```

### Rollback Procedure

If you need to rollback to the previous configuration:

```bash
# Stop consolidated services
docker-compose -f docker-compose.consolidated.yml down

# Restore original dokploy.yml
cp backup/$(date +%Y%m%d)/dokploy.yml .

# Start with original configuration
docker-compose -f docker-compose.yml up -d
```

## Benefits of Consolidated File

1. **Single Source of Truth**: One file contains all service definitions
2. **Simplified Maintenance**: Easier to update and manage
3. **Consistent Naming**: Standardized service names across the platform
4. **Optimized for Dokploy**: Proper network configuration for Method 1
5. **Enhanced Health Checks**: Comprehensive monitoring for all services
6. **Removed Redundancy**: Eliminated duplicate configurations

## Next Steps

1. Test the consolidated configuration in a staging environment first
2. Update deployment scripts to use the new file
3. Update documentation to reference the consolidated file
4. Remove old Docker Compose files after successful migration
5. Update CI/CD pipelines if applicable

## Support

For issues during migration:
1. Check container logs: `docker-compose -f docker-compose.consolidated.yml logs [service]`
   - Use service names: `blytzwork-backend`, `blytzwork-frontend`, `postgres`, `redis`
2. Verify network connectivity: `docker network inspect dokploy-network`
3. Check environment variables: `docker-compose -f docker-compose.consolidated.yml config`
4. Review this guide and the official Dokploy documentation