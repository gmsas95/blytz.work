# BlytzWork - Unified Docker Compose Setup

🎯 **SINGLE DOCKER-COMPOSE FOR ALL SERVICES**

## 🏗️ **Architecture Overview**

```
blytz-network (172.20.0.0/16)
├── 🗄️  postgres (Database)
│   └── Port: 5433 (internal: 5432)
├── 🔧  backend (Node.js API)  
│   └── Port: 3010 (internal: 3000)
├── 🔴  redis (Cache)
│   └── Port: 6379
├── ⚛️  frontend (React App)
│   └── Port: 3003 (internal: 3000)
└── 🌐 nginx (Reverse Proxy)
    └── Port: 8081 (main entry point)
```

## 🚀 **Quick Start**

### **1. Environment Setup**
```bash
# Copy production environment template
cp .env.production .env

# IMPORTANT: Update these values in .env
nano .env
```

### **2. Deploy Services**
```bash
# Using deployment script (recommended)
./deploy.sh start

# Or using docker compose directly
docker compose -f docker-compose.unified.yml --env-file .env up -d
```

### **3. Access Application**
```
🌐 Main Application: http://72.60.236.89:8081
   ├── / → Frontend (React app)
   ├── /api/* → Backend API
   ├── /health → Health check
   └── /webhooks/stripe → Stripe webhooks

📱 Direct Service Access:
   ├── Frontend: http://72.60.236.89:3003
   ├── Backend API: http://72.60.236.89:3010/api
   ├── Database: localhost:5433
   └── Redis: localhost:6379
```

## 🛠️ **Management Commands**

### **Deployment Script (Recommended)**
```bash
./deploy.sh start      # Start all services
./deploy.sh stop       # Stop all services  
./deploy.sh restart    # Restart all services
./deploy.sh logs       # View live logs
./deploy.sh status     # Check service status
./deploy.sh health     # Health check all services
```

### **Docker Compose Commands**
```bash
# Start services
docker compose -f docker-compose.unified.yml --env-file .env up -d

# Stop services
docker compose -f docker-compose.unified.yml down

# View logs
docker compose -f docker-compose.unified.yml logs -f

# Rebuild service
docker compose -f docker-compose.unified.yml build --no-cache backend

# Scale service
docker compose -f docker-compose.unified.yml up --scale backend=2
```

## 🔧 **Configuration**

### **Environment Variables**
Key variables in `.env` file:

```bash
# Application URLs
BACKEND_URL=http://72.60.236.89:3010
FRONTEND_URL=http://72.60.236.89:3003
REACT_APP_API_URL=http://72.60.236.89:8081/api

# Security Keys (UPDATE THESE!)
JWT_SECRET=your_secure_jwt_secret_here
STRIPE_SECRET_KEY=sk_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_your_stripe_key

# Database
POSTGRES_PASSWORD=your_secure_postgres_password
```

### **Service Configuration**
Each service configured with:
- ✅ **Health checks**: Automatic monitoring
- ✅ **Restart policies**: Automatic recovery
- ✅ **Resource limits**: CPU/memory optimization  
- ✅ **Volume persistence**: Data preservation
- ✅ **Network isolation**: Secure communication
- ✅ **Dependency management**: Ordered startup

## 🔄 **CI/CD Integration**

### **Dokploy Configuration**
Set your CI/CD to use:

**Repository**: `github.com/gmsas95/blytz-hyred.git`
**Branch**: `main` (or your main branch)
**Root Directory**: `/root/blytz-hyred`
**Compose File**: `docker-compose.unified.yml`
**Environment File**: `.env.production`

**Deployment Command**:
```bash
cd /root/blytz-hyred
cp .env.production .env
docker compose -f docker-compose.unified.yml --env-file .env up -d --build --remove-orphans
```

### **GitHub Actions Example**
```yaml
name: Deploy BlytzWork
on:
  push:
    branches: [main]
    
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to production
      run: |
        cd /root/blytz-hyred
        cp .env.production .env
        docker compose -f docker-compose.unified.yml --env-file .env up -d --build --remove-orphans
```

## 🐛 **Troubleshooting**

### **Common Issues**

**1. Port Conflicts**
```bash
# Check what's using ports
sudo netstat -tulpn | grep :8081
sudo netstat -tulpn | grep :3010

# Kill conflicting processes
sudo kill -9 <PID>
```

**2. Network Issues**
```bash
# Check network connectivity
docker exec blytz-nginx ping backend
docker exec blytz-nginx ping frontend

# Inspect network
docker network inspect blytz-work_blytz-network
```

**3. Service Health**
```bash
# Check all service health
docker compose -f docker-compose.unified.yml ps

# View service logs
docker compose -f docker-compose.unified.yml logs backend
```

**4. Database Connection**
```bash
# Test database connection
docker exec blytz-postgres psql -U blytz_user -d blytz_work -c "SELECT 1;"
```

### **Debug Mode**
```bash
# Run with debug output
docker compose -f docker-compose.unified.yml up --build

# Access container shell
docker exec -it blytz-backend sh
docker exec -it blytz-frontend sh
docker exec -it blytz-nginx sh
```

## 📊 **Monitoring**

### **Health Check Endpoint**
```bash
curl http://72.60.236.89:8081/health
```

**Expected Response**:
```json
{
  "status": "healthy",
  "services": {
    "nginx": "up",
    "backend": "up", 
    "frontend": "up",
    "postgres": "up",
    "redis": "up"
  },
  "timestamp": "2025-11-15T08:00:00.000Z"
}
```

### **Service Logs**
```bash
# All services
docker compose -f docker-compose.unified.yml logs -f

# Specific service
docker compose -f docker-compose.unified.yml logs -f backend
```

## 🔄 **Migration from Separate Compose Files**

### **Before Migration**
Stop existing services:
```bash
# List all running compose projects
docker compose ls

# Stop each project individually
docker compose -f docker-compose.backend.yml down
docker compose -f docker-compose.frontend.yml down
docker compose -f docker-compose.postgres.yml down
docker compose -f docker-compose.nginx.yml down
```

### **After Migration**
```bash
# Start unified setup
./deploy.sh start

# Verify all services working
./deploy.sh health
```

## 🎯 **Benefits of Unified Setup**

✅ **Simplified Management**: One command for all services
✅ **Consistent Networking**: All services in same network
✅ **Atomic Deployment**: Start/stop everything together
✅ **Easier Debugging**: Centralized logs and monitoring
✅ **Better CI/CD**: Single deployment pipeline
✅ **Resource Optimization**: Shared volumes and networks
✅ **Scalability**: Easy to scale any service
✅ **Security**: Isolated but connected services

## 📞 **Support**

For issues with this unified setup:
1. Check service logs: `./deploy.sh logs`
2. Verify environment: `./deploy.sh health`
3. Check documentation: Review this README
4. Debug mode: Use `docker compose up --build`

---

🎉 **Enjoy your simplified BlytzWork deployment!**
