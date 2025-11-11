# 🚀 Quick Start Guide

## **⚡ 5-Minute Setup**

### **1. Clone & Install**
```bash
git clone <your-repo>
cd va-matching-platform

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### **2. Environment Setup**
```bash
# Backend
cd backend
cp .env.example .env
# Edit with your Firebase + Stripe credentials

# Frontend
cd ../frontend
cp .env.example .env.local
# Edit with your Firebase + Stripe keys
```

### **3. Database Setup**
```bash
cd backend
npm run generate  # Generate Prisma client
npm run migrate   # Run database migrations
```

### **4. Start Development**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### **5. Access Applications**
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **API Docs**: http://localhost:3000/health

---

## **🔧 Required Accounts & Keys**

### **Firebase Setup**
1. Create Firebase project
2. Enable Authentication (Email/Password)
3. Create Service Account
4. Get credentials for `.env`

### **Stripe Setup**
1. Create Stripe account
2. Enable Connect for platform
3. Get API keys for `.env`
4. Configure webhook endpoint

### **Database Setup**
1. Install PostgreSQL 16.x
2. Create database: `va_matching`
3. Get connection string for `.env`

---

## **🧪 Testing the Flow**

### **1. Create Test Users**
- VA user: `va@test.com` / `password123`
- Company user: `company@test.com` / `password123`

### **2. Test Complete Flow**
1. **VA**: Create profile with skills
2. **Company**: Post job opening
3. **Company**: Discover and like VAs
4. **VA**: View mutual matches
5. **Company**: Pay $29.99 to unlock contact
6. **Both**: Exchange contact information

### **3. Test Payment**
- Use Stripe test card: `4242 4242 4242 4242`
- Payment processes in test mode
- Check Stripe dashboard for transactions

---

## **🚀 Deployment Commands**

### **Production Build**
```bash
# Backend
cd backend
npm run build
pm2 start dist/server.js --name "va-backend"

# Frontend
cd frontend
npm run build
# Serve build/ folder with Nginx
```

### **Environment Variables for Production**
```bash
# Backend (.env)
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@localhost:5432/va_matching
FIREBASE_PROJECT_ID=your-project
STRIPE_SECRET_KEY=sk_live_...

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=https://yourdomain.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

---

## **🎯 First Revenue Goal**

**Target**: 10 successful matches in first month  
**Revenue**: 10 × $26.99 = $269.90 net  
**Investment**: Development time + hosting costs  

**Ready to launch!** 🚀