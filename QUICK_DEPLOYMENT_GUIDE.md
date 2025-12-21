# BlytzWork Platform - Quick Deployment Guide

## 🚀 Fast Track to Clean Deployment

Follow these exact steps to deploy BlytzWork platform without cached state issues:

### 1. Clean Up Docker State
```bash
./scripts/cleanup-docker.sh
```

### 2. Deploy with Clean Configuration
```bash
./scripts/deploy-dokploy.sh
```

That's it! The scripts handle everything else.

---

## 📋 Detailed Steps (if needed)

### Prerequisites
- Ensure `.env` file is configured with all required variables
- Make sure you have sudo privileges for Docker operations

### Step 1: Clean Up (removes old service names and cached state)
```bash
# Make script executable (first time only)
chmod +x scripts/cleanup-docker.sh

# Run cleanup
./scripts/cleanup-docker.sh
```

### Step 2: Deploy (uses clean docker-compose.dokploy.yml)
```bash
# Make script executable (first time only)
chmod +x scripts/deploy-dokploy.sh

# Run deployment
./scripts/deploy-dokploy.sh
```

### Step 3: Verify Deployment
```bash
# Check container status
docker compose -p blytzwork-webapp-uvey24 -f docker-compose.dokploy.yml ps

# Access URLs
# Frontend: https://blytz.work
# Backend API: https://gateway.blytz.work
```

---

## 🔧 Common Commands

### View Logs
```bash
docker compose -p blytzwork-webapp-uvey24 -f docker-compose.dokploy.yml logs -f
```

### Restart Services
```bash
docker compose -p blytzwork-webapp-uvey24 -f docker-compose.dokploy.yml restart
```

### Stop Services
```bash
docker compose -p blytzwork-webapp-uvey24 -f docker-compose.dokploy.yml down
```

---

## 📁 Files Created for Clean Deployment

1. **docker-compose.dokploy.yml** - Clean Docker Compose configuration
2. **scripts/cleanup-docker.sh** - Removes all cached Docker state
3. **scripts/deploy-dokploy.sh** - Performs clean deployment with health checks
4. **docs/DOKPLOY_CLEAN_DEPLOYMENT_GUIDE.md** - Comprehensive deployment guide

---

## ✅ What This Fixes

- Removes references to old service names (`frontend-final`, `backend-final`)
- Clears Docker build cache and unused resources
- Ensures proper network isolation with `dokploy-network`
- Uses correct service names (`blytzwork-frontend`, `blytzwork-backend`)
- Provides health checks for all services

---

## 🆘 Troubleshooting

If deployment fails:

1. Run cleanup again: `./scripts/cleanup-docker.sh`
2. Check environment variables in `.env` file
3. Verify dokploy-network exists: `docker network ls | grep dokploy-network`
4. Check container logs: `docker logs blytzwork-frontend` or `docker logs blytzwork-backend`

For detailed troubleshooting, see: [docs/DOKPLOY_CLEAN_DEPLOYMENT_GUIDE.md](docs/DOKPLOY_CLEAN_DEPLOYMENT_GUIDE.md)