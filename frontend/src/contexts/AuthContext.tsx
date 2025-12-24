"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange, signOutUser, getToken } from '@/lib/auth';

interface AuthUser {
  uid: string;
  email: string;
  displayName?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    // Check for stored auth state on mount
    const storedUser = localStorage.getItem('authUser');
    const storedToken = localStorage.getItem('authToken');
    const storedRole = localStorage.getItem('userRole');
    
    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (isMounted) {
          setUser(parsedUser);
          setIsAuthenticated(true);
        }
        console.log('🔍 Restored auth state from localStorage');
      } catch (error) {
        console.error('❌ Failed to parse stored user:', error);
        // Clear invalid stored data
        localStorage.removeItem('authUser');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
      }
    }

    // Set up auth state change monitoring
    const unsubscribeAuth = onAuthStateChange((firebaseUser: User | null) => {
      if (!isMounted) return;
      
      if (firebaseUser) {
        const authUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName || undefined,
        };
        
        setUser(authUser);
        setIsAuthenticated(true);
        
        // Update localStorage with fresh auth state
        localStorage.setItem('authUser', JSON.stringify(authUser));
        
        // Get fresh token
        getToken().then(token => {
          if (token && isMounted) {
            localStorage.setItem('authToken', token);
          }
        }).catch(error => {
          console.error('❌ Failed to get token:', error);
        });
        
        console.log('✅ Auth state updated from Firebase');
      } else {
        setUser(null);
        setIsAuthenticated(false);
        
        // Clear localStorage on sign out
        localStorage.removeItem('authUser');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        
        console.log('🔍 User signed out, auth state cleared');
      }
      setLoading(false);
    });

    // Set loading to false after initial check
    if (isMounted) {
      setLoading(false);
    }

    return () => {
      isMounted = false;
      unsubscribeAuth();
    };
  }, []);

  const signOut = async () => {
    try {
      await signOutUser();
      setUser(null);
      setIsAuthenticated(false);
      
      // Clear all auth-related storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      localStorage.removeItem('userRole');
      localStorage.removeItem('isMockAuth');
      
      // Redirect to auth page
      window.location.href = '/auth';
    } catch (error) {
      console.error('❌ Sign out error:', error);
      // Force redirect even if sign out fails
      window.location.href = '/auth';
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}