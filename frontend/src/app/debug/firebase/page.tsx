'use client';

import { useEffect, useState } from 'react';
import { initializeFirebase } from '@/lib/firebase-runtime-final';

export default function FirebaseDebug() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkFirebaseConfig = () => {
      try {
        const envVars = {
          NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Present' : 'Missing',
          NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'Present' : 'Missing',
          NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'Present' : 'Missing',
          NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? 'Present' : 'Missing',
          NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? 'Present' : 'Missing',
          NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? 'Present' : 'Missing',
        };

        const { app, auth } = initializeFirebase();
        
        setDebugInfo({
          environment: process.env.NODE_ENV,
          envVars,
          firebaseInitialized: !!(app && auth),
          hasAuth: !!auth,
          apiKeyPreview: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 
            process.env.NEXT_PUBLIC_FIREBASE_API_KEY.substring(0, 20) + '...' : 'none',
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          apiUrl: process.env.NEXT_PUBLIC_API_URL,
        });
      } catch (error) {
        setDebugInfo({ error: error.message });
      } finally {
        setLoading(false);
      }
    };

    checkFirebaseConfig();
  }, []);

  if (loading) {
    return <div>Loading debug information...</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Firebase Configuration Debug</h1>
      
      {debugInfo ? (
        <div>
          <h2>Environment Variables Status:</h2>
          <pre>{JSON.stringify(debugInfo.envVars, null, 2)}</pre>
          
          <h2>Configuration Details:</h2>
          <pre>{JSON.stringify(
            { 
              environment: debugInfo.environment,
              firebaseInitialized: debugInfo.firebaseInitialized,
              hasAuth: debugInfo.hasAuth,
              apiKeyPreview: debugInfo.apiKeyPreview,
              projectId: debugInfo.projectId,
              authDomain: debugInfo.authDomain,
              apiUrl: debugInfo.apiUrl,
            }, 
            null, 
            2
          )}</pre>
          
          {debugInfo.error && (
            <div style={{ color: 'red' }}>
              <h2>Error:</h2>
              <pre>{debugInfo.error}</pre>
            </div>
          )}
          
          <h2>Recommendations:</h2>
          <ul>
            {!debugInfo.firebaseInitialized && (
              <li style={{ color: 'red' }}>
                Firebase is not initialized. Check your environment variables.
              </li>
            )}
            {!debugInfo.envVars?.NEXT_PUBLIC_FIREBASE_API_KEY && (
              <li style={{ color: 'red' }}>
                NEXT_PUBLIC_FIREBASE_API_KEY is missing in your environment.
              </li>
            )}
            {!debugInfo.envVars?.NEXT_PUBLIC_FIREBASE_PROJECT_ID && (
              <li style={{ color: 'red' }}>
                NEXT_PUBLIC_FIREBASE_PROJECT_ID is missing in your environment.
              </li>
            )}
            {!debugInfo.envVars?.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN && (
              <li style={{ color: 'red' }}>
                NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is missing in your environment.
              </li>
            )}
            {debugInfo.firebaseInitialized && (
              <li style={{ color: 'green' }}>
                Firebase appears to be properly configured!
              </li>
            )}
          </ul>
        </div>
      ) : (
        <div>No debug information available</div>
      )}
    </div>
  );
}