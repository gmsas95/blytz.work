# BlytzWork - Production Docker Compose Setup

🎯 **SINGLE DOCKER-COMPOSE.YML FOR ALL SERVICES**

Deploy with: `docker compose up -d`

## 🏗️ **Architecture Overview**

```
blytz-network (172.20.0.0/16)
├── 🗄️  postgres (Database)
│   └── Port: 5433 (internal: 5432)
├── 🔴  redis (Cache)
│   └── Port: 6379
├── 🔧  backend (Node.js API)  
│   └── Port: 3010 (internal: 3000)
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
docker compose up -d
```

### **3. Access Application**
```
🌐 Main Application: http://72.60.236.89:8081
   ├── / → Frontend (React app)
   ├── /api/* → Backend API
   ├── /health → Health check endpoint
   └── /webhooks/stripe → Stripe webhooks

📱 Direct Service Access:
   ├── Frontend: http://72.60.236.89:3003
   ├── Backend API: http://72.60.236.89:3010/api
   ├── Database: localhost:5433
   └── Redis: localhost:6379
```

## 🛠️ **Management Commands**

### **Deployment Script**
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
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f

# Rebuild service
docker compose build --no-cache backend

# Scale service
docker compose up --scale backend=2
```

## 🔧 **Configuration**

### **Environment Variables**
Update these in `.env` file:

```bash
# Application URLs
BACKEND_URL=http://72.60.236.89:3010
FRONTEND_URL=http://72.60.236.89:3003
REACT_APP_API_URL=http://72.60.236.89:8081/api

# Security Keys (UPDATE THESE!)
POSTGRES_PASSWORD=your_secure_postgres_password
JWT_SECRET=your_jwt_secret_here
STRIPE_SECRET_KEY=sk_your_stripe_secret_key
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_your_stripe_key
```

## 🔄 **CI/CD Integration**

### **Deployment Command**
```bash
cd /root/blytz-hyred
cp .env.production .env
docker compose up -d --build --remove-orphans
```

### **Service Dependencies**
- ✅ **PostgreSQL**: Database with persistence and health checks
- ✅ **Redis**: Caching layer with authentication
- ✅ **Backend**: Node.js API with environment variables
- ✅ **Frontend**: React application with CORS support
- ✅ **Nginx**: Reverse proxy with SSL and rate limiting

## 🌐 **Network Architecture**

All services communicate within `blytz-network` (172.20.0.0/16):

```
Service        | Internal IP | External Port | Purpose
---------------|-------------|--------------|----------------
blytz-postgres | 172.20.0.2 | 5433         | PostgreSQL Database
blytz-redis   | 172.20.0.4 | 6379         | Redis Cache
blytz-backend | 172.20.0.3 | 3010         | Node.js API
blytz-frontend| 172.20.0.5 | 3003         | React Application
blytz-nginx   | 172.20.0.6 | 8081         | Reverse Proxy
```

## 🎯 **Features**

### **Production Ready**
- ✅ **Health Checks**: All services have health monitoring
- ✅ **Restart Policies**: Automatic service recovery
- ✅ **Volume Persistence**: Database and cache data preserved
- ✅ **Security**: Environment variables and network isolation
- ✅ **SSL Ready**: Nginx configured for HTTPS
- ✅ **Rate Limiting**: API protection built-in
- ✅ **CORS Support**: Frontend-backend communication
- ✅ **WebSocket Support**: Real-time features enabled

### **Development Friendly**
- ✅ **Hot Reload**: Development environment support
- ✅ **Debug Mode**: Easy container access
- ✅ **Logging**: Centralized log management
- ✅ **Environment**: Dev/prod configurations

## 🐛 **Troubleshooting**

### **Health Check**
```bash
curl http://72.60.236.89:8081/health
```

### **Service Logs**
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
```

### **Network Connectivity**
```bash
# Test service communication
docker exec blytz-nginx ping backend
docker exec blytz-nginx ping frontend
```

### **Database Connection**
```bash
# Connect to database
docker exec -it blytz-postgres psql -U blytz_user -d blytz_work
```

## 🎉 **Benefits of Unified Setup**

✅ **Simplified Management**: One command for all services
✅ **Consistent Networking**: All services in same network
✅ **Atomic Deployment**: Start/stop everything together
✅ **Easy Scaling**: Scale any service independently
✅ **Better Debugging**: Centralized logs and monitoring
✅ **CI/CD Ready**: Single deployment pipeline
✅ **Production Optimized**: Built-in health checks and security

---

🎯 **Deploy your BlytzWork application with confidence!**
