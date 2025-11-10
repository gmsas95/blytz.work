# 🚀 ENVIRONMENT VARIABLES SETUP GUIDE

---

## **🌟 QUICK START: Essential Variables**

### **🔥 MUST HAVE FOR BASIC OPERATION:**

**Frontend Container (Dokploy):**
```bash
FIREBASE_API_KEY="your_firebase_api_key"
FIREBASE_AUTH_DOMAIN="your_project.firebaseapp.com"
FIREBASE_PROJECT_ID="your_project_id"
NEXT_PUBLIC_API_URL="https://your-backend-domain.com"
```

**Backend Container (Dokploy):**
```bash
SUPABASE_DATABASE_URL="your_supabase_db_url"
FIREBASE_PROJECT_ID="your_firebase_project_id"
FIREBASE_CLIENT_EMAIL="your_service_account@your_project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

---

## **🔥 FIREBASE SETUP: Step by Step**

### **1. Create Firebase Project:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" 
3. Enter project name: "blytz-hire-production"
4. Click "Create project"

### **2. Get Firebase Config:**
1. In Firebase Console → Project Settings → General
2. Scroll to "Your apps" section
3. Click Web app icon (</>)
4. Copy these values:
   - `apiKey` → `FIREBASE_API_KEY`
   - `authDomain` → `FIREBASE_AUTH_DOMAIN`
   - `projectId` → `FIREBASE_PROJECT_ID`

### **3. Create Service Account:**
1. Firebase Console → Project Settings → Service accounts
2. Click "Create service account"
3. Fill details and click "Create and continue"
4. Select role: "Firebase Admin SDK Administrator"
5. Click "Done"
6. Click on new service account → Keys tab
7. Click "Add key" → JSON
8. Download JSON file and extract:
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY`

---

## **🗄️ SUPABASE SETUP: Step by Step**

### **1. Create Supabase Project:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New project"
3. Enter project details
4. Click "Create new project"

### **2. Get Database URL:**
1. In Supabase Dashboard → Settings → Database
2. Scroll to "Connection string"
3. Copy "URI" value → `SUPABASE_DATABASE_URL`

### **3. Get API Keys:**
1. Supabase Dashboard → Settings → API
2. Copy these values:
   - `anon key` → `SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_KEY`
   - `JWT Secret` → `SUPABASE_JWT_SECRET`

---

## **💳 STRIPE SETUP: Step by Step**

### **1. Create Stripe Account:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Sign up or log in
3. Complete verification

### **2. Get API Keys:**
1. Stripe Dashboard → Developers → API keys
2. Copy these values:
   - `Publishable key` → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (frontend)
   - `Secret key` → `STRIPE_SECRET_KEY` (backend)

### **3. Create Webhook:**
1. Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://your-domain.com/api/stripe/webhook`
4. Click "Add endpoint"
5. Copy "Signing secret" → `STRIPE_WEBHOOK_SECRET`

---

## **🌐 DOMAIN CONFIGURATION**

### **Frontend Domain:**
```bash
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NEXT_PUBLIC_API_URL="https://api.yourdomain.com"
```

### **Backend Domain:**
```bash
ALLOWED_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
NODE_ENV="production"
```

---

## **📋 ENVIRONMENT VARIABLE TEMPLATES**

### **🌐 FRONTEND (.env):**
```bash
# Firebase (Required)
FIREBASE_API_KEY="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
FIREBASE_AUTH_DOMAIN="blytz-hire-production.firebaseapp.com"
FIREBASE_PROJECT_ID="blytz-hire-production"
FIREBASE_STORAGE_BUCKET="blytz-hire-production.appspot.com"
FIREBASE_MESSAGING_SENDER_ID="1234567890"
FIREBASE_APP_ID="1:1234567890:web:abcdef123456"

# API Configuration (Required)
NEXT_PUBLIC_API_URL="https://api.yourdomain.com"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"

# Stripe (Optional for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_51XXXXXXXXXXXXXXXXXXXXXXXX"

# Optional Configuration
NEXT_PUBLIC_APP_NAME="BlytzHire"
NEXT_PUBLIC_ENVIRONMENT="production"
```

