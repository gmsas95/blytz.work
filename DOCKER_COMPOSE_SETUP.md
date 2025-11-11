# PostgreSQL Docker Compose Setup

## 🎯 Overview

This repository includes a production-ready Docker Compose configuration for running the BlytzHire platform with PostgreSQL database.

## 📁 Files

- `docker-compose.postgres.yml` - Main Docker Compose configuration
- `.env.template` - Environment variable template
- `.env` - Your actual environment variables (not tracked)

## 🚀 Quick Start

### 1. Environment Setup
```bash
# Copy the environment template
cp .env.template .env

# Edit with your configuration
nano .env
```

### 2. Required Environment Variables
```bash
# PostgreSQL Database
DB_PASSWORD=your_secure_password

# Firebase Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_service_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Firebase_Private_Key_Here\n-----END PRIVATE KEY-----"

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key

# Server Configuration
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
```

### 3. Start Services
```bash
# Start PostgreSQL only
docker compose -f docker-compose.postgres.yml up -d hire-postgres

# Start all services (when backend/frontend are ready)
docker compose -f docker-compose.postgres.yml up -d

# View logs
docker compose logs -f hire-postgres
```

## 🗄️ PostgreSQL Configuration

### Service: `hire-postgres`
- **Image**: postgres:15-alpine
- **Container**: hire-postgres
- **Port**: 5432
- **Database**: blytz_hire
- **User**: postgres
- **Password**: Set via DB_PASSWORD

### Database Schema
- Schema: `blytz_hire`
- Tables: Users, VAProfiles, Companies, etc.
- Persistent volume: `postgres_data`

### Health Checks
- `pg_isready -U postgres -d blytz_hire`
- Interval: 30s
- Timeout: 10s
- Retries: 3

## 🔧 Development vs Production

### Development
```bash
# Use local database connection
DATABASE_URL="postgresql://postgres:password@localhost:5432/blytz_hire"

# Start backend locally
npm run dev
```

### Production
```bash
# Use Docker Compose database
DATABASE_URL="postgresql://postgres:${DB_PASSWORD}@hire-postgres:5432/blytz_hire"

# Start with Docker
docker compose -f docker-compose.postgres.yml up -d
```

## 📊 Database Management

### Connect to Database
```bash
# Connect via Docker
docker exec -it hire-postgres psql -U postgres -d blytz_hire

# Connect locally (if port exposed)
psql -h localhost -p 5432 -U postgres -d blytz_hire
```

### Database Operations
```bash
# Run Prisma migrations
npx prisma db push

# Seed database
npx ts-node prisma/seed.ts

# View database
npx prisma studio
```

## 🌐 Network Configuration

### Network: `blytz-network`
- **Type**: Bridge
- **Driver**: Default
- **Isolation**: Services can communicate internally

### Port Mappings
- PostgreSQL: 5432 → 5432
- Backend: 3001 → 3001 (when enabled)
- Frontend: 3000 → 3000 (when enabled)

## 📁 Volume Management

### PostgreSQL Data
- **Volume**: `postgres_data`
- **Mount**: `/var/lib/postgresql/data`
- **Persistence**: Data survives container restarts
- **Driver**: Local

### Prisma Schemas
- **Mount**: `./backend/prisma:/docker-entrypoint-initdb.d`
- **Purpose**: Database initialization scripts

## 🔍 Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```bash
# Check container status
docker ps | grep hire-postgres

# Check logs
docker logs hire-postgres

# Test connection
docker exec -it hire-postgres pg_isready -U postgres -d blytz_hire
```

#### 2. Environment Variables Not Loading
```bash
# Verify .env file exists
ls -la .env

# Check syntax
cat .env

# Restart services
docker compose down
docker compose -f docker-compose.postgres.yml up -d
```

#### 3. Port Already in Use
```bash
# Check what's using the port
lsof -i :5432

# Change port in docker-compose.postgres.yml
ports:
  - "5433:5432"  # Use different host port
```

### Health Checks

#### Database Health
```bash
# Manual health check
docker exec -it hire-postgres pg_isready -U postgres -d blytz_hire

# Automated health check
docker compose ps
```

#### Service Health
```bash
# View all service health
docker compose ps

# View detailed health
docker inspect hire-postgres
```

## 🚀 Production Deployment

### Environment Setup
1. **Copy .env.template to .env**
2. **Configure all environment variables**
3. **Set strong passwords**
4. **Configure domain names**
5. **Set up SSL certificates**

### Security Considerations
- Use strong DB_PASSWORD
- Don't commit .env file
- Use environment variables in production
- Configure proper ALLOWED_ORIGINS
- Set up proper networking/firewalls

### Monitoring
```bash
# Monitor container health
docker compose ps

# View real-time logs
docker compose logs -f

