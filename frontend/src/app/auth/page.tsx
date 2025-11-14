export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-black">Authentication</h1>
        <p className="text-gray-600">This page will be connected to Firebase Auth</p>
        <div className="space-x-4">
          <button className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800">Sign In</button>
          <button className="bg-[#FFD600] text-black px-6 py-2 rounded-md hover:bg-[#FFD600]/90">Sign Up</button>
        </div>
      </div>
    </div>
  );
}