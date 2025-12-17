# 🔧 Dokploy Deployment Fix Implementation Guide

## 🚀 Quick Fix Summary

**Estimated Time: 1-2 hours total**

Your Dokploy + Traefik deployment is **professionally configured** - just needs some tweaks. Here's the step-by-step fix process.

---

## 🎯 **Step 1: Clean Up Legacy Containers** (5 minutes)

### **Remove Conflicting Nginx Container**
```bash
# Stop and remove the legacy nginx container
docker stop blytz-nginx
docker rm blytz-nginx

# Verify it's gone
docker ps --filter "name=nginx"

# Clean up any dangling containers
docker container prune -f
```

### **Verify Current Status**
```bash
# Check what's actually running
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Should show: blytz-hire-backend-final, hire-postgres, etc.
# Should NOT show: blytz-nginx
```

---

## 🎯 **Step 2: Fix Service Labels** (15 minutes)

### **Problem Identified:**
Your containers have mismatched labels vs actual configuration:
- Backend container name: `blytz-hire-backend-final` on port **3011** ➡️ **3011** (not 3000)
- Frontend container name: `blytz-frontend` on port **3000** ➡️ **3000**

### **Solution: Update Docker Compose Files**

#### **Update Backend Labels (`docker-compose.3-apigateway.yml`)**

```yaml
# Replace the entire labels section with:
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.blytz-hire-backend.rule=Host(`api.blytz.app`)"
  - "traefik.http.routers.blytz-hire-backend.entrypoints=web,websecure"
  - "traefik.http.routers.blytz-hire-backend.tls=true"
  - "traefik.http.routers.blytz-hire-backend.tls.certresolver=letsencrypt"
  - "traefik.http.routers.blytz-hire-backend.middlewares=api-cors@file"
  - "traefik.http.services.blytz-hire-backend.loadbalancer.server.port=3011"
```

#### **Update Frontend Labels (`docker-compose.4-frontend.yml`)**

```yaml
# Replace the entire labels section with:
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.blytz-hire-frontend.rule=Host(`hyred.blytz.app`)"
  - "traefik.http.routers.blytz-hire-frontend.entrypoints=web,websecure"
  - "traefik.http.routers.blytz-hire-frontend.tls=true"
  - "traefik.http.routers.blytz-hire-frontend.tls.certresolver=letsencrypt"
  - "traefik.http.services.blytz-hire-frontend.loadbalancer.server.port=3000"
```

#### **Apply Changes:**
```bash
# Navigate to project directory
cd /home/sas/blytz.work

# Redeploy with updated labels
docker-compose -f docker-compose.3-apigateway.yml up -d
docker-compose -f docker-compose.4-frontend.yml up -d

# Verify new labels are applied
docker inspect blytz-hire-backend-final | grep -A 20 "Labels"
docker inspect blytz-frontend | grep -A 20 "Labels"
```

---

## 🎯 **Step 3: Environment Variables Configuration** (30 minutes)

### **Create Production Environment File**

```bash
# Create production environment file
cp .env.example .env.production
```

### **Fill with Actual Values**

Edit `.env.production` with your actual configuration:

```bash
# Core Configuration
NODE_ENV=production
PORT=3000

# Database (Use your actual PostgreSQL credentials)
DATABASE_URL=postgresql://postgres:your_password@hire-postgres:5432/blytz_hire

# Authentication (Get from Firebase Console)
FIREBASE_PROJECT_ID=your-project-id-12345
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id-12345.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"

# Payment Processing (Get from Stripe Dashboard)
STRIPE_SECRET_KEY=[YOUR_STRIPE_SECRET_KEY]
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Security (Generate strong random key)
JWT_SECRET=your-super-secure-jwt-secret-key-at-least-32-characters-long

# CORS Configuration
ALLOWED_ORIGINS=https://hyred.blytz.app,https://api.blytz.app

# Frontend Configuration
NEXT_PUBLIC_API_URL=https://api.blytz.app
NEXT_PUBLIC_APP_URL=https://hyred.blytz.app
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id-12345
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id-12345.firebaseapp.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[YOUR_STRIPE_PUBLISHABLE_KEY]

# Platform Configuration
PLATFORM_FEE_PERCENTAGE=10
PAYMENT_AMOUNT=29.99

# Monitoring
LOG_LEVEL=info
```

### **Configure Dokploy Environment**

```bash
# In Dokploy dashboard, go to your application settings
# Add these environment variables to your services:

# For Backend Service:
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://postgres:your_password@hire-postgres:5432/blytz_hire
FIREBASE_PROJECT_ID=your-project-id-12345
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id-12345.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
STRIPE_SECRET_KEY=[YOUR_STRIPE_SECRET_KEY]
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
JWT_SECRET=your-super-secure-jwt-secret-key-at-least-32-characters-long
ALLOWED_ORIGINS=https://hyred.blytz.app,https://api.blytz.app
PLATFORM_FEE_PERCENTAGE=10
PAYMENT_AMOUNT=29.99
LOG_LEVEL=info

# For Frontend Service:
NEXT_PUBLIC_API_URL=https://api.blytz.app
NEXT_PUBLIC_APP_URL=https://hyred.blytz.app
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id-12345
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id-12345.firebaseapp.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[YOUR_STRIPE_PUBLISHABLE_KEY]
```

