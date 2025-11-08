# 🐳 Docker Deployment for Existing Infrastructure

Perfect for Dokploy with existing PostgreSQL/Supabase and n8n setup.

## **Quick Setup**

### **1. Environment Variables**
```bash
# Copy and configure
cp .env.example .env

# Edit .env with your existing database:
DATABASE_URL=postgresql://username:password@your-supabase-host:5432/database_name
JWT_SECRET=your_super_secure_jwt_secret_here
FIREBASE_PROJECT_ID=your_firebase_project_id
# ... (other Firebase/Stripe vars)
```

### **2. Deploy with Dokploy**
```bash
# Start backend only
docker-compose -f docker-compose.backend.yml up -d

# Start frontend only
docker-compose -f docker-compose.frontend.yml up -d

# Start nginx reverse proxy (optional)
docker-compose -f docker-compose.nginx.yml up -d

# Check status
docker-compose ps
```

## **Services Running**
- **Backend API**: Port 3000 (connects to your existing DB)
- **Frontend**: Port 3001
- **Nginx**: Ports 80/443 (optional reverse proxy)

## **Database Setup**
Since you're using existing PostgreSQL/Supabase:

```bash
# Run migrations on your existing database
cd backend
npm run migrate
```

## **Integration Points**
- **Database**: Uses your existing Supabase/PostgreSQL
- **n8n**: Can connect via API to backend:3000
- **No Redis**: Removed to keep setup simple

## **Resource Usage**
Much lighter without database services:
- ~200MB RAM total (vs ~1GB with DB)
- Faster startup time
- Uses your existing infrastructure efficiently