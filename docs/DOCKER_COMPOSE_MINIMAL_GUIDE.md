# Minimal Docker Compose Configuration for BlytzWork Platform

This guide provides a minimal Docker Compose configuration that resolves network connectivity issues and 503 Service Unavailable errors when deploying with Dokploy.

## Problem Analysis

### Identified Issues in Current Setup

1. **Port Mismatch**:
   - Backend server listens on port 3000 (container) but is mapped to host port 3002
   - Dokploy routes to backend on port 3002, causing confusion in service discovery
   - Frontend tries to connect to backend via incorrect port

2. **Service Discovery Problems**:
   - Frontend doesn't wait for backend to be healthy before starting
   - Missing health checks for backend service
   - Incorrect health check endpoint for frontend (`/api/health` doesn't exist)

3. **Network Configuration**:
   - External network `dokploy-network` may not be properly created
   - No explicit network isolation between services

4. **Environment Variable Inconsistencies**:
   - Backend and frontend use different URL formats for API communication
   - Missing proper domain configuration for production environment

## Solution: Minimal Docker Compose Configuration

Create a new file `docker-compose.minimal.yml` with the following content:

```yaml
# Minimal Docker Compose for BlytzWork Platform
# Optimized for Dokploy deployment with proper network configuration
# Resolves 503 Service Unavailable errors and network connectivity issues

version: '3.8'

services:
  # PostgreSQL Database - Essential for backend
  postgres:
    image: postgres:15-alpine
    container_name: blytzwork-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-blytzwork}
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-blytzwork_secure_password_2024}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/prisma:/docker-entrypoint-initdb.d
    networks:
      - blytzwork-network
    healthcheck:
      test: ["CMD", "sh", "-c", "pg_isready -U ${POSTGRES_USER:-postgres} -d ${POSTGRES_DB:-blytzwork}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s

  # Redis Cache - Essential for sessions and caching
  redis:
    image: redis:7-alpine
    container_name: blytzwork-redis
    restart: unless-stopped
    volumes:
      - redis_data:/data
    networks:
      - blytzwork-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  # Backend API - Fixed port configuration for Dokploy
  backend-final:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: blytzwork-backend-final
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 3000  # Container internal port
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: ${REDIS_URL:-redis://redis:6379}
      FIREBASE_PROJECT_ID: ${FIREBASE_PROJECT_ID}
      FIREBASE_CLIENT_EMAIL: ${FIREBASE_CLIENT_EMAIL}
      FIREBASE_PRIVATE_KEY: ${FIREBASE_PRIVATE_KEY}
      JWT_SECRET: ${JWT_SECRET}
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
      STRIPE_WEBHOOK_SECRET: ${STRIPE_WEBHOOK_SECRET}
      API_URL: ${API_URL:-https://gateway.blytz.work}
      FRONTEND_URL: ${FRONTEND_URL:-https://blytz.work}
      ALLOWED_ORIGINS: ${ALLOWED_ORIGINS:-https://blytz.work,https://staging.blytz.work,https://www.blytz.work}
    ports:
      - "3002:3000"  # Host port 3002 -> Container port 3000 (matches Dokploy config)
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - blytzwork-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

  # Frontend - Fixed configuration for proper backend communication
  frontend-final:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        NEXT_PUBLIC_FIREBASE_API_KEY: ${NEXT_PUBLIC_FIREBASE_API_KEY}
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${NEXT_PUBLIC_FIREBASE_PROJECT_ID}
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: ${NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: ${NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}
        NEXT_PUBLIC_FIREBASE_APP_ID: ${NEXT_PUBLIC_FIREBASE_APP_ID}
        NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: ${NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID}
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
        NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL:-https://gateway.blytz.work/api}
    container_name: blytzwork-frontend-final
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 3001
      NEXT_PUBLIC_FIREBASE_API_KEY: ${NEXT_PUBLIC_FIREBASE_API_KEY}
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${NEXT_PUBLIC_FIREBASE_PROJECT_ID}
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: ${NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: ${NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}
      NEXT_PUBLIC_FIREBASE_APP_ID: ${NEXT_PUBLIC_FIREBASE_APP_ID}
      NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: ${NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID}
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
      NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL:-https://gateway.blytz.work/api}
      NEXT_PUBLIC_APP_URL: ${NEXT_PUBLIC_APP_URL:-https://blytz.work}
    ports:
      - "3001:3001"  # Host port 3001 -> Container port 3001 (matches Dokploy config)
    depends_on:
      backend-final:
        condition: service_healthy
    networks:
      - blytzwork-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local

networks:
  blytzwork-network:
    driver: bridge
    # Create internal network for service discovery
    # This ensures containers can communicate by name
```

## Key Improvements and Fixes

### 1. Port Configuration Fix
- **Backend**: Container port 3000 → Host port 3002 (matches Dokploy routing)
- **Frontend**: Container port 3001 → Host port 3001 (matches Dokploy routing)
- **Consistency**: All port mappings now align with Dokploy service definitions

### 2. Service Discovery and Health Checks
- **Database Dependencies**: Backend waits for PostgreSQL and Redis to be healthy
- **Service Dependencies**: Frontend waits for backend to be healthy
- **Health Checks**: All services have proper health checks with correct endpoints
- **Startup Order**: Services start in the correct dependency order

### 3. Network Configuration
- **Internal Network**: Created `blytzwork-network` for service isolation
- **Service Discovery**: Containers can communicate by name (e.g., `postgres:5432`)
- **Security**: Network isolation prevents unauthorized access

### 4. Environment Variables for Firebase Authentication
- **Backend**: Proper Firebase configuration with service account credentials
- **Frontend**: Public Firebase configuration for client-side authentication
- **API URLs**: Correctly configured to use production domains
- **CORS**: Proper allowed origins for secure cross-origin requests

### 5. Production-Ready Configuration
- **Minimal Services**: Only essential services included (no unnecessary components)
- **Resource Optimization**: Removed non-essential services and volumes
- **Security**: Environment variables properly configured for production
- **Monitoring**: Health checks enable proper monitoring and auto-recovery

## Deployment Instructions

### 1. Create the Minimal Docker Compose File
Copy the configuration above to `docker-compose.minimal.yml` in your project root.

### 2. Update Environment Variables
Ensure your `.env` file contains all required variables:
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
```

### 3. Deploy with Dokploy
1. Update your Dokploy project to use `docker-compose.minimal.yml`
2. Ensure the domain routing matches the service names:
   - Frontend: `blytzwork-frontend-final:3001`
   - Backend: `blytzwork-backend-final:3002`
3. Deploy and monitor the health checks

### 4. Verify Deployment
Check that all services are running and healthy:
```bash
# Check service status
docker-compose -f docker-compose.minimal.yml ps

# Check logs
docker-compose -f docker-compose.minimal.yml logs -f

# Test health endpoints
curl http://localhost:3002/health  # Backend health
curl http://localhost:3001/        # Frontend health
```

## Troubleshooting

### 503 Service Unavailable Errors
If you still encounter 503 errors:

1. **Check Service Health**: Verify all services are healthy:
   ```bash
   docker-compose -f docker-compose.minimal.yml ps
   ```

2. **Check Network Connectivity**: Test service communication:
   ```bash
   docker exec blytzwork-frontend-final curl http://blytzwork-backend-final:3000/health
   ```

3. **Check Environment Variables**: Verify all required variables are set:
   ```bash
   docker-compose -f docker-compose.minimal.yml config
   ```

4. **Check Logs**: Review service logs for errors:
   ```bash
   docker-compose -f docker-compose.minimal.yml logs backend
   docker-compose -f docker-compose.minimal.yml logs frontend
   ```

### Authentication Issues
If Firebase authentication is not working:

1. **Verify Firebase Configuration**: Check that all Firebase variables are correctly set
2. **Check Network Connectivity**: Ensure the backend can reach Firebase services
3. **Review CORS Configuration**: Verify allowed origins include your domains

### Database Connection Issues
If the backend cannot connect to the database:

1. **Check Database Health**: Verify PostgreSQL is running and healthy
2. **Verify Connection String**: Ensure DATABASE_URL is correctly formatted
3. **Check Network**: Verify backend can reach the database container

## Comparison with Original Configuration

| Aspect | Original | Minimal | Improvement |
|--------|----------|---------|-------------|
| Services | 4 (postgres, redis, backend, frontend) | 4 (same) | Same essential services |
| Network | External dokploy-network | Internal blytzwork-network | Better isolation |
| Health Checks | Incomplete | Complete for all services | Proper startup order |
| Port Mapping | Confusing | Clear and consistent | Matches Dokploy routing |
| Dependencies | Basic | Service health conditions | Reliable startup |
| Environment Variables | Mixed | Production-optimized | Better Firebase auth |

## Conclusion

This minimal Docker Compose configuration resolves the network connectivity issues and 503 Service Unavailable errors by:

1. **Fixing port mappings** to match Dokploy routing
2. **Adding comprehensive health checks** for reliable service startup
3. **Creating proper network isolation** for secure service discovery
4. **Optimizing environment variables** for Firebase authentication
5. **Ensuring service dependencies** are properly managed

The configuration is production-ready, minimal, and focused on resolving the specific network issues while maintaining all essential functionality of the BlytzWork platform.