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
    // Implement Google sign-in here
    throw new Error('Google sign-in not implemented');
  };

  const signInWithEmailPassword = async (email: string, password: string): Promise<AuthUser> => {
    if (!isFirebaseAvailable()) {
      throw new Error('Firebase is not available');
    }
    // Implement email/password sign-in here
    throw new Error('Email sign-in not implemented');
  };

  const createUserWithEmailPassword = async (email: string, password: string, role: string): Promise<AuthUser> => {
    if (!isFirebaseAvailable()) {
      throw new Error('Firebase is not available');
    }
    // Implement user creation here
    throw new Error('User creation not implemented');
  };

  const sendEmailVerification = async (): Promise<void> => {
    if (!isFirebaseAvailable()) {
      throw new Error('Firebase is not available');
    }
    // Implement email verification here
    throw new Error('Email verification not implemented');
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