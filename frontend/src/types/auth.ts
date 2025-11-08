export interface User {
  uid: string;
  email: string;
  role: 'va' | 'company';
  displayName?: string;
}

export interface AuthUser {
  uid: string;
  email: string;
  role?: 'va' | 'company';
  displayName?: string;
}

export interface ExtendedUser extends User {
  role: 'va' | 'company';
}