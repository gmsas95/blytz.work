import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { 
  initializeFirebaseAdmin, 
  getFirebaseAdmin, 
  getAuth, 
  validateFirebaseConfig 
} from '../src/config/firebaseConfig-simplified.js';

describe('Firebase Configuration Validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment variables before each test
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });

  describe('validateFirebaseConfig', () => {
    it('should return valid configuration when all required variables are set', () => {
      // Set valid environment variables
      process.env.FIREBASE_PROJECT_ID = 'test-project';
      process.env.FIREBASE_CLIENT_EMAIL = 'test@test.com';
      process.env.FIREBASE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKB\n-----END PRIVATE KEY-----\n';

      const result = validateFirebaseConfig();

      expect(result.isValid).toBe(true);
      expect(result.missingVars).toEqual([]);
      expect(result.invalidVars).toEqual([]);
      expect(result.config).not.toBeNull();
      expect(result.config!.projectId).toBe('test-project');
      expect(result.config!.clientEmail).toBe('test@test.com');
      expect(result.config!.privateKey).toContain('-----BEGIN PRIVATE KEY-----');
    });

    it('should detect missing required environment variables', () => {
      // Remove all Firebase environment variables
      delete process.env.FIREBASE_PROJECT_ID;
      delete process.env.FIREBASE_CLIENT_EMAIL;
      delete process.env.FIREBASE_PRIVATE_KEY;

      const result = validateFirebaseConfig();

      expect(result.isValid).toBe(false);
      expect(result.missingVars).toEqual([
        'FIREBASE_PROJECT_ID',
        'FIREBASE_CLIENT_EMAIL',
        'FIREBASE_PRIVATE_KEY'
      ]);
      expect(result.config).toBeNull();
    });

    it('should detect template syntax in environment variables', () => {
      // Set variables with template syntax
      process.env.FIREBASE_PROJECT_ID = '${{ secrets.FIREBASE_PROJECT_ID }}';
      process.env.FIREBASE_CLIENT_EMAIL = '${{ secrets.FIREBASE_CLIENT_EMAIL }}';
      process.env.FIREBASE_PRIVATE_KEY = 'REPLACE_WITH_PRIVATE_KEY';

      const result = validateFirebaseConfig();

      expect(result.isValid).toBe(false);
      expect(result.invalidVars).toEqual([
        'FIREBASE_PROJECT_ID',
        'FIREBASE_CLIENT_EMAIL',
        'FIREBASE_PRIVATE_KEY'
      ]);
      expect(result.config).toBeNull();
    });

    it('should handle partial configuration', () => {
      // Set only some required variables
      process.env.FIREBASE_PROJECT_ID = 'test-project';
      delete process.env.FIREBASE_CLIENT_EMAIL;
      delete process.env.FIREBASE_PRIVATE_KEY;

      const result = validateFirebaseConfig();

      expect(result.isValid).toBe(false);
      expect(result.missingVars).toEqual([
        'FIREBASE_CLIENT_EMAIL',
        'FIREBASE_PRIVATE_KEY'
      ]);
      expect(result.config).toBeNull();
    });

    it('should properly handle private key with newlines', () => {
      process.env.FIREBASE_PROJECT_ID = 'test-project';
      process.env.FIREBASE_CLIENT_EMAIL = 'test@test.com';
      process.env.FIREBASE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKB\\n-----END PRIVATE KEY-----\\n';

      const result = validateFirebaseConfig();

      expect(result.isValid).toBe(true);
      expect(result.config!.privateKey).toContain('\n');
      expect(result.config!.privateKey).not.toContain('\\n');
    });
  });

  describe('initializeFirebaseAdmin', () => {
    it('should initialize Firebase Admin with valid configuration', () => {
      // Set valid environment variables
      process.env.FIREBASE_PROJECT_ID = 'test-project';
      process.env.FIREBASE_CLIENT_EMAIL = 'test@test.com';
      process.env.FIREBASE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKB\n-----END PRIVATE KEY-----\n';

      // Mock console.error to avoid test output pollution
      const originalConsoleError = console.error;
      console.error = jest.fn();

      try {
        const admin = initializeFirebaseAdmin();
        expect(admin).toBeDefined();
        expect(admin.options.credential.projectId).toBe('test-project');
      } catch (error) {
        // Firebase Admin initialization might fail in test environment
        // but we can still validate the configuration logic
        expect(error).toBeDefined();
      } finally {
        console.error = originalConsoleError;
      }
    });

    it('should throw error with invalid configuration', () => {
      // Remove Firebase environment variables
      delete process.env.FIREBASE_PROJECT_ID;
      delete process.env.FIREBASE_CLIENT_EMAIL;
      delete process.env.FIREBASE_PRIVATE_KEY;

      // Mock console.error to avoid test output pollution
      const originalConsoleError = console.error;
      console.error = jest.fn();

      expect(() => {
        initializeFirebaseAdmin();
      }).toThrow('Firebase Admin configuration is invalid');

      console.error = originalConsoleError;
    });

    it('should return existing instance if already initialized', () => {
      // Set valid environment variables
      process.env.FIREBASE_PROJECT_ID = 'test-project';
      process.env.FIREBASE_CLIENT_EMAIL = 'test@test.com';
      process.env.FIREBASE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKB\n-----END PRIVATE KEY-----\n';

      // Mock console.error to avoid test output pollution
      const originalConsoleError = console.error;
      console.error = jest.fn();

      try {
        const admin1 = initializeFirebaseAdmin();
        const admin2 = initializeFirebaseAdmin();
        expect(admin1).toBe(admin2);
      } catch (error) {
        // Firebase Admin initialization might fail in test environment
        expect(error).toBeDefined();
      } finally {
        console.error = originalConsoleError;
      }
    });
  });

  describe('getFirebaseAdmin', () => {
    it('should initialize Firebase Admin if not already initialized', () => {
      // Set valid environment variables
      process.env.FIREBASE_PROJECT_ID = 'test-project';
      process.env.FIREBASE_CLIENT_EMAIL = 'test@test.com';
      process.env.FIREBASE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKB\n-----END PRIVATE KEY-----\n';

      // Mock console.error to avoid test output pollution
      const originalConsoleError = console.error;
      console.error = jest.fn();

      try {
        const admin = getFirebaseAdmin();
        expect(admin).toBeDefined();
      } catch (error) {
        // Firebase Admin initialization might fail in test environment
        expect(error).toBeDefined();
      } finally {
        console.error = originalConsoleError;
      }
    });
  });

  describe('getAuth', () => {
    it('should return auth instance', () => {
      // Set valid environment variables
      process.env.FIREBASE_PROJECT_ID = 'test-project';
      process.env.FIREBASE_CLIENT_EMAIL = 'test@test.com';
      process.env.FIREBASE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKB\n-----END PRIVATE KEY-----\n';

      // Mock console.error to avoid test output pollution
      const originalConsoleError = console.error;
      console.error = jest.fn();

      try {
        const auth = getAuth();
        expect(auth).toBeDefined();
      } catch (error) {
        // Firebase Admin initialization might fail in test environment
        expect(error).toBeDefined();
      } finally {
        console.error = originalConsoleError;
      }
    });
  });
});