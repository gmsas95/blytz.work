# 🔐 Firebase Auth Debug & Implementation - Immediate Fixes

## 🚨 **IMMEDIATE ACTION - Auth Issue Resolution**

Since your Firebase envs are set via Dokploy secrets but not being picked up, let's implement the fixes step by step.

---

## **Step 1: Create Debug Implementation Files**

### **Backend Environment Validator**
```bash
# Create: backend/src/utils/envValidator.ts
cat > backend/src/utils/envValidator.ts << 'EOF'
/**
 * Enhanced environment variable access for Dokploy deployment
 * Tries multiple sources for env vars
 */

export function getEnvVar(key: string, defaultValue?: string): string {
  // Try multiple sources for environment variables
  const sources = [
    process.env[key],                           // Standard env
    process.env[`DOKPLOY_${key}`],              // Dokploy prefix
    process.env[`${key}_DOKPLOY`],              // Dokploy suffix
    process.env[`NEXT_PUBLIC_${key}`],          // Next.js prefix (if applicable)
    defaultValue                                // Fallback
  ];

  const value = sources.find(v => v !== undefined && v !== '');
  
  if (!value && !defaultValue) {
    console.error(`❌ Environment variable ${key} is required but not found`);
    console.error('Checked sources:', sources.map((v, i) => `${i}: ${v ? 'FOUND' : 'MISSING'}`));
    throw new Error(`Environment variable ${key} is required but not found`);
  }
  
  return value || defaultValue || '';
}

export function validateRequiredEnvVars(requiredVars: string[]): void {
  const missing: string[] = [];
  
  for (const key of requiredVars) {
    try {
      getEnvVar(key);
    } catch (error) {
      missing.push(key);
    }
  }
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  console.log('✅ All required environment variables validated');
}
EOF
```

### **Firebase Config with Debug Logging**
```bash
# Create: backend/src/config/firebaseConfig.ts
cat > backend/src/config/firebaseConfig.ts << 'EOF'
import { getEnvVar } from '../utils/envValidator.js';

export const firebaseConfig = {
  projectId: getEnvVar('FIREBASE_PROJECT_ID'),
  clientEmail: getEnvVar('FIREBASE_CLIENT_EMAIL'),
  privateKey: getEnvVar('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
};

export function validateFirebaseConfig(): void {
  console.log('🔍 Validating Firebase configuration...');
  
  const required = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL', 
    'FIREBASE_PRIVATE_KEY'
  ];
  
  for (const key of required) {
    try {
      const value = getEnvVar(key);
      console.log(`✅ ${key}: ${value ? 'FOUND' : 'MISSING'}`);
    } catch (error) {
      console.error(`❌ ${key}: MISSING`);
      throw error;
    }
  }
  
  console.log('✅ Firebase configuration validated successfully');
}
EOF
```