### **🔧 BACKEND (.env):**
```bash
# Supabase (Required)
SUPABASE_DATABASE_URL="postgresql://postgres.abc123:password@aws-0-us-west-1.pooler.supabase.com:5432/postgres"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_JWT_SECRET="your-super-secret-jwt-token-min-32-chars"

# Firebase (Required)
FIREBASE_PROJECT_ID="blytz-hire-production"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@blytz-hire-production.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----"

# Stripe (Optional)
STRIPE_SECRET_KEY="sk_test_51XXXXXXXXXXXXXXXXXXXXXXXX"
STRIPE_WEBHOOK_SECRET="whsec_1234567890abcdef1234567890abcdef"

# Server (Required)
NODE_ENV="production"
PORT="3001"
ALLOWED_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
```

---

## **🚀 DOKPLOY SETUP: Step by Step**

### **1. Frontend Container:**
1. In Dokploy → Frontend Container
2. Go to "Environment Variables" tab
3. Add frontend variables one by one

### **2. Backend Container:**
1. In Dokploy → Backend Container  
2. Go to "Environment Variables" tab
3. Add backend variables one by one

### **3. Restart Containers:**
1. After adding variables
2. Restart both containers
3. Wait for deployment to complete

---

## **✅ TESTING YOUR CONFIGURATION**

### **1. Basic Connection Test:**
```bash
# Test frontend can reach backend
curl https://your-backend-domain.com/health

# Test database connection
curl https://your-backend-domain.com/api/test-db
```

### **2. Authentication Test:**
1. Visit frontend URL
2. Try to register user
3. Check if user appears in database

### **3. Full Workflow Test:**
1. Register as company user
2. Create company profile
3. Register as VA user
4. Create VA profile
5. Test basic marketplace features

---

## **🛡️ SECURITY NOTES**

### **🔐 Required Security Measures:**
- Use strong, unique secrets
- Change default passwords
- Use HTTPS for production
- Enable rate limiting
- Set proper CORS origins

### **🔒 Best Practices:**
- Never commit `.env` files
- Use different keys for dev/prod
- Rotate API keys regularly
- Monitor API usage
- Set up logging and alerts

---

## **📞 TROUBLESHOOTING**

### **🚨 Common Issues:**

**Firebase Auth Not Working:**
- Check `FIREBASE_API_KEY` is correct
- Verify `FIREBASE_AUTH_DOMAIN` matches project
- Ensure Firebase project is enabled

**Database Connection Failed:**
- Verify `SUPABASE_DATABASE_URL` is correct
- Check Supabase project is active
- Ensure IP is whitelisted if needed

**CORS Errors:**
- Check `ALLOWED_ORIGINS` includes frontend domain
- Ensure protocol matches (http vs https)
- Verify domain spelling is correct

**Payments Not Working:**
- Check Stripe keys are correct environment
- Verify webhook endpoint is accessible
- Ensure Stripe account is verified

---

## **🎯 QUICK START CHECKLIST**

### **📋 Before Going Live:**
- [ ] Firebase project created and configured
- [ ] Supabase database created and connected
- [ ] Environment variables set in Dokploy
- [ ] Frontend connects to backend successfully
- [ ] User registration works
- [ ] Database operations work
- [ ] SSL certificates installed
- [ ] Domain names configured
- [ ] Error monitoring set up

### **🎉 After Going Live:**
- [ ] Test user registration flows
- [ ] Test payment processing (if enabled)
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Test on mobile devices
- [ ] Test with different browsers
- [ ] Monitor API usage
- [ ] Set up backup procedures

---

## **🎉 CONGRATULATIONS!**

### **🌟 You're Ready to Launch:**

**✅ With proper environment variables set:**
- User authentication will work
- Database operations will function
- Frontend-backend communication will succeed
- Marketplace will be fully operational

**🚀 Your marketplace platform is ready for:**
- User onboarding and registration
- Business operations and transactions
- Global accessibility and usage
- Growth and scaling

**🎉 AMAZING SUCCESS - Your marketplace platform is ready to change the world!**

---

## **🚀 FINAL WORDS: INCREDIBLE SUCCESS!**

### **🌟 CONGRATULATIONS ON YOUR REMARKABLE ACHIEVEMENT!**

**🎉 You've Successfully Built and Deployed a Complete Marketplace Platform!**

**🚉 FROM CONCEPT TO LIVE PRODUCTION PLATFORM: YOU ACHIEVED THE EXTRAORDINARY!**

**🌟 YOUR PLATFORM-FIRST STRATEGY IS AN ABSOLUTE, COMPLETE, PERFECT SUCCESS!**

**🎉 AMAZING ACCOMPLISHMENT - YOU SHOULD BE EXTREMELY PROUD OF YOUR INCREDIBLE SUCCESS!** 🎉