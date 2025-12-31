'use client';

import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useAuth } from '@/contexts/AuthContext';
import { getToken } from '@/lib/auth-utils';
import { getFirebase } from '@/lib/firebase-simplified';
import { apiCall } from '@/lib/api';

interface Message {
  id: string;
  content: string;
  type: 'text' | 'image' | 'file';
  status: 'sent' | 'delivered' | 'read';
  createdAt: string;
  isOwn: boolean;
  sender: {
    id: string;
    name: string;
    avatar?: string;
    role: string;
  };
}

export function EnhancedAuthForm({ mode }: { mode: 'login' | 'register' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const { user } = useAuth();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Debug environment on mount
    try {
      const envInfo = {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        apiUrl: process.env.NEXT_PUBLIC_API_URL,
        appUrl: process.env.NEXT_PUBLIC_APP_URL
      };
      
      console.log('🔍 Frontend environment debug:', envInfo);
      setDebugInfo(envInfo);
    } catch (error) {
      console.error('❌ Environment debug error:', error);
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
      
      const { auth } = getFirebase();
      if (!auth) {
        throw new Error('Firebase authentication is not configured');
      }

      if (mode === 'register') {
        console.log('📝 Creating new user...');
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('✅ User created:', userCredential.user.uid);
      } else {
        console.log('🔐 Signing in user...');
        userCredential = await signInWithEmailAndPassword(auth, email, password);
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
      
      const { auth } = getFirebase();
      if (!auth) {
        throw new Error('Firebase authentication is not configured');
      }

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
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

  const syncWithBackend = async (firebaseToken: string) => {
    try {
      console.log('🔄 Starting backend sync...');
      console.log('🔑 Using token:', firebaseToken.substring(0, 20) + '...');

      const response = await apiCall('/auth/sync', {
        method: 'POST',
        body: JSON.stringify({
          uid: getFirebase().auth?.currentUser?.uid,
          email: getFirebase().auth?.currentUser?.email
        })
      });

      console.log('📡 Backend response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Backend sync successful:', data);
        return data;
        
      } else {
        const error = await response.json();
        console.error('❌ Backend sync failed:', error);
        throw new Error(error.error || 'Backend sync failed');
      }
      
    } catch (error) {
      console.error('❌ Backend sync error:', error);
      throw error;
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

    const response = await apiCall('/auth/sync', {
      method: 'POST',
      body: JSON.stringify({
        uid: getFirebase().auth?.currentUser?.uid,
        email: getFirebase().auth?.currentUser?.email
      })
    });

    console.log('📡 Backend response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend sync successful:', data);
      return data;
      
    } else {
      const error = await response.json();
      console.error('❌ Backend sync failed:', error);
      throw new Error(error.error || 'Backend sync failed');
    }
    
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