### **Enhanced Auth Plugin with Debug Logging**
```bash
# Create: backend/src/plugins/firebaseAuthDebug.ts
cat > backend/src/plugins/firebaseAuthDebug.ts << 'EOF'
import { FastifyReply, FastifyRequest } from "fastify";
import admin from "firebase-admin";
import { prisma } from "../utils/prisma.js";
import { firebaseConfig } from "../config/firebaseConfig.js";

// Initialize Firebase Admin with detailed logging
let firebaseAuth: admin.auth.Auth | null = null;

export function initializeFirebaseAuth() {
  try {
    if (firebaseConfig.projectId && firebaseConfig.clientEmail && firebaseConfig.privateKey) {
      console.log('🔍 Initializing Firebase Admin with config:', {
        projectId: firebaseConfig.projectId,
        clientEmail: firebaseConfig.clientEmail,
        hasPrivateKey: !!firebaseConfig.privateKey
      });

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: firebaseConfig.projectId,
          clientEmail: firebaseConfig.clientEmail,
          privateKey: firebaseConfig.privateKey,
        }),
      });
      
      firebaseAuth = admin.auth();
      console.log('✅ Firebase Admin initialized successfully');
    } else {
      console.warn('⚠️ Firebase credentials incomplete, using development mode');
      firebaseAuth = null;
    }
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error);
    firebaseAuth = null;
  }
}

export async function verifyAuth(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  console.log('🔍 Auth Debug - Starting verification');
  console.log('🔍 Auth Debug - Headers:', Object.keys(request.headers));
  console.log('🔍 Auth Debug - Authorization:', request.headers.authorization);

  const authHeader = request.headers.authorization;
  
  if (!authHeader) {
    console.log('❌ No authorization header found');
    return reply.code(401).send(createAuthError('MISSING_AUTH_HEADER', 'Missing authorization header'));
  }

  const token = authHeader.split(' ')[1];
  console.log('🔍 Auth Debug - Token extracted:', token ? `${token.substring(0, 20)}...` : 'null');

  if (!token) {
    console.log('❌ No token in authorization header');
    return reply.code(401).send(createAuthError('MISSING_TOKEN', 'Missing token'));
  }

  try {
    if (firebaseAuth) {
      console.log('🔍 Attempting Firebase token verification');
      const decodedToken = await firebaseAuth.verifyIdToken(token);
      console.log('✅ Firebase token verified for:', decodedToken.email);
      
      // Get user from database
      const user = await prisma.user.findUnique({
        where: { email: decodedToken.email },
        select: { id: true, role: true, email: true, profileComplete: true }
      });

      if (!user) {
        console.log('❌ User not found in database:', decodedToken.email);
        return reply.code(401).send(createAuthError('USER_NOT_FOUND', 'User not found in database'));
      }

      request.user = {
        uid: user.id,
        email: user.email,
        role: user.role as 'company' | 'va' | 'admin',
        profileComplete: user.profileComplete
      };
      
      console.log('✅ User authenticated:', user.email, 'Role:', user.role);
      return;
    }
    
    // Development mode with debug tokens
    console.log('⚠️ Development mode - using debug tokens');
    if (token === 'dev-token-admin') {
      request.user = {
        uid: 'dev-admin-user',
        email: 'admin@dev.com',
        role: 'admin',
        profileComplete: true
      };
      console.log('✅ Development admin authenticated');
      return;
    }
    
    console.log('❌ Invalid development token');
    return reply.code(401).send(createAuthError('INVALID_DEV_TOKEN', 'Invalid development token'));
    
  } catch (error: any) {
    console.log('❌ Token verification failed:', error.message);
    return reply.code(401).send(createAuthError('INVALID_TOKEN', 'Invalid or expired token'));
  }
}

function createAuthError(code: string, message: string) {
  return {
    success: false,
    error: message,
    code,
    debug: {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      hasFirebaseAuth: !!firebaseAuth
    }
  };
}
EOF
```

---

## **Step 2: Update Server Startup**

```bash
# Update: backend/src/server.ts - Add enhanced startup
# Find the start() function and replace with:

cat > backend/src/server-enhanced-startup.ts << 'EOF'
import { validateFirebaseConfig } from './config/firebaseConfig.js';
import { initializeFirebaseAuth } from './plugins/firebaseAuthDebug.js';

const start = async () => {
  try {
    // Step 1: Validate all required environment variables
    console.log('🚀 Starting Hyred Backend with Enhanced Configuration...');
    
    validateRequiredEnvVars([
      'NODE_ENV',
      'PORT',
      'DATABASE_URL',
      'JWT_SECRET'
    ]);
    
    // Step 2: Validate Firebase configuration
    validateFirebaseConfig();
    
    // Step 3: Test database connection
    console.log('🔄 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Step 4: Initialize Firebase Admin
    console.log('🔄 Initializing Firebase Admin...');
    initializeFirebaseAuth();
    
    // Step 5: Start server
    const port = parseInt(process.env.PORT || '3000');
    console.log(`🚀 Starting server on port ${port}...`);
    
    await app.listen({
      port,
      host: "0.0.0.0"
    });
    
    console.log(`🎉 Server successfully started on port ${port}`);
    console.log('📡 Ready for connections...');
    
  } catch (error: any) {
    console.error('❌ Failed to start server:', error);
    console.error('💡 Troubleshooting tips:');
    console.error('   1. Check environment variables are set correctly');
    console.error('   2. Verify Firebase credentials are valid');
    console.error('   3. Ensure database is accessible');
    process.exit(1);
  }
};
EOF
```

---

## **Step 3: Frontend Environment Debug**

