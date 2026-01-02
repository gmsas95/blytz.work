'use client';

import { useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { apiCall } from '@/lib/api';

interface AuthFormProps {
  mode: 'login' | 'register';
}

export function SimpleAuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // User is signed in
        console.log('✅ User authenticated:', currentUser.email);
      } else {
        // User is signed out
        console.log('ℹ️ User not authenticated');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔍 Starting email authentication...');
      console.log('📧 Email:', email);

      const auth = getAuth();
      let userCredential;
      
      if (mode === 'register') {
        console.log('📝 Creating new user...');
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        console.log('🔐 Signing in user...');
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }

      console.log('✅ Authentication successful:', userCredential.user.email);
      
      // Get Firebase token
      const token = await userCredential.user.getIdToken();
      console.log('🔑 Token obtained');

      // Sync with backend
      await syncWithBackend(token, userCredential.user);
      
      // Redirect to dashboard
      window.location.href = '/dashboard';
      
    } catch (error: any) {
      console.error('❌ Authentication failed:', error);
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
      
      // Get Firebase token
      const token = await result.user.getIdToken();
      console.log('🔑 Firebase token obtained');

      // Sync with backend
      await syncWithBackend(token, result.user);
      
      // Redirect to dashboard
      window.location.href = '/dashboard';
      
    } catch (error: any) {
      console.error('❌ Google authentication failed:', error);
      setError(mapAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  const syncWithBackend = async (token: string, currentUser: FirebaseUser) => {
    try {
      console.log('🔄 Starting backend sync...');

      const response = await apiCall('/auth/sync', {
        method: 'POST',
        body: JSON.stringify({
          uid: currentUser.uid,
          email: currentUser.email
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
    <div className="simple-auth-form">
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