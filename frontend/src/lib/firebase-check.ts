// Check if Firebase is properly configured
const isFirebaseConfigured = (): boolean => {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  };
  
  return !!(config.apiKey && config.projectId && 
           config.apiKey !== 'your-api-key' && 
           config.projectId !== 'your-firebase-project-id');
};

export { isFirebaseConfigured };