'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { isFirebaseAvailable, useAuthStateListener, performSignOut as signOutFunction, sendPasswordResetEmail as sendPasswordResetEmailFunction, auth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, type FirebaseUser } from '@/lib/firebase-v10';

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
    console.log('AuthProvider: Firebase available check...');
    if (!isFirebaseAvailable()) {
      console.log('AuthProvider: Firebase not available, setting loading false');
      setLoading(false);
      setError('Firebase is not available. Please check configuration.');
      return;
    }

    console.log('AuthProvider: Setting up auth state listener...');
    const unsubscribe = useAuthStateListener(async (firebaseUser: FirebaseUser | null) => {
      try {
        if (firebaseUser) {
          console.log('AuthProvider: User authenticated', firebaseUser.email);
          // For now, assume VA role - you'll implement role management later
          const authUser: AuthUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName,
            role: 'va',
            profileComplete: true
          };
          setUser(authUser);
          setError(null);
        } else {
          console.log('AuthProvider: User signed out');
          setUser(null);
          setError(null);
        }
      } catch (err) {
        console.error('AuthProvider: Error in auth state change:', err);
        setError(err instanceof Error ? err.message : 'Authentication error');
      } finally {
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Authentication methods
  const signInWithGoogle = async (): Promise<AuthUser> => {
    console.log('AuthProvider: Starting Google sign in...');
    if (!isFirebaseAvailable()) {
      throw new Error('Firebase is not available');
    }

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth!, provider);
      console.log('AuthProvider: Google sign in successful');
      
      // Create auth user object
      const authUser: AuthUser = {
        uid: result.user.uid,
        email: result.user.email || '',
        displayName: result.user.displayName,
        role: 'va',
        profileComplete: true
      };
      
      setUser(authUser);
      setError(null);
      return authUser;
    } catch (err: any) {
      console.error('AuthProvider: Google sign in error:', err);
      const errorMessage = err.message || 'Google sign-in failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const signInWithEmailAndPassword = async (email: string, password: string): Promise<AuthUser> => {
    console.log('AuthProvider: Starting email sign in...');
    if (!isFirebaseAvailable()) {
      throw new Error('Firebase is not available');
    }

    try {
      const result = await signInWithEmailAndPassword(auth!, email, password);
      console.log('AuthProvider: Email sign in successful');
      
      // Create auth user object
      const authUser: AuthUser = {
        uid: result.user.uid,
        email: result.user.email || '',
        displayName: result.user.displayName,
        role: 'va',
        profileComplete: true
      };
      
      setUser(authUser);
      setError(null);
      return authUser;
    } catch (err: any) {
      console.error('AuthProvider: Email sign in error:', err);
      const errorMessage = err.message || 'Email sign-in failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const createUserWithEmailAndPassword = async (email: string, password: string, role: string): Promise<AuthUser> => {
    console.log('AuthProvider: Starting user creation...');
    if (!isFirebaseAvailable()) {
      throw new Error('Firebase is not available');
    }

    try {
      const result = await createUserWithEmailAndPassword(auth!, email, password);
      console.log('AuthProvider: User creation successful');
      
      // Create auth user object
      const authUser: AuthUser = {
        uid: result.user.uid,
        email: result.user.email || '',
        displayName: result.user.displayName,
        role: role as 'va' | 'company',
        profileComplete: false
      };
      
      setUser(authUser);
      setError(null);
      return authUser;
    } catch (err: any) {
      console.error('AuthProvider: User creation error:', err);
      const errorMessage = err.message || 'Account creation failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const sendEmailVerification = async (): Promise<void> => {
    if (!isFirebaseAvailable()) {
      throw new Error('Firebase is not available');
    }
    
    // Note: This would require additional Firebase setup
    console.log('AuthProvider: Email verification requested');
  };

  const sendPasswordReset = async (email: string): Promise<void> => {
    console.log('AuthProvider: Password reset requested for', email);
    if (!isFirebaseAvailable()) {
      throw new Error('Firebase is not available');
    }
    
    // Note: This would require additional Firebase setup
    console.log('AuthProvider: Password reset would be sent to', email);
  };

  const signOut = async (): Promise<void> => {
    console.log('AuthProvider: Starting sign out...');
    if (!isFirebaseAvailable()) {
      throw new Error('Firebase is not available');
    }

    try {
      await signOutFunction();
      setUser(null);
      setError(null);
      console.log('AuthProvider: Sign out successful');
    } catch (err: any) {
      console.error('AuthProvider: Sign out error:', err);
      throw new Error(err.message || 'Sign-out failed');
    }
  };

  const contextValue: AuthContextType = {
    user,
    loading,
    error,
    signInWithGoogle,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    sendPasswordReset,
    signOut,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}