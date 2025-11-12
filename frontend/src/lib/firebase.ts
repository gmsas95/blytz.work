// Real Firebase Integration
import { initializeApp } from 'firebase/app';
import { useState, useEffect } from 'react';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordReset,
  signOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth';

// Your Firebase configuration - UPDATE WITH YOUR CONFIG
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "your-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "your-sender-id",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Auth service
export const authService = {
  async signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      throw error;
    }
  },

  async signInWithEmailAndPassword(email: string, password: string) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      throw error;
    }
  },

  async createUserWithEmailAndPassword(email: string, password: string, role: string) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      // Add role to user profile (you might want to use Firestore for this)
      return result.user;
    } catch (error) {
      throw error;
    }
  },

  async sendEmailVerification() {
    try {
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user);
      }
    } catch (error) {
      throw error;
    }
  },

  async sendPasswordReset(email: string) {
    try {
      await sendPasswordReset(auth, email);
    } catch (error) {
      throw error;
    }
  },

  async signOut() {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  },

  getCurrentUser() {
    return auth.currentUser;
  },

  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }
};

// Enhanced useAuth hook
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((authUser) => {
      setUser(authUser);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    loading,
    error,
    signInWithGoogle: authService.signInWithGoogle,
    signInWithEmailAndPassword: authService.signInWithEmailAndPassword,
    createUserWithEmailAndPassword: authService.createUserWithEmailAndPassword,
    sendEmailVerification: authService.sendEmailVerification,
    sendPasswordReset: authService.sendPasswordReset,
    signOut: authService.signOut
  };
}

// Export Firebase instances
export { auth, app, googleProvider };
export type { User };

// Mock functions for compatibility
export const getAuth = () => auth;
export const onAuthStateChanged = authService.onAuthStateChanged;
