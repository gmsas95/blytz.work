'use client';

import { useAuth } from '@/components/AuthProvider';

export function EnvironmentStatus() {
  const { user, loading, error } = useAuth();
  
  if (typeof window === 'undefined') {
    return null; // Don't render on server
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg text-xs max-w-xs z-50">
      <h3 className="font-bold mb-2">🔍 Environment Status</h3>
      
      <div className="space-y-1">
        <div>Window: {typeof window !== 'undefined' ? '✅' : '❌'}</div>
        <div>Loading: {loading ? '✅' : '❌'}</div>
        <div>User: {user ? '✅' : '❌'}</div>
        <div>Error: {error ? '❌' : '✅'}</div>
      </div>
      
      {error && (
        <div className="mt-2 text-red-400">
          Error: {error}
        </div>
      )}
      
      <div className="mt-2 text-gray-400">
        <div>📋 Check browser console for details</div>
      </div>
    </div>
  );
}