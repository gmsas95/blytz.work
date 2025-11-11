# Frontend Environment Variables for Dokploy

## 🚨 REQUIRED VARIABLES (Must Set in Dokploy)

### Frontend URLs
```bash
# Required: Your frontend container URL
NEXT_PUBLIC_APP_URL=http://72.60.236.89:3000

# Required: Your backend API container URL  
NEXT_PUBLIC_API_URL=http://72.60.236.89:3001
```

### Firebase Configuration
```bash
# Required: Already set correctly ✅
FIREBASE_API_KEY="AIzaSyDy63cQFqr6DT7_y9pmhgASd8NX5GW0oio"
FIREBASE_AUTH_DOMAIN="blytz-hyred.firebaseapp.com"
FIREBASE_PROJECT_ID="blytz-hyred"

# Optional: Already set correctly ✅
FIREBASE_MESSAGING_SENDER_ID="100201094663"
FIREBASE_STORAGE_BUCKET="blytz-hyred.firebasestorage.app"
FIREBASE_APP_ID="your_app_id" # Get from Firebase settings
```

### Stripe Configuration
```bash
# Required: Already set correctly ✅
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_51SRuCWFUqEv3bsXBHpdAWsMnHe3zZc4IWgjR7vZEs9OXYm5XYFmhB9kqYilObPUrgp0cTILAeVtsCHX7R42irY9Q00QEJDpcWU"
```

## 📯 DEPLOYMENT COMMANDS

### For Frontend Only Deployment
```bash
# Dokploy will run:
docker compose -f docker-compose.frontend.yml up -d --build --remove-orphans

# Expected result:
- Frontend container starts
- No dependency errors
- Environment variables loaded
- Port 3000 accessible
```

### For Full Platform Deployment
```bash
# Use docker-compose.all.yml instead:
docker compose -f docker-compose.all.yml up -d --build --remove-orphans

# Services started:
- hire-postgres (PostgreSQL)
- backend (API)
- frontend (Web app)
```

## 🔧 TROUBLESHOOTING

### Issue: Environment Variable Warnings
```
Warning: The "NEXT_PUBLIC_APP_URL" variable is not set.
```
**Solution**: Add `NEXT_PUBLIC_APP_URL=http://72.60.236.89:3000`

### Issue: Service Depends on Undefined
```
service "frontend" depends on undefined service "hire-postgres"
```
**Solution**: Use docker-compose.frontend.yml (no dependencies)

### Issue: Version Warning
```
attribute 'version' is obsolete, it will be ignored
```
**Solution**: Use updated docker-compose files (version removed)

## 🎯 WORKING CONFIGURATION

### Frontend Service
```yaml
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}
      NEXT_PUBLIC_APP_URL: ${NEXT_PUBLIC_APP_URL}
      # ... other variables
```

### Network Communication
- Frontend: `http://72.60.236.89:3000`
- Backend: `http://72.60.236.89:3001` (from frontend)
- Database: `postgresql://postgres:password@hire-postgres:5432/blytz_hire` (from backend)

## 🚀 DEPLOYMENT SUCCESS

When you have:
- ✅ All required environment variables set
- ✅ Frontend Docker Compose fixed
- ✅ No service dependencies in frontend-only file
- ✅ Correct container URLs (not Traefik URLs)

Then your deployment should succeed with:
- ✅ Frontend builds successfully
- ✅ Container starts without errors
- ✅ Environment variables loaded
- ✅ Web app accessible on port 3000

## 🎯 CRITICAL FRONTEND ENVIRONMENT VARIABLES

### REQUIRED FOR DEPLOYMENT (Add in Dokploy):

#### Core Application Variables
```bash
Key: NEXT_PUBLIC_APP_URL
Value: http://72.60.236.89:3000
Secret: No

Key: NEXT_PUBLIC_API_URL
Value: http://72.60.236.89:3001
Secret: No
```

#### Firebase Configuration
```bash
Key: FIREBASE_API_KEY
Value: AIzaSyDy63cQFqr6DT7_y9pmhgASd8NX5GW0oio
Secret: No

Key: FIREBASE_AUTH_DOMAIN
Value: blytz-hyred.firebaseapp.com
Secret: No

Key: FIREBASE_PROJECT_ID
Value: blytz-hyred
Secret: No

Key: FIREBASE_MESSAGING_SENDER_ID
Value: 100201094663
Secret: No

Key: FIREBASE_APP_ID
Value: [Get from Firebase Project Settings]
Secret: No
```

#### Stripe Configuration
```bash
Key: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
Value: pk_test_51SRuCWFUqEv3bsXBHpdAWsMnHe3zZc4IWgjR7vZEs9OXYm5XYFmhB9kqYilObPUrgp0cTILAeVtsCHX7R42irY9Q00QEJDpcWU
Secret: No
```

### 🔥 DEPLOYMENT SUCCESS REQUIREMENTS:

#### 1. Alert Component Path Resolution
```
✅ CORRECT: import { AlertContainer } from '@/components/ui/Alert'
❌ WRONG:  import { AlertContainer } from '@/components/Alert'
```

#### 2. Environment Variable Syntax
```
✅ CORRECT: NEXT_PUBLIC_* variables for browser access
❌ WRONG: Missing NEXT_PUBLIC_ prefix
```

#### 3. Build Process
```
✅ WORKING: Next.js 16.0.1 with Turbopack
✅ WORKING: TypeScript with strict checks
✅ WORKING: Tailwind CSS styling
✅ WORKING: Lucide React icons
```

### 🚨 DEPLOYMENT TROUBLESHOOTING:

#### Error: Module not found '@/components/Alert'
**Solution**: Use correct path '@/components/ui/Alert'

#### Error: Environment variable not set
**Solution**: Add NEXT_PUBLIC_APP_URL and NEXT_PUBLIC_API_URL in Dokploy

#### Error: Build failed with Turbopack
**Solution**: Check JSX syntax and null checks
