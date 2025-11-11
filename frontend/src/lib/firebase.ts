// Mock Firebase for Development
export const authService = {
  // Mock sign in functions
  async signInWithGoogle(): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          uid: 'dev-user-google',
          email: 'google-user@example.com',
          role: 'company',
          profileComplete: false,
          displayName: 'Google User',
          getIdTokenResult: async () => ({ token: 'mock-token' }),
          getIdToken: async () => 'mock-token'
        });
      }, 1000);
    });
  },

  async signInWithEmailAndPassword(email: string, password: string): Promise<any> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password) {
          resolve({
            uid: 'dev-user-email',
            email: email,
            role: 'company',
            profileComplete: false,
            displayName: email.split('@')[0],
            getIdTokenResult: async () => ({ token: 'mock-token' }),
            getIdToken: async () => 'mock-token'
          });
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  },

  async createUserWithEmailAndPassword(email: string, password: string, role: string): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          uid: 'dev-user-new',
          email: email,
          role: role,
          profileComplete: false,
          displayName: email.split('@')[0],
          getIdTokenResult: async () => ({ token: 'mock-token' }),
          getIdToken: async () => 'mock-token'
        });
      }, 1000);
    });
  },

  async sendEmailVerification(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, 500);
    });
  },

  async sendPasswordReset(email: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, 500);
    });
  },

  async signOut(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, 500);
    });
  },

  async getCurrentUser(): Promise<any> {
    return Promise.resolve(null);
  },

  onAuthStateChanged(callback: (user: any) => void): () => void {
    // Immediately call with null user
    callback(null);
    return () => {}; // Return unsubscribe function
  }
};

// Mock React Hook
export function useAuth() {
  return {
    user: null,
    loading: false,
    error: null,
    signInWithGoogle: authService.signInWithGoogle,
    signInWithEmailAndPassword: authService.signInWithEmailAndPassword,
    createUserWithEmailAndPassword: authService.createUserWithEmailAndPassword,
    sendEmailVerification: authService.sendEmailVerification,
    sendPasswordReset: authService.sendPasswordReset,
    signOut: authService.signOut
  };
}

// Mock Firebase functions that are being imported
export const getAuth = () => ({
  onAuthStateChanged: authService.onAuthStateChanged
});

export const signOut = authService.signOut;
export const onAuthStateChanged = authService.onAuthStateChanged;



export const auth = authService;
