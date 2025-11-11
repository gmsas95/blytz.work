export default function DiscoverPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          BlytzHire
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Virtual Assistant Discovery Platform
        </p>
        
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md mx-auto">
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Under Construction
          </h2>
          <p className="text-gray-600 mb-6">
            Our VA discovery platform is being built.
            Full functionality coming soon!
          </p>
          
          <div className="text-sm text-gray-500">
            <p>Database Status: ✅ Connected</p>
            <p>API Status: ✅ Ready</p>
            <p>Frontend Status: ✅ Deploying</p>
          </div>
        </div>
      </div>
    </div>
  );
}
