import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { getFirebase } from '@/lib/firebase-simplified';

interface AuthUser {
  uid: string;
  email: string;
  displayName?: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const { auth } = getFirebase();
    if (!auth) {
      console.error('Firebase auth not initialized');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName || undefined,
        });
        
        try {
          const idToken = await firebaseUser.getIdToken();
          setToken(idToken);
        } catch (error) {
          console.error('Error getting ID token:', error);
          setToken(null);
        }
      } else {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, token, loading };
}