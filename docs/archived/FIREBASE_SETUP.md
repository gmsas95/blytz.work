# Environment Configuration Instructions

## 📋 How to Add Your Firebase Configuration

### Option 1: Local Development (.env)
Add your Firebase values to `.env`:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDy63cQFqr6DT7_y9pmhgASd8NX5GW0oio
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=blytz-hyred.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=blytz-hyred
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=blytz-hyred.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abcdef123456
```

### Option 2: Production Deployment (Dokploy Secrets)
In Dokploy's secret manager, add these environment variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_web_app_id
```

### Option 3: Server-side Environment
Add to your deployment platform's environment settings:
- **Vercel/Netlify**: Environment Variables section
- **Dokploy**: Secret Manager (recommended)
- **Cloud**: Platform-specific env settings

## 🔍 Debug Mode
Check browser console for Firebase initialization status:
- ✅ All environment variables marked as "SET"
- 🚀 "Initializing Firebase..." message
- ✅ "Firebase initialized successfully"

## 📱 Client-Side Access Requirements
Firebase requires `NEXT_PUBLIC_` prefix for client-side access in Next.js. Both formats work for backward compatibility:

```env
# These work (legacy support)
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...

# These work (recommended for Next.js)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
```

## ⚡ Current Status
Your `.env` already has real Firebase values! Just deploy and Firebase should initialize successfully.

## 🔧 Quick Deployment Checklist
- [ ] Firebase API key set
- [ ] Auth domain configured
- [ ] Project ID added
- [ ] Storage bucket specified
- [ ] App ID provided
- [ ] Environment variables exposed via NEXT_PUBLIC_ prefix
- [ ] Deployment includes .env file or secret manager

**Your Firebase configuration should now work with Dokploy's secret manager!** 🚀