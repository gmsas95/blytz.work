# Docker Deployment Fix for Service Name Issue

## Problem

The deployment command was failing with an error indicating that the service `frontend-final` was not found. This was because the service name in the docker-compose.yml file was actually `blytzwork-frontend`, not `frontend-final`.

## Root Cause

There was a mismatch between:
1. The actual service name in `docker-compose.yml`: `blytzwork-frontend`
2. References to an old service name: `frontend-final`

This was likely due to a recent refactoring where service names were standardized to use the `blytzwork-` prefix for consistency.

## Solution

1. **Verified docker-compose.yml**: Confirmed that the correct service name `blytzwork-frontend` is used in the docker-compose.yml file.

2. **Created deployment script**: Created a new `deploy.sh` script that uses the correct service names and project name.

3. **Deployment Command**: The correct deployment command is:
   ```bash
   docker compose -p blytzwork-webapp-uvey24 -f ./docker-compose.yml up -d --build --remove-orphans
   ```

## Service Names in docker-compose.yml

The docker-compose.yml file uses the following service names:
- `blytzwork-backend` - Backend API service
- `blytzwork-frontend` - Frontend web service
- `postgres` - PostgreSQL database
- `redis` - Redis cache

## Deployment Script

A new deployment script (`deploy.sh`) has been created that:
1. Uses the correct project name (`blytzwork-webapp-uvey24`)
2. References the correct service names
3. Includes health checks for all services
4. Provides useful commands for managing the deployment

### Usage

```bash
# Run the deployment script
./deploy.sh

# Or run the command directly
docker compose -p blytzwork-webapp-uvey24 -f ./docker-compose.yml up -d --build --remove-orphans
```

## Verification

After deployment, you can verify that all services are running correctly:

```bash
# Check service status
docker compose -p blytzwork-webapp-uvey24 -f ./docker-compose.yml ps

# Check service logs
docker compose -p blytzwork-webapp-uvey24 -f ./docker-compose.yml logs -f

# Check individual service health
docker compose -p blytzwork-webapp-uvey24 -f ./docker-compose.yml exec blytzwork-backend curl -f http://localhost:3000/health
docker compose -p blytzwork-webapp-uvey24 -f ./docker-compose.yml exec blytzwork-frontend curl -f http://localhost:3001/
```

## dokploy.yml Configuration

The `dokploy.yml` file correctly references the `blytzwork-frontend` service:
```yaml
blytzwork-service-app:
  loadBalancer:
    servers:
      - url: http://blytzwork-frontend:3001
```

## Summary

The deployment issue has been resolved by ensuring that all references use the correct service name `blytzwork-frontend` instead of the outdated `frontend-final`. The deployment script and documentation have been updated to reflect the correct service names.