// Fallback API client for when backend is unavailable
export const getFallbackUserData = (email: string) => {
  const role = email.includes('company') || email.includes('employer') ? 'employer' : 'va';
  const userId = `fallback-${role}-${Date.now()}`;
  
  return {
    id: userId,
    uid: userId,
    email: email,
    role: role === 'employer' ? 'company' : 'va',
    profileComplete: false,
    createdAt: new Date().toISOString()
  };
};

export const checkProfileExists = async (type: 'company' | 'va'): Promise<boolean> => {
  // For now, always return false to trigger onboarding
  // This can be enhanced later to check localStorage
  return false;
};

export const getMockCompanyProfile = () => {
  return null; // No profile yet, needs onboarding
};

export const getMockVAProfile = () => {
  return null; // No profile yet, needs onboarding
};