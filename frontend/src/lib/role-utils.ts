// Role management utilities for BlytzWork
// Handles role synchronization between frontend and backend

export type UserRole = 'employer' | 'va' | 'company' | null;

export interface UserProfile {
  uid: string;
  email: string;
  role?: 'va' | 'company' | 'admin';
  vaProfile?: any;
  company?: any;
  profileComplete?: boolean;
}

/**
 * Normalize role values between frontend (employer) and backend (company)
 * Frontend uses 'employer', backend uses 'company'
 */
export function normalizeRole(role: string | null | undefined): UserRole {
  if (!role) return null;
  // Frontend uses 'employer', backend uses 'company'
  return role === 'company' ? 'employer' : (role === 'va' ? 'va' : null);
}

/**
 * Denormalize role values from frontend to backend format
 */
export function denormalizeRole(role: string | null | undefined): string | null {
  if (!role) return null;
  return role === 'employer' ? 'company' : (role === 'va' ? 'va' : null);
}

/**
 * Fetch user profile from backend to get authoritative role
 * This ensures frontend always has correct role from database
 */
export async function fetchUserRole(): Promise<UserRole> {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.warn('No auth token found');
      return null;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch user profile:', response.status);
      return null;
    }

    const { data } = await response.json();
    if (!data || !data.role) {
      return null;
    }

    // Normalize role for frontend consumption
    const frontendRole = normalizeRole(data.role);
    console.log('✅ Fetched role from backend:', data.role, '-> frontend:', frontendRole);

    return frontendRole;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
}

/**
 * Sync user role to backend and update local storage
 * Use this when role needs to be permanently set
 */
export async function syncUserRole(role: 'employer' | 'va'): Promise<boolean> {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.warn('No auth token available for role sync');
      return false;
    }

    // Denormalize role for backend
    const backendRole = denormalizeRole(role);
    if (!backendRole) {
      console.error('Invalid role provided:', role);
      return false;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/role`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ role: backendRole })
    });

    if (!response.ok) {
      console.error('Failed to sync user role:', response.status);
      return false;
    }

    // Update local storage with normalized role
    localStorage.setItem('userRole', role);
    console.log('✅ User role synced:', role, '(backend:', backendRole + ')');

    return true;
  } catch (error) {
    console.error('Error syncing user role:', error);
    return false;
  }
}

/**
 * Check if user can access route based on role
 */
export function canAccessRoute(userRole: UserRole, routePath: string): boolean {
  if (!userRole) {
    return false;
  }

  if (routePath.startsWith('/employer')) {
    return userRole === 'employer';
  }

  if (routePath.startsWith('/va')) {
    return userRole === 'va';
  }

  // Public routes don't require role check
  return true;
}

/**
 * Calculate profile completion percentage for VA profiles
 */
export function calculateVACompletion(profile: any): number {
  const requiredFields = [
    profile.name,
    profile.bio,
    profile.country,
    profile.hourlyRate,
    profile.skills && profile.skills.length > 0,
    profile.availability !== undefined,
  ];

  const optionalFields = [
    profile.email,
    profile.phone,
    profile.timezone,
    profile.languages && profile.languages.length > 0,
    profile.portfolioItems && profile.portfolioItems.length > 0,
    profile.workExperience && profile.workExperience.length > 0,
    profile.education && profile.education.length > 0,
    profile.skillsAssessments && profile.skillsAssessments.length > 0,
  ];

  const requiredCompleted = requiredFields.filter(Boolean).length;
  const optionalCompleted = optionalFields.filter(Boolean).length;

  // Calculate weighted completion (required fields count for 70%, optional for 30%)
  const requiredScore = (requiredCompleted / requiredFields.length) * 70;
  const optionalScore = (optionalCompleted / optionalFields.length) * 30;

  return Math.round(requiredScore + optionalScore);
}

/**
 * Calculate profile completion percentage for Company profiles
 */
export function calculateCompanyCompletion(profile: any): number {
  const requiredFields = [
    profile.name,
    profile.bio,
    profile.country,
    profile.industry,
  ];

  const optionalFields = [
    profile.website,
    profile.companySize,
    profile.foundedYear,
    profile.description,
    profile.mission,
    profile.values && profile.values.length > 0,
    profile.benefits && profile.benefits.length > 0,
    profile.email,
    profile.phone,
    profile.logoUrl,
    profile.socialLinks,
    profile.techStack && profile.techStack.length > 0,
  ];

  const requiredCompleted = requiredFields.filter(Boolean).length;
  const optionalCompleted = optionalFields.filter(Boolean).length;

  // Calculate weighted completion (required fields count for 70%, optional for 30%)
  const requiredScore = (requiredCompleted / requiredFields.length) * 70;
  const optionalScore = (optionalCompleted / optionalFields.length) * 30;

  return Math.round(requiredScore + optionalScore);
}

/**
 * Get completion status label and color
 */
export function getCompletionStatus(percentage: number): {
  label: string;
  color: string;
  level: 'incomplete' | 'basic' | 'good' | 'excellent'
} {
  if (percentage < 40) {
    return {
      label: 'Incomplete',
      color: 'text-red-500',
      level: 'incomplete'
    };
  } else if (percentage < 70) {
    return {
      label: 'Basic',
      color: 'text-yellow-500',
      level: 'basic'
    };
  } else if (percentage < 90) {
    return {
      label: 'Good',
      color: 'text-blue-500',
      level: 'good'
    };
  } else {
    return {
      label: 'Excellent',
      color: 'text-green-500',
      level: 'excellent'
    };
  }
}

/**
 * Initialize role on app startup by fetching from backend
 * This should be called in App or AuthContext initialization
 */
export async function initializeRole(): Promise<UserRole> {
  console.log('🔍 Initializing role from backend...');

  // First check localStorage
  const storedRole = localStorage.getItem('userRole');
  if (storedRole) {
    console.log('✅ Found role in localStorage:', storedRole);
    return storedRole as UserRole;
  }

  // If not in localStorage, fetch from backend
  const role = await fetchUserRole();
  if (role) {
    localStorage.setItem('userRole', role);
  }

  return role;
}

/**
 * Clear all role-related data from localStorage
 * Use when signing out
 */
export function clearRoleData(): void {
  localStorage.removeItem('userRole');
  localStorage.removeItem('authUser');
  console.log('🗑️ Role data cleared from localStorage');
}
