# PostgreSQL Deployment Troubleshooting

## 🚨 COMMON POSTGRES DEPLOYMENT ISSUES

### 1. YAML Syntax Errors
**Error**: `yaml: line X: mapping values are not allowed here`

**Solution**: Check proper indentation
```yaml
services:
  hire-postgres:    # Proper indentation
    image: postgres:15-alpine
    container_name: hire-postgres
```

### 2. Port Already Allocated
**Error**: `Bind for 0.0.0.0:5433 failed: port is already allocated`

**Solution**: Use different host port
```yaml
ports:
  - "5434:5432"  # Change host port
```

### 3. Environment Variable Not Set
**Error**: `POSTGRES_PASSWORD is not specified`

**Solution**: Set DB_PASSWORD in environment
```bash
# In Dokploy:
Key: DB_PASSWORD
Value: z46fkjvmqzf7z2woihbvo9hr2yloopac
Secret: Yes
```

### 4. Backend Port Mismatch
**Error**: Backend health check fails

**Solution**: Match ports in Dockerfile and Compose
```dockerfile
EXPOSE 3001
ENV PORT 3001
```
```yaml
ports:
  - "3001:3001"
```

### 5. Network Configuration
**Error**: Services cannot communicate

**Solution**: Use same network
```yaml
networks:
  - blytz-network
```

## 🔧 VERIFICATION STEPS

### Check PostgreSQL Container
```bash
# Check if container is running
docker ps | grep hire-postgres

# Check logs
docker logs hire-postgres

# Test connection
docker exec -it hire-postgres pg_isready -U postgres -d blytz_hire
```

### Check Backend Container
```bash
# Check if backend is running
docker ps | grep backend

# Check logs
docker logs backend

# Test health endpoint
curl -f http://localhost:3001/health
```

### Check Network Communication
```bash
# Test backend → database
docker exec -it backend psql -h hire-postgres -U postgres -d blytz_hire

# Check network
docker network ls | grep blytz
```

## 🎯 WORKING CONFIGURATION

### PostgreSQL Service
```yaml
hire-postgres:
  image: postgres:15-alpine
  container_name: hire-postgres
  environment:
    POSTGRES_DB: blytz_hire
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: ${DB_PASSWORD}
  ports:
    - "5433:5432"
  networks:
    - blytz-network
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U postgres -d blytz_hire"]
    interval: 30s
    timeout: 10s
    retries: 3
```

### Backend Service
```yaml
backend:
  build:
    context: ./backend
    dockerfile: Dockerfile
  container_name: backend
  environment:
    NODE_ENV: production
    DATABASE_URL: "postgresql://postgres:${DB_PASSWORD}@hire-postgres:5432/blytz_hire"
    PORT: "3001"
  ports:
    - "3001:3001"
  depends_on:
    hire-postgres:
      condition: service_healthy
  networks:
    - blytz-network
```

## 🚀 DEPLOYMENT SUCCESS INDICATORS

### ✅ PostgreSQL Container Healthy
```
STATUS      Up X minutes (healthy)
PORTS       0.0.0.0:5433->5432/tcp
```

### ✅ Backend Container Healthy
```
STATUS      Up X minutes (healthy)
PORTS       0.0.0.0:3001->3001/tcp
```

### ✅ Database Connection Works
```
psql -h localhost -p 5433 -U postgres -d blytz_hire
```

### ✅ Health Endpoint Responds
```
{"status": "ok", "timestamp": "..."}
```

## 🎯 DEPLOYMENT COMMANDS

### PostgreSQL Only
```bash
docker compose -f docker-compose.postgres.yml up -d
```

### Full Platform
```bash
docker compose -f docker-compose.all.yml up -d
```

### Check Services
```bash
docker compose -f docker-compose.postgres.yml ps
```

### View Logs
```bash
docker compose -f docker-compose.postgres.yml logs -f
```

## 🔍 DEBUGGING

### Check Container Logs
```bash
# PostgreSQL logs
docker compose -f docker-compose.postgres.yml logs hire-postgres

# Backend logs
docker compose -f docker-compose.postgres.yml logs backend
```

### Test Connections
```bash
# Inside PostgreSQL container
docker exec -it hire-postgres psql -U postgres -d blytz_hire

# From host (port 5433)
psql -h localhost -p 5433 -U postgres -d blytz_hire

# Test backend health
curl http://localhost:3001/health
```

### Check Network
```bash
# List networks
docker network ls

# Inspect blytz-network
docker network inspect blytz-hire_blytz-network
```

## 🎉 SUCCESS CRITERIA

### ✅ All Services Running
- PostgreSQL: Healthy on port 5433
- Backend: Healthy on port 3001
- Database: Accessible and ready
- Health checks: Passing

### ✅ Communication Working
- Backend can connect to PostgreSQL
- Health endpoints responding
- Database schema created
- Data persistence enabled

### ✅ Environment Variables Loaded
- DB_PASSWORD: Set and working
- NODE_ENV: production
- DATABASE_URL: Correct format
- All configs: Loaded properly
