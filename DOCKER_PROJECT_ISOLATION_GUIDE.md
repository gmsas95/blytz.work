# Docker Project Isolation Guide

## Overview
For running multiple projects (blytz.work, blytz.live, blytz.booking) on the same server without conflicts.

## Key Components to Isolate

### 1. **Named Volumes** (Required)
Each project needs unique persistent volumes:

```yaml
volumes:
  # blytz.work
  blytzwork_persistent_postgres_data:
    name: blytzwork_persistent_postgres_data
    driver: local
  blytzwork_persistent_redis_data:
    name: blytzwork_persistent_redis_data
    driver: local

  # blytz.live
  blytzlive_persistent_postgres_data:
    name: blytzlive_persistent_postgres_data
    driver: local
  blytzlive_persistent_redis_data:
    name: blytzlive_persistent_redis_data
    driver: local

  # blytz.booking
  blytzbooking_persistent_postgres_data:
    name: blytzbooking_persistent_postgres_data
    driver: local
  blytzbooking_persistent_redis_data:
    name: blytzbooking_persistent_redis_data
    driver: local
```

### 2. **Networks** (Required)
Each project needs its own network:

```yaml
networks:
  # blytz.work
  blytzwork-network:
    driver: bridge

  # blytz.live
  blytzlive-network:
    driver: bridge

  # blytz.booking
  blytzbooking-network:
    driver: bridge
```

### 3. **Container Names** (Already done)
Each project has unique container names:

```yaml
services:
  postgres:
    container_name: blytzwork-postgres  # or blytzlive-postgres, blytzbooking-postgres
  redis:
    container_name: blytzwork-redis    # or blytzlive-redis, blytzbooking-redis
  backend:
    container_name: blytzwork-backend  # or blytzlive-backend, blytzbooking-backend
  frontend:
    container_name: blytzwork-frontend # or blytzlive-frontend, blytzbooking-frontend
```

### 4. **Project Names** (Critical)
Use unique project prefix for each deployment:

```bash
# blytz.work
docker compose -p blytzwork-webapp -f ./docker-compose.yml up -d

# blytz.live
docker compose -p blytzlive-webapp -f ./docker-compose.yml up -d

# blytz.booking
docker compose -p blytzbooking-webapp -f ./docker-compose.yml up -d
```

### 5. **DATABASE_URL for Docker Networks** (Critical)
Backend MUST use service name, not localhost:

```yaml
services:
  backend:
    environment:
      # ❌ WRONG: DATABASE_URL: ${DATABASE_URL} (might be localhost)
      # ✅ CORRECT:
      DATABASE_URL: postgresql://postgres:${POSTGRES_PASSWORD:-password}@postgres:5432/${POSTGRES_DB:-db}?schema=your_schema
```

## Complete Example for blytz.work

```yaml
services:
  postgres:
    image: postgres:15-alpine
    container_name: blytzwork-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-blytzwork}
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-blytzwork_secure_password_2024}
    volumes:
      - blytzwork_persistent_postgres_data:/var/lib/postgresql/data
      - ./backend/prisma:/docker-entrypoint-initdb.d
    networks:
      - blytzwork-network

  redis:
    image: redis:7-alpine
    container_name: blytzwork-redis
    restart: unless-stopped
    volumes:
      - blytzwork_persistent_redis_data:/data
    networks:
      - blytzwork-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: blytzwork-backend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 3000
      DATABASE_URL: postgresql://postgres:${POSTGRES_PASSWORD:-blytzwork_secure_password_2024}@postgres:5432/${POSTGRES_DB:-blytzwork}?schema=blytz_hire
      REDIS_URL: ${REDIS_URL:-redis://redis:6379}
      FIREBASE_PROJECT_ID: ${FIREBASE_PROJECT_ID}
      FIREBASE_CLIENT_EMAIL: ${FIREBASE_CLIENT_EMAIL}
      FIREBASE_PRIVATE_KEY: ${FIREBASE_PRIVATE_KEY}
      JWT_SECRET: ${JWT_SECRET}
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
      STRIPE_WEBHOOK_SECRET: ${STRIPE_WEBHOOK_SECRET}
      API_URL: ${API_URL:-http://localhost:3000}
      FRONTEND_URL: ${FRONTEND_URL:-http://localhost:3001}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - blytzwork-network

  frontend:
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
      NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL:-http://localhost:3000}
    container_name: blytzwork-frontend
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
      NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL:-http://localhost:3000}
    depends_on:
      - backend
    networks:
      - blytzwork-network

volumes:
  blytzwork_persistent_postgres_data:
    name: blytzwork_persistent_postgres_data
    driver: local
  blytzwork_persistent_redis_data:
    name: blytzwork_persistent_redis_data
    driver: local

networks:
  blytzwork-network:
    driver: bridge
```

## Port Mapping (If Needed)

If you need to expose ports on the host machine (not recommended for production), use different host ports:

```yaml
# blytz.work
services:
  postgres:
    ports:
      - "5432:5432"

# blytz.live (different host port)
services:
  postgres:
    ports:
      - "5433:5432"

# blytz.booking (different host port)
services:
  postgres:
    ports:
      - "5434:5432"
```

**Better approach:** Don't expose database ports - only expose backend/frontend via Traefik reverse proxy.

## Verification Commands

### Check all running containers:
```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

### Check volumes:
```bash
docker volume ls | grep -E "postgres|redis"
```

### Check networks:
```bash
docker network ls
```

### Inspect specific project:
```bash
# blytz.work
docker compose -p blytzwork-webapp -f /path/to/blytz.work/docker-compose.yml ps

# blytz.live
docker compose -p blytzlive-webapp -f /path/to/blytz.live/docker-compose.yml ps

# blytz.booking
docker compose -p blytzbooking-webapp -f /path/to/blytz.booking/docker-compose.yml ps
```

## Troubleshooting

### Issue: "Container already exists"
```bash
# Remove old containers
docker compose -p blytzwork-webapp -f ./docker-compose.yml down
docker compose -p blytzlive-webapp -f ./docker-compose.yml down
docker compose -p blytzbooking-webapp -f ./docker-compose.yml down
```

### Issue: "Volume in use"
```bash
# Stop all containers using the volume
docker ps -a --filter volume=volume_name

# Or remove with force
docker compose down -v
```

### Issue: Network conflicts
```bash
# Clean up networks
docker network prune -f

# Restart Docker if needed
sudo systemctl restart docker
```

### Issue: Database connection fails
Check that DATABASE_URL uses the service name (`postgres`), not `localhost`:
```yaml
DATABASE_URL: postgresql://postgres:password@postgres:5432/db?schema=schema
#             ^^^^^^^^ service name, not localhost
```

## Summary Checklist

For each project:
- [ ] Unique named volumes
- [ ] Unique networks
- [ ] Unique container names
- [ ] Unique project name (`-p` flag)
- [ ] DATABASE_URL uses service name (postgres), not localhost
- [ ] Different host ports (if exposing)
- [ ] Unique Traefik route labels (if using reverse proxy)