# Resource usage
docker stats
```

## 📚 Additional Services

When ready, the Docker Compose includes:

### Backend Service
- **Build**: From ./backend/Dockerfile
- **Port**: 3001
- **Depends**: hire-postgres (healthy)
- **Environment**: All API keys and configuration

### Frontend Service
- **Build**: From ./frontend/Dockerfile
- **Port**: 3000
- **Depends**: backend
- **Environment**: API URLs and keys

## 🎯 Next Steps

1. **Configure environment variables**
2. **Start PostgreSQL service**
3. **Seed database with sample data**
4. **Connect backend to database**
5. **Start full application stack**

## 📞 Support

For issues with Docker Compose setup:
1. Check logs: `docker compose logs`
2. Verify .env configuration
3. Check container health: `docker compose ps`
4. Review this documentation
5. Check GitHub issues

---
*Last Updated: $(date '+%Y-%m-%d')*

## 🚨 DEPLOYMENT TROUBLESHOOTING

### Issue: DB_PASSWORD Not Set
If deployment fails with "POSTGRES_PASSWORD is not specified":

#### Quick Fix (1 minute):
1. **Add Environment Variable in Dokploy:**
   - Key: `DB_PASSWORD`
   - Value: `z46fkjvmqzf7z2woihbvo9hr2yloopac`
   - Secret: Yes

2. **Trigger Redeployment**
3. **Monitor logs**: Should show "PostgreSQL init process complete"

#### Alternative - Use Default Password:
```yaml
# In docker-compose.postgres.yml
POSTGRES_PASSWORD: z46fkjvmqzf7z2woihbvo9hr2yloopac  # Replace with your password
```

### Required Environment Variables for Deployment:
```bash
# PostgreSQL (REQUIRED)
DB_PASSWORD=your_secure_password

# Application (REQUIRED for production)
NODE_ENV=production
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters

# Optional Configuration
POSTGRES_DB=blytz_hire
POSTGRES_USER=postgres
```

## 🚨 FRONTEND DEPLOYMENT TROUBLESHOOTING

### Issue: Frontend Build Fails with JSX Errors
If deployment fails with "Expression expected" or JSX syntax errors:

#### Quick Fix (5 minutes):
1. **Check TypeScript Compilation:**
   ```bash
   cd frontend
   npx tsc --noEmit --skipLibCheck
   ```

2. **Fix Common JSX Issues:**
   - Missing closing tags: `</div>`
   - Fragment mismatches: `<>` vs `</>`
   - Variable typos: `recommendations` vs `recommendations`

3. **Test Build Locally:**
   ```bash
   npm run build
   ```

4. **If Build Fails, Create Minimal Page:**
   ```tsx
   export default function Page() {
     return (
       <div>
         <h1>Page Under Construction</h1>
         <p>Full functionality coming soon.</p>
       </div>
     );
   }
   ```

### Common Frontend Build Errors:

#### 1. JSX Syntax Errors
```
Error: Expression expected
./src/app/company/discover/page.tsx:206:9
```
**Solution**: Check for missing closing tags around line 206

#### 2. Fragment Mismatches
```
Error: JSX fragment has no corresponding closing tag
```
**Solution**: Ensure `<>` has matching `</>`

#### 3. Variable Name Typos
```
Error: recommendations is not defined
```
**Solution**: Check variable spelling and imports

#### 4. Missing Environment Variables
```
Warning: The "FIREBASE_MESSAGING_SENDER_ID" variable is not set
```
**Solution**: Add missing environment variables in Dokploy

### Frontend Environment Variables:
```bash
# Frontend Configuration (Required)
NEXT_PUBLIC_API_URL=http://your-domain.com:3001
NEXT_PUBLIC_APP_URL=http://your-domain.com

# Firebase Configuration (Required)
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_firebase_project_id

# Optional Firebase Variables
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# Stripe Configuration (Required)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### Frontend Docker Compose:
```yaml
services:
  hire-frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}
      NEXT_PUBLIC_APP_URL: ${NEXT_PUBLIC_APP_URL}
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
      FIREBASE_API_KEY: ${FIREBASE_API_KEY}
      FIREBASE_AUTH_DOMAIN: ${FIREBASE_AUTH_DOMAIN}
      FIREBASE_PROJECT_ID: ${FIREBASE_PROJECT_ID}
```

## 🚀 UPDATED DOCKER COMPOSE FILES

### Complete Service Configuration:

#### docker-compose.postgres.yml (PostgreSQL + Backend)
```bash
# Start database and API
docker compose -f docker-compose.postgres.yml up -d

# Services:
- hire-postgres: PostgreSQL on port 5433
- backend: API on port 3001
```

#### docker-compose.frontend.yml (Frontend Only)
```bash
# Start frontend web app
docker compose -f docker-compose.frontend.yml up -d

# Services:
- frontend: Web app on port 3000
```

#### docker-compose.all.yml (Complete Platform)
```bash
# Start all services
docker compose -f docker-compose.all.yml up -d

# Services:
- hire-postgres: PostgreSQL on port 5433
- backend: API on port 3001
- frontend: Web app on port 3000
```

### Service Names:
- PostgreSQL: `hire-postgres`
- Backend API: `backend`
- Frontend Web App: `frontend`

### Network:
- All services use `blytz-network`
- Services can communicate internally
- External access via mapped ports

### Deployment Ready:
- Individual services can be deployed
- All services can be deployed together
- Environment variables documented
- Health checks configured
