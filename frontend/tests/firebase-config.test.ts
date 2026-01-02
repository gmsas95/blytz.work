import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals';
import { 
  initializeFirebase, 
  getFirebase, 
  app, 
  auth, 
  onAuthStateChange, 
  validateFirebaseConfig 
} from '../src/lib/firebase-simplified.js';

// Mock Firebase modules
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({ name: 'test-app', options: {} })),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: null,
    onAuthStateChanged: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signInWithPopup: jest.fn(),
    signOut: jest.fn(),
  })),
}));

describe('Firebase Configuration Validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment variables before each test
    process.env = { ...originalEnv };
    // Reset module mocks
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });

  describe('validateFirebaseConfig', () => {
    it('should return valid configuration when all required variables are set', () => {
      // Set valid environment variables
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key';
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test.firebaseapp.com';
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project';
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'test.appspot.com';
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = '123456789';
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID = 'test-app-id';

      const result = validateFirebaseConfig();

      expect(result.isValid).toBe(true);
      expect(result.missingVars).toEqual([]);
      expect(result.invalidVars).toEqual([]);
      expect(result.config).not.toBeNull();
      expect(result.config!.apikey).toBe('test-api-key');
      expect(result.config!.authdomain).toBe('test.firebaseapp.com');
      expect(result.config!.projectid).toBe('test-project');
      expect(result.config!.storagebucket).toBe('test.appspot.com');
      expect(result.config!.messagingsenderid).toBe('123456789');
      expect(result.config!.appid).toBe('test-app-id');
    });

    it('should detect missing required environment variables', () => {
      // Remove all Firebase environment variables
      delete process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
      delete process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
      delete process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

      const result = validateFirebaseConfig();

      expect(result.isValid).toBe(false);
      expect(result.missingVars).toEqual([
        'NEXT_PUBLIC_FIREBASE_API_KEY',
        'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
        'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
      ]);
      expect(result.config).toBeNull();
    });

    it('should detect template syntax in environment variables', () => {
      // Set variables with template syntax
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY = '${{ secrets.FIREBASE_API_KEY }}';
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = '${{ secrets.FIREBASE_AUTH_DOMAIN }}';
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'REPLACE_WITH_PROJECT_ID';

      const result = validateFirebaseConfig();

      expect(result.isValid).toBe(false);
      expect(result.invalidVars).toEqual([
        'NEXT_PUBLIC_FIREBASE_API_KEY',
        'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
        'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
      ]);
      expect(result.config).toBeNull();
    });

    it('should handle partial configuration with optional variables', () => {
      // Set only required variables
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key';
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test.firebaseapp.com';
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project';
      // Optional variables not set

      const result = validateFirebaseConfig();

      expect(result.isValid).toBe(true);
      expect(result.missingVars).toEqual([]);
      expect(result.invalidVars).toEqual([]);
      expect(result.config).not.toBeNull();
      expect(result.config!.apikey).toBe('test-api-key');
      expect(result.config!.authdomain).toBe('test.firebaseapp.com');
      expect(result.config!.projectid).toBe('test-project');
      expect(result.config!.storagebucket).toBeUndefined();
      expect(result.config!.messagingsenderid).toBeUndefined();
      expect(result.config!.appid).toBeUndefined();
    });

    it('should ignore optional variables with template syntax', () => {
      // Set required variables
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key';
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test.firebaseapp.com';
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project';
      // Set optional variables with template syntax
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = '${{ secrets.FIREBASE_STORAGE_BUCKET }}';
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 'REPLACE_WITH_SENDER_ID';

      const result = validateFirebaseConfig();

      expect(result.isValid).toBe(true);
      expect(result.missingVars).toEqual([]);
      expect(result.invalidVars).toEqual([]);
      expect(result.config).not.toBeNull();
      expect(result.config!.storagebucket).toBeUndefined();
      expect(result.config!.messagingsenderid).toBeUndefined();
    });
  });

  describe('initializeFirebase', () => {
    it('should initialize Firebase with valid configuration', () => {
      // Set valid environment variables
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key';
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test.firebaseapp.com';
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project';

      // Mock console.error to avoid test output pollution
      const originalConsoleError = console.error;
      console.error = jest.fn();

      const { app: firebaseApp, auth: firebaseAuth } = initializeFirebase();

      expect(firebaseApp).toBeDefined();
      expect(firebaseAuth).toBeDefined();
      expect(console.error).not.toHaveBeenCalled();

      console.error = originalConsoleError;
    });

    it('should create mock Firebase with invalid configuration', () => {
      // Remove Firebase environment variables
      delete process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
      delete process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
      delete process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

      // Mock console.error to avoid test output pollution
      const originalConsoleError = console.error;
      console.error = jest.fn();

      const { app: firebaseApp, auth: firebaseAuth } = initializeFirebase();

      expect(firebaseApp).toBeDefined();
      expect(firebaseAuth).toBeDefined();
      expect(firebaseApp.name).toBe('[MOCK]');
      expect(console.error).toHaveBeenCalled();

      console.error = originalConsoleError;
    });

    it('should return existing instance if already initialized', () => {
      // Set valid environment variables
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key';
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test.firebaseapp.com';
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project';

      // Mock console.error to avoid test output pollution
      const originalConsoleError = console.error;
      console.error = jest.fn();

      const { app: app1, auth: auth1 } = initializeFirebase();
      const { app: app2, auth: auth2 } = initializeFirebase();

      expect(app1).toBe(app2);
      expect(auth1).toBe(auth2);

      console.error = originalConsoleError;
    });
  });

  describe('getFirebase', () => {
    it('should initialize Firebase if not already initialized', () => {
      // Set valid environment variables
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key';
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test.firebaseapp.com';
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project';

      // Mock console.error to avoid test output pollution
      const originalConsoleError = console.error;
      console.error = jest.fn();

      const { app: firebaseApp, auth: firebaseAuth } = getFirebase();

      expect(firebaseApp).toBeDefined();
      expect(firebaseAuth).toBeDefined();

      console.error = originalConsoleError;
    });
  });

  describe('app and auth exports', () => {
    it('should export app instance', () => {
      // Set valid environment variables
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key';
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test.firebaseapp.com';
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project';

      // Mock console.error to avoid test output pollution
      const originalConsoleError = console.error;
      console.error = jest.fn();

      expect(app).toBeDefined();

      console.error = originalConsoleError;
    });

    it('should export auth instance', () => {
      // Set valid environment variables
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key';
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test.firebaseapp.com';
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project';

      // Mock console.error to avoid test output pollution
      const originalConsoleError = console.error;
      console.error = jest.fn();

      expect(auth).toBeDefined();

      console.error = originalConsoleError;
    });
  });

  describe('onAuthStateChange', () => {
    it('should set up auth state change listener', () => {
      // Set valid environment variables
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key';
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test.firebaseapp.com';
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project';

      // Mock console.error to avoid test output pollution
      const originalConsoleError = console.error;
      console.error = jest.fn();

      const mockCallback = jest.fn();
      const unsubscribe = onAuthStateChange(mockCallback);

      expect(unsubscribe).toBeDefined();
      expect(typeof unsubscribe).toBe('function');

      console.error = originalConsoleError;
    });

    it('should handle auth not initialized', () => {
      // Remove Firebase environment variables
      delete process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
      delete process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
      delete process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

      // Mock console.error and console.warn to avoid test output pollution
      const originalConsoleError = console.error;
      const originalConsoleWarn = console.warn;
      console.error = jest.fn();
      console.warn = jest.fn();

      const mockCallback = jest.fn();
      const unsubscribe = onAuthStateChange(mockCallback);

      expect(unsubscribe).toBeUndefined();
      expect(console.warn).toHaveBeenCalledWith('Firebase auth not initialized, cannot set up auth state change listener');

      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    });
  });
});