```bash
# Create: frontend/src/lib/envDebug.ts
cat > frontend/src/lib/envDebug.ts << 'EOF'
/**
 * Enhanced environment variable access for frontend
 * Handles Dokploy environment variables properly
 */

export function getClientEnv(key: string): string {
  // Try multiple sources for client-side environment variables
  const sources = [
    process.env[key],                           // Standard env (build time)
    process.env[`NEXT_PUBLIC_${key}`],          // Next.js public env
    (typeof window !== 'undefined' ? (window as any).ENV?.[key] : undefined), // Runtime env
  ];

  const value = sources.find(v => v !== undefined && v !== '');
  
  if (!value) {
    console.error(`❌ Client environment variable not found: ${key}`);
    console.error('Checked sources:', sources.map((v, i) => `${i}: ${v ? 'FOUND' : 'MISSING'}`));
    console.error('Available NEXT_PUBLIC vars:', Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC_')));
  }
  
  return value || '';
}

export function validateClientFirebaseConfig(): void {
  console.log('🔍 Validating client Firebase configuration...');
  
  const required = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
  ];
  
  for (const key of required) {
    const value = getClientEnv(key);
    console.log(`✅ ${key}: ${value ? 'FOUND' : 'MISSING'}`);
    
    if (!value) {
      throw new Error(`Missing Firebase client configuration: ${key}`);
    }
  }
  
  console.log('✅ Client Firebase configuration validated');
}
EOF
```

---

## **Step 4: Enhanced Frontend Auth**

```bash
# Create: frontend/src/components/auth/EnhancedAuthForm.tsx
cat > frontend/src/components/auth/EnhancedAuthForm.tsx << 'EOF'
'use client';

import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup, 
  GoogleAuthProvider,
  getAuth
} from 'firebase/auth';
import { validateClientFirebaseConfig } from '@/lib/envDebug';

export function EnhancedAuthForm({ mode }: { mode: 'login' | 'register' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    // Debug environment on mount
    try {
      validateClientFirebaseConfig();
      setDebugInfo({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
      });
    } catch (error) {
      setDebugInfo({ error: error.message });
    }
  }, []);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔍 Starting email authentication...');
      console.log('📧 Email:', email);
      console.log('🔑 Password length:', password.length);

      let userCredential;
      
      if (mode === 'register') {
        console.log('📝 Creating new user...');
        userCredential = await createUserWithEmailAndPassword(getAuth(), email, password);
        console.log('✅ User created:', userCredential.user.uid);
      } else {
        console.log('🔐 Signing in user...');
        userCredential = await signInWithEmailAndPassword(getAuth(), email, password);
        console.log('✅ User signed in:', userCredential.user.uid);
      }

      // Get Firebase token
      console.log('🔑 Getting Firebase token...');
      const token = await userCredential.user.getIdToken();
      console.log('✅ Token obtained:', token.substring(0, 20) + '...');

      // Sync with backend
      console.log('🔄 Syncing with backend...');
      await syncWithBackend(token);
      console.log('✅ Backend sync complete');

      // Redirect
      window.location.href = '/dashboard';
      
    } catch (error: any) {
      console.error('❌ Authentication failed:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      setDebugInfo(prev => ({
        ...prev,
        lastError: {
          code: error.code,
          message: error.message,
          email: email
        }
      }));
      
      setError(mapAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('🔍 Starting Google authentication...');
      
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(getAuth(), provider);
      
      console.log('✅ Google sign-in successful:', result.user.email);
      console.log('✅ Google user ID:', result.user.uid);

      // Get Firebase token
      const token = await result.user.getIdToken();
      console.log('🔑 Firebase token obtained');

      // Sync with backend
      await syncWithBackend(token);
      
      // Redirect
      window.location.href = '/dashboard';
      
    } catch (error: any) {
      console.error('❌ Google authentication failed:', error);
      setError(mapAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="enhanced-auth-form">
      {debugInfo && (
        <div className="debug-info">
          <small>Debug: {JSON.stringify(debugInfo, null, 2)}</small>
        </div>
      )}
      
      <form onSubmit={handleEmailAuth}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="your@email.com"
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            disabled={loading}
          />
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>
      </form>
      
      <div className="divider">
        <span>OR</span>
      </div>
      
      <button 
        type="button" 
        onClick={handleGoogleAuth}
        disabled={loading}
        className="google-auth-button"
      >
        Continue with Google
      </button>
    </div>
  );
}

async function syncWithBackend(firebaseToken: string) {
  try {
    console.log('🔄 Starting backend sync...');
    console.log('🔑 Using token:', firebaseToken.substring(0, 20) + '...');
    
    const response = await fetch('/api/auth/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${firebaseToken}`
      },
      body: JSON.stringify({
        uid: getAuth().currentUser?.uid,
        email: getAuth().currentUser?.email
      })
    });

    console.log('📡 Backend response status:', response.status);
    
    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Backend sync failed:', error);
      throw new Error(error.error || 'Backend sync failed');
    }

    const data = await response.json();
    console.log('✅ Backend sync successful:', data);
    return data;
    
  } catch (error) {
    console.error('❌ Backend sync error:', error);
    throw error;
  }
}

