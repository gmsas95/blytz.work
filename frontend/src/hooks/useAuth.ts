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
          
          // Sync user to database after Firebase sign-in
          syncUserToDatabase(firebaseUser);
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

// Sync Firebase user to PostgreSQL database
async function syncUserToDatabase(firebaseUser: User) {
  try {
    const response = await fetch('/api/auth/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await firebaseUser.getIdToken()}`
      },
      body: JSON.stringify({
        uid: firebaseUser.uid,
        email: firebaseUser.email
      })
    });

    if (response.ok) {
      console.log('✅ User synced to database:', firebaseUser.email);
    } else {
      console.error('❌ Failed to sync user to database:', response.status);
    }
  } catch (error) {
    console.error('❌ Error syncing user to database:', error);
  }
}