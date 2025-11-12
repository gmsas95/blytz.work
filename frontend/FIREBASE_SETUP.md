# Environment Configuration Instructions

## 📋 How to Add Your Firebase Configuration

### Option 1: Environment Variables (Recommended)
Add your actual Firebase values to `.env.local`:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_web_app_id
```

### Option 2: Runtime Configuration (Development Only)
The app will prompt you to enter Firebase config if not set.

### Option 3: Server-side Environment
In production deployment, set these environment variables in your hosting platform:
- Vercel/Netlify: Environment Variables settings
- Docker: Docker compose .env file
- Cloud: Platform-specific environment settings

## 🔍 Debug Mode
If Firebase config is not set, you'll see debug information in the browser console.

## 📱 Next Steps
1. Get Firebase config from [Firebase Console](https://console.firebase.google.com)
2. Add values to `.env.local` (development) or deployment environment (production)
3. Restart development server or redeploy
4. Check browser console for Firebase initialization status

## ⚡ Quick Test
After configuration, the auth forms should work and show "Firebase initialized successfully" in console.