function mapAuthError(error: any): string {
  const errorMessages: Record<string, string> = {
    'auth/invalid-email': 'Invalid email address',
    'auth/user-disabled': 'This account has been disabled',
    'auth/user-not-found': 'No account found with this email',
    'auth/wrong-password': 'Incorrect password',
    'auth/email-already-in-use': 'An account already exists with this email',
    'auth/weak-password': 'Password should be at least 6 characters',
    'auth/popup-closed-by-user': 'Google sign-in was cancelled',
    'auth/cancelled-popup-request': 'Sign-in request was cancelled',
    'auth/network-request-failed': 'Network error. Please check your connection',
    'auth/too-many-requests': 'Too many attempts. Please try again later'
  };
  
  return errorMessages[error.code] || error.message || 'Authentication failed';
}
EOF
```

---

## **Step 5: Test the Implementation**

### **Run the Enhanced Backend**
```bash
# Navigate to backend
cd /home/sas/blytz.work/backend

# Install dependencies if needed
npm install

# Build with new configuration
npm run build

# Run with debug logging
DEBUG=auth:* npm run dev

# Or run with enhanced startup
npm run dev
```

### **Check Logs for Debug Output**
You should see detailed debug output like:
```
🚀 Starting Hyred Backend with Enhanced Configuration...
🔍 Validating Firebase configuration...
✅ FIREBASE_PROJECT_ID: FOUND
✅ FIREBASE_CLIENT_EMAIL: FOUND
✅ FIREBASE_PRIVATE_KEY: FOUND
✅ Firebase configuration validated successfully
🔄 Testing database connection...
✅ Database connected successfully
🔄 Initializing Firebase Admin...
🔍 Initializing Firebase Admin with config: { projectId: 'your-project', ... }
✅ Firebase Admin initialized successfully
🚀 Starting server on port 3000...
🎉 Server successfully started on port 3000
```

### **Test Authentication**
```bash
# Test backend health
curl https://api.blytz.app/health

# Should return: {"ok":true,"timestamp":"..."}

# Test auth endpoint with debug info
curl -X POST https://api.blytz.app/api/auth/sync \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dev-token-admin" \
  -d '{"uid": "test-user", "email": "test@example.com"}'

# Should return detailed debug information
```

---

## **Step 6: Frontend Integration**

### **Update Frontend Auth**
```bash
# Update your frontend auth component to use the enhanced version
# Make sure to import from the correct file:
import { EnhancedAuthForm } from '@/components/auth/EnhancedAuthForm';
```

### **Test Frontend Auth**
1. Navigate to your login page
2. Check browser console for debug output
3. Try email/password login
4. Try Google login
5. Verify the full flow works

---

## **Step 7: Verify Everything Works**

### **Final Verification Checklist**
- [ ] Backend starts without Firebase errors
- [ ] Firebase configuration is properly loaded
- [ ] Authentication works with email/password
- [ ] Authentication works with Google
- [ ] Backend sync completes successfully
- [ ] User is redirected to dashboard after auth
- [ ] Debug logs show detailed information

### **If Issues Persist:**
1. **Check Dokploy logs** for environment variable injection
2. **Verify DNS** is pointing to correct services
3. **Check Traefik routing** is working correctly
4. **Test with development tokens** first
5. **Review all debug logs** for specific error messages

---

## **Expected Result:**

After implementing these fixes, your authentication should work perfectly with:
- ✅ Proper Firebase environment variable access
- ✅ Detailed debug logging for troubleshooting
- ✅ Robust error handling
- ✅ Full authentication flow (email + Google)
- ✅ Backend synchronization
- ✅ Professional error messages

**Ready for MVP launch!** 🚀