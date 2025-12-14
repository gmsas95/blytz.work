'use client';

import { useEffect, useState } from 'react';
import { initializeFirebase } from '@/lib/firebase-runtime-final';

// Helper function to check if a value contains placeholder text
const isPlaceholder = (value: string | undefined): boolean => {
  if (!value) return false;
  return value.includes('REPLACE_WITH_') ||
         value.includes('your-') ||
         value.includes('XXXXX') ||
         value.includes('example.com');
};

// Helper function to get detailed status of an environment variable
const getVarStatus = (varName: string, value: string | undefined) => {
  if (!value) {
    return { status: 'MISSING', color: 'red', message: 'Not set in environment' };
  }
  
  if (isPlaceholder(value)) {
    return {
      status: 'PLACEHOLDER',
      color: 'red',
      message: `Contains placeholder text: ${value.substring(0, 50)}...`
    };
  }
  
  return { status: 'VALID', color: 'green', message: 'Properly configured' };
};

export default function FirebaseDebug() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkFirebaseConfig = () => {
      try {
        // Get detailed status for each environment variable
        const envVars = {
          NEXT_PUBLIC_FIREBASE_API_KEY: getVarStatus('NEXT_PUBLIC_FIREBASE_API_KEY', process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
          NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: getVarStatus('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
          NEXT_PUBLIC_FIREBASE_PROJECT_ID: getVarStatus('NEXT_PUBLIC_FIREBASE_PROJECT_ID', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
          NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: getVarStatus('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
          NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: getVarStatus('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
          NEXT_PUBLIC_FIREBASE_APP_ID: getVarStatus('NEXT_PUBLIC_FIREBASE_APP_ID', process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
        };

        const { app, auth } = initializeFirebase();
        
        // Check if essential variables are valid
        const essentialVarsValid = [
          envVars.NEXT_PUBLIC_FIREBASE_API_KEY.status,
          envVars.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN.status,
          envVars.NEXT_PUBLIC_FIREBASE_PROJECT_ID.status
        ].every(status => status === 'VALID');
        
        setDebugInfo({
          environment: process.env.NODE_ENV,
          envVars,
          firebaseInitialized: !!(app && auth),
          hasAuth: !!auth,
          essentialVarsValid,
          apiKeyPreview: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?
            process.env.NEXT_PUBLIC_FIREBASE_API_KEY.substring(0, 20) + '...' : 'none',
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          apiUrl: process.env.NEXT_PUBLIC_API_URL,
          timestamp: new Date().toISOString(),
        });
      } catch (error: any) {
        setDebugInfo({
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    };

    checkFirebaseConfig();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>Firebase Configuration Debug</h1>
        <p>Loading debug information...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#333', borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>
        🔍 Firebase Configuration Debug
      </h1>
      
      {debugInfo ? (
        <div>
          {/* Environment Variables Status */}
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#444' }}>📋 Environment Variables Status</h2>
            <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '5px' }}>
              {Object.entries(debugInfo.envVars).map(([key, status]: [string, any]) => (
                <div key={key} style={{ marginBottom: '10px', padding: '10px', backgroundColor: 'white', borderRadius: '3px', border: `1px solid ${status.color === 'green' ? '#4CAF50' : '#f44336'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{key}</span>
                    <span style={{
                      color: status.color,
                      fontWeight: 'bold',
                      padding: '2px 8px',
                      borderRadius: '3px',
                      backgroundColor: status.color === 'green' ? '#e8f5e9' : '#ffebee'
                    }}>
                      {status.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                    {status.message}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Firebase Initialization Status */}
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#444' }}>🔥 Firebase Initialization Status</h2>
            <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '5px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '3px' }}>
                  <strong>Environment:</strong> {debugInfo.environment}
                </div>
                <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '3px' }}>
                  <strong>Firebase Initialized:</strong>
                  <span style={{ color: debugInfo.firebaseInitialized ? 'green' : 'red', fontWeight: 'bold', marginLeft: '5px' }}>
                    {debugInfo.firebaseInitialized ? '✅ Yes' : '❌ No'}
                  </span>
                </div>
                <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '3px' }}>
                  <strong>Auth Available:</strong>
                  <span style={{ color: debugInfo.hasAuth ? 'green' : 'red', fontWeight: 'bold', marginLeft: '5px' }}>
                    {debugInfo.hasAuth ? '✅ Yes' : '❌ No'}
                  </span>
                </div>
                <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '3px' }}>
                  <strong>Essential Variables:</strong>
                  <span style={{ color: debugInfo.essentialVarsValid ? 'green' : 'red', fontWeight: 'bold', marginLeft: '5px' }}>
                    {debugInfo.essentialVarsValid ? '✅ Valid' : '❌ Invalid'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Configuration Details */}
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#444' }}>⚙️ Configuration Details</h2>
            <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '5px' }}>
              <pre style={{ backgroundColor: 'white', padding: '10px', borderRadius: '3px', overflow: 'auto', fontSize: '12px' }}>
                {JSON.stringify({
                  environment: debugInfo.environment,
                  firebaseInitialized: debugInfo.firebaseInitialized,
                  hasAuth: debugInfo.hasAuth,
                  essentialVarsValid: debugInfo.essentialVarsValid,
                  apiKeyPreview: debugInfo.apiKeyPreview,
                  projectId: debugInfo.projectId,
                  authDomain: debugInfo.authDomain,
                  apiUrl: debugInfo.apiUrl,
                  timestamp: debugInfo.timestamp,
                }, null, 2)}
              </pre>
            </div>
          </div>

          {/* Error Display */}
          {debugInfo.error && (
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{ color: '#d32f2f' }}>❌ Error Details</h2>
              <div style={{ backgroundColor: '#ffebee', padding: '15px', borderRadius: '5px', border: '1px solid #f44336' }}>
                <pre style={{ color: '#d32f2f', margin: 0, whiteSpace: 'pre-wrap' }}>
                  {debugInfo.error}
                </pre>
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#444' }}>💡 Recommendations</h2>
            <div style={{ backgroundColor: '#e3f2fd', padding: '15px', borderRadius: '5px' }}>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {!debugInfo.firebaseInitialized && (
                  <li style={{ color: 'd32f2f', marginBottom: '10px' }}>
                    <strong>Firebase is not initialized.</strong> Check your environment variables and ensure they don't contain placeholder values.
                  </li>
                )}
                
                {Object.entries(debugInfo.envVars).map(([key, status]: [string, any]) => (
                  status.status === 'PLACEHOLDER' && (
                    <li key={key} style={{ color: 'd32f2f', marginBottom: '10px' }}>
                      <strong>{key}</strong> contains placeholder text. Replace it with your actual Firebase credentials.
                    </li>
                  )
                ))}
                
                {Object.entries(debugInfo.envVars).map(([key, status]: [string, any]) => (
                  status.status === 'MISSING' && (
                    <li key={key} style={{ color: 'd32f2f', marginBottom: '10px' }}>
                      <strong>{key}</strong> is missing from your environment. Add it to your .env.dokploy file.
                    </li>
                  )
                ))}
                
                {debugInfo.firebaseInitialized && debugInfo.essentialVarsValid && (
                  <li style={{ color: '#388e3c', marginBottom: '10px' }}>
                    <strong>✅ Firebase appears to be properly configured!</strong> All essential variables are set and Firebase is initialized.
                  </li>
                )}
                
                <li style={{ marginBottom: '10px' }}>
                  <strong>For detailed setup instructions:</strong> See <code>docs/FIREBASE_SETUP_COMPLETE_GUIDE.md</code>
                </li>
                
                <li style={{ marginBottom: '10px' }}>
                  <strong>To verify your configuration:</strong> Run <code>./scripts/verify-firebase-config.sh</code>
                </li>
              </ul>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#444' }}>🚀 Quick Actions</h2>
            <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '5px' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '10px 20px',
                  marginRight: '10px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
              >
                🔄 Refresh Status
              </button>
              
              <button
                onClick={() => window.open('/docs/FIREBASE_SETUP_COMPLETE_GUIDE.md', '_blank')}
                style={{
                  padding: '10px 20px',
                  marginRight: '10px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
              >
                📖 Setup Guide
              </button>
              
              <button
                onClick={() => navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2))}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#FF9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
              >
                📋 Copy Debug Info
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div>No debug information available</div>
      )}
    </div>
  );
}