---

## 🎯 **Step 4: Service Verification** (10 minutes)

### **Test All Endpoints**
```bash
# Test backend health
curl -f http://localhost:3011/health
echo "Backend health: $?"

# Test backend via Traefik (after DNS setup)
curl -f https://api.blytz.app/health
echo "Backend via Traefik: $?"

# Test frontend
curl -f http://localhost:3000
echo "Frontend direct: $?"

# Test frontend via Traefik
curl -f https://hyred.blytz.app
echo "Frontend via Traefik: $?"
```

### **Verify SSL Certificates**
```bash
# Check SSL certificate
openssl s_client -connect api.blytz.app:443 -servername api.blytz.app < /dev/null 2>/dev/null | openssl x509 -noout -dates

# Check redirect from HTTP to HTTPS
curl -I http://api.blytz.app | grep -i location
```

### **Check Traefik Dashboard** (if accessible)
```bash
# Access Traefik dashboard (if configured)
curl http://localhost:8080/dashboard/ 2>/dev/null | head -20
```

---

## 🎯 **Step 5: Dokploy Integration** (15 minutes)

### **Deploy Through Dokploy Dashboard**

1. **Access Dokploy Dashboard**
   ```bash
   # Dokploy should be running on sudo.blytz.work
   # Or check local port
   curl -I http://localhost:3000 2>/dev/null | head -5
   ```

2. **Update Application Configuration**
   - Go to your application in Dokploy dashboard
   - Update environment variables
   - Redeploy services with new labels
   - Monitor deployment logs

3. **Verify Deployment**
   ```bash
   # Check Dokploy logs
docker logs dokploy --tail 20
   
   # Check Traefik logs
docker logs traefik --tail 20 2>/dev/null || echo "Traefik logs not accessible"
   ```

---

## 🧪 **Step 6: Comprehensive Testing** (15 minutes)

### **End-to-End Testing**
```bash
#!/bin/bash
# Save as test-deployment.sh

echo "🧪 Testing Dokploy Deployment..."

# Test 1: Backend Health
echo "1. Testing backend health..."
curl -f https://api.blytz.app/health && echo "✅ Backend healthy" || echo "❌ Backend failed"

# Test 2: Frontend Access
echo "2. Testing frontend..."
curl -f https://hyred.blytz.app | grep -q "Hyred" && echo "✅ Frontend accessible" || echo "❌ Frontend failed"

# Test 3: SSL Certificate
echo "3. Testing SSL certificate..."
curl -I https://api.blytz.app 2>/dev/null | grep -q "200" && echo "✅ SSL working" || echo "❌ SSL failed"

# Test 4: CORS Headers
echo "4. Testing CORS..."
curl -H "Origin: https://hyred.blytz.app" -I https://api.blytz.app/health 2>/dev/null | grep -q "Access-Control-Allow-Origin" && echo "✅ CORS configured" || echo "❌ CORS failed"

# Test 5: API Functionality
echo "5. Testing API functionality..."
curl -f https://api.blytz.app/api/health 2>/dev/null | grep -q "ok" && echo "✅ API working" || echo "❌ API failed"

echo "🎉 Deployment testing complete!"
```

### **Make it executable and run:**
```bash
chmod +x test-deployment.sh
./test-deployment.sh
```

---

## 🚨 **Troubleshooting Common Issues**

### **Issue: SSL Certificate Not Working**
```bash
# Check Let's Encrypt logs
docker logs traefik 2>&1 | grep -i "acme\|certificate\|ssl"

# Verify domain DNS is pointing correctly
nslookup api.blytz.app
nslookup hyred.blytz.app

# Check certificate files exist
docker exec traefik ls -la /certs/ 2>/dev/null
```

### **Issue: Service Not Accessible**
```bash
# Check Traefik routing
curl -H "Host: api.blytz.app" http://localhost:8080/api/providers/docker 2>/dev/null | jq '.routers'

# Check service health
docker inspect blytz-hire-backend-final --format '{{.State.Health.Status}}'

# Check network connectivity
docker network inspect dokploy-network
```

### **Issue: CORS Problems**
```bash
# Test CORS headers
curl -H "Origin: https://hyred.blytz.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://api.blytz.app/api/health -v
```

---

## ✅ **Success Verification**

When everything is working correctly, you should be able to:

1. **Access Backend API**: https://api.blytz.app/health → {"ok":true}
2. **Access Frontend**: https://hyred.blytz.app → Hyred landing page
3. **SSL Certificate**: Valid Let's Encrypt certificate
4. **CORS**: Proper headers for cross-origin requests
5. **All Services**: Healthy status in Docker

**Estimated Total Time: 1-2 hours**

**Result: Professional Dokploy + Traefik deployment ready for MVP launch!** 🎉