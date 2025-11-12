'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { isFirebaseAvailable, useAuthStateListener, performSignOut as signOutFunction, sendPasswordResetEmail, type FirebaseUser } from '@/lib/firebase-v10';

interface AuthUser {
  uid: string;
  email: string;
  displayName?: string;
  role: 'va' | 'company';
  profileComplete: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<AuthUser>;
  signInWithEmailAndPassword: (email: string, password: string) => Promise<AuthUser>;
  createUserWithEmailAndPassword: (email: string, password: string, role: string) => Promise<AuthUser>;
  sendEmailVerification: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// AuthProvider component for client-side only
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseAvailable()) {
      setLoading(false);
      return;
    }

    const unsubscribe = useAuthStateListener(async (firebaseUser: FirebaseUser | null) => {
      try {
        if (firebaseUser) {
          // Get ID token to access custom claims
          const idTokenResult = await firebaseUser.getIdTokenResult();
          const role = idTokenResult.claims.role as 'va' | 'company' || 'va';
          
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            role: role,
            profileComplete: false, // This should come from your user profile data
            displayName: firebaseUser.displayName || undefined,
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error getting user role:', error);
        setError('Failed to authenticate user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<AuthUser> => {
    if (!isFirebaseAvailable()) {
      throw new Error('Firebase is not available');
    }
    
    try {
      const { signInWithPopup, GoogleAuthProvider } = await import('@/lib/firebase-v10');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth!, provider);
      
      const authUser: AuthUser = {
        uid: result.user.uid,
        email: result.user.email || '',
        displayName: result.user.displayName || undefined,
        role: 'va', // Default role - you should get this from backend
        profileComplete: false,
      };
      
      return authUser;
    } catch (error) {
      throw error;
    }
  };

  const signInWithEmailPassword = async (email: string, password: string): Promise<AuthUser> => {
    if (!isFirebaseAvailable()) {
      throw new Error('Firebase is not available');
    }
    
    try {
      const { signInWithEmailAndPassword } = await import('@/lib/firebase-v10');
      const result = await signInWithEmailAndPassword(auth!, email, password);
      
      const authUser: AuthUser = {
        uid: result.user.uid,
        email: result.user.email || '',
        displayName: result.user.displayName || undefined,
        role: 'va', // Default role - you should get this from backend
        profileComplete: false,
      };
      
      return authUser;
    } catch (error) {
      throw error;
    }
  };

  const createUserWithEmailPassword = async (email: string, password: string, role: string): Promise<AuthUser> => {
    if (!isFirebaseAvailable()) {
      throw new Error('Firebase is not available');
    }
    
    try {
      const { createUserWithEmailAndPassword } = await import('@/lib/firebase-v10');
      const result = await createUserWithEmailAndPassword(auth!, email, password);
      
      const authUser: AuthUser = {
        uid: result.user.uid,
        email: result.user.email || '',
        displayName: result.user.displayName || undefined,
        role: role as 'va' | 'company',
        profileComplete: false,
      };
      
      return authUser;
    } catch (error) {
      throw error;
    }
  };

  const sendEmailVerification = async (): Promise<void> => {
    if (!isFirebaseAvailable()) {
      throw new Error('Firebase is not available');
    }
    
    try {
      const { sendEmailVerification } = await import('@/lib/firebase-v10');
      await sendEmailVerification(auth!.currentUser!);
    } catch (error) {
      throw error;
    }
  };

  const sendPasswordResetEmail = async (email: string): Promise<void> => {
    if (!isFirebaseAvailable()) {
      throw new Error('Firebase is not available');
    }
    // Implement password reset here
    throw new Error('Password reset not implemented');
  };

  const performSignOut = async (): Promise<void> => {
    try {
      await signOutFunction();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const contextValue: AuthContextType = {
    user,
    loading,
    error,
    signInWithGoogle,
    signInWithEmailAndPassword: signInWithEmailPassword,
    createUserWithEmailAndPassword: createUserWithEmailPassword,
    sendEmailVerification,
    sendPasswordReset: sendPasswordResetEmail,
    signOut: performSignOut,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;