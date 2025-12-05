'use client';

import { useEffect, useState } from 'react';

export default function EnvTestPage() {
  const [envStatus, setEnvStatus] = useState<Record<string, string>>({});
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Check environment variables
    const status = {
      'NEXT_PUBLIC_FIREBASE_API_KEY': process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ CONFIGURED' : '❌ MISSING',
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN': process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✅ CONFIGURED' : '❌ MISSING',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID': process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ CONFIGURED' : '❌ MISSING',
      'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID': process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '✅ CONFIGURED' : '❌ MISSING',
      'NEXT_PUBLIC_FIREBASE_APP_ID': process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '✅ CONFIGURED' : '❌ MISSING',
    };

    // Check for literal placeholders
    if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes('${environment')) {
        status['API_KEY_PLACEHOLDER'] = '❌ CONTAINS PLACEHOLDER';
      } else {
        status['API_KEY_PLACEHOLDER'] = '✅ NO PLACEHOLDER';
      }
    }

    setEnvStatus(status);
  }, []);

  if (!isClient) {
    return <div>Loading environment check...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🔍 Firebase Environment Diagnostic</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Environment Variables Status</h2>
          <div className="space-y-3">
            {Object.entries(envStatus).map(([key, status]) => (
              <div key={key} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="font-mono text-sm">{key}</span>
                <span className={`font-semibold ${status.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
                  {status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Debug Info:</strong> If you see ❌ CONTAINS PLACEHOLDER, it means the environment variable 
                substitution failed during the build process. The frontend is trying to use a literal template string 
                instead of the actual API key.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Next Steps:</strong> Check your Dokploy secret manager to ensure all Firebase environment 
                variables are properly configured and accessible during the build process.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}