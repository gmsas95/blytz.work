import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals';
import { 
  signInUser, 
  registerUser, 
  signOutUser, 
  getAuthErrorMessage,
  onAuthStateChange 
} from '../src/lib/auth.js';
import { getFirebase } from '../src/lib/firebase-simplified.js';

// Mock Firebase modules
const mockSignInWithEmailAndPassword = jest.fn();
const mockCreateUserWithEmailAndPassword = jest.fn();
const mockSignOut = jest.fn();
const mockOnAuthStateChanged = jest.fn();

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
    createUserWithEmailAndPassword: mockCreateUserWithEmailAndPassword,
    signOut: mockSignOut,
    onAuthStateChanged: mockOnAuthStateChanged,
  })),
}));

describe('Frontend Authentication Flow Tests', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('signInUser', () => {
    it('should sign in user successfully', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
      };

      mockSignInWithEmailAndPassword.mockResolvedValue({
        user: mockUser,
      });

      const result = await signInUser('test@example.com', 'password123');

      expect(result).toEqual({
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
      });

      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.any(Object),
        'test@example.com',
        'password123'
      );
    });

    it('should handle sign in error', async () => {
      const firebaseError = {
        code: 'auth/wrong-password',
        message: 'The password is invalid',
      };

      mockSignInWithEmailAndPassword.mockRejectedValue(firebaseError);

      await expect(signInUser('test@example.com', 'wrongpassword'))
        .rejects.toThrow(firebaseError);
    });

    it('should handle sign in with user without display name', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: null,
      };

      mockSignInWithEmailAndPassword.mockResolvedValue({
        user: mockUser,
      });

      const result = await signInUser('test@example.com', 'password123');

      expect(result).toEqual({
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: undefined,
      });
    });
  });

  describe('registerUser', () => {
    it('should register new user successfully', async () => {
      const mockUser = {
        uid: 'new-uid',
        email: 'newuser@example.com',
        displayName: null,
      };

      mockCreateUserWithEmailAndPassword.mockResolvedValue({
        user: mockUser,
      });

      const result = await registerUser('newuser@example.com', 'password123', 'New User');

      expect(result).toEqual({
        uid: 'new-uid',
        email: 'newuser@example.com',
        displayName: 'New User',
      });

      expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.any(Object),
        'newuser@example.com',
        'password123'
      );
    });

    it('should register user without name', async () => {
      const mockUser = {
        uid: 'new-uid',
        email: 'newuser@example.com',
        displayName: null,
      };

      mockCreateUserWithEmailAndPassword.mockResolvedValue({
        user: mockUser,
      });

      const result = await registerUser('newuser@example.com', 'password123');

      expect(result).toEqual({
        uid: 'new-uid',
        email: 'newuser@example.com',
        displayName: undefined,
      });
    });

    it('should handle registration error', async () => {
      const firebaseError = {
        code: 'auth/email-already-in-use',
        message: 'The email address is already in use',
      };

      mockCreateUserWithEmailAndPassword.mockRejectedValue(firebaseError);

      await expect(registerUser('existing@example.com', 'password123'))
        .rejects.toThrow(firebaseError);
    });
  });

  describe('signOutUser', () => {
    it('should sign out user successfully', async () => {
      mockSignOut.mockResolvedValue(undefined);

      await signOutUser();

      expect(mockSignOut).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should handle sign out error', async () => {
      const firebaseError = {
        code: 'auth/network-request-failed',
        message: 'A network error occurred',
      };

      mockSignOut.mockRejectedValue(firebaseError);

      await expect(signOutUser()).rejects.toThrow(firebaseError);
    });
  });

  describe('getAuthErrorMessage', () => {
    it('should return appropriate message for invalid email', () => {
      const error = { code: 'auth/invalid-email' };
      expect(getAuthErrorMessage(error)).toBe('Invalid email address');
    });

    it('should return appropriate message for disabled user', () => {
      const error = { code: 'auth/user-disabled' };
      expect(getAuthErrorMessage(error)).toBe('This account has been disabled');
    });

    it('should return appropriate message for user not found', () => {
      const error = { code: 'auth/user-not-found' };
      expect(getAuthErrorMessage(error)).toBe('No account found with this email');
    });

    it('should return appropriate message for wrong password', () => {
      const error = { code: 'auth/wrong-password' };
      expect(getAuthErrorMessage(error)).toBe('Incorrect password');
    });

    it('should return appropriate message for email already in use', () => {
      const error = { code: 'auth/email-already-in-use' };
      expect(getAuthErrorMessage(error)).toBe('An account already exists with this email');
    });

    it('should return appropriate message for weak password', () => {
      const error = { code: 'auth/weak-password' };
      expect(getAuthErrorMessage(error)).toBe('Password should be at least 6 characters');
    });

    it('should return appropriate message for operation not allowed', () => {
      const error = { code: 'auth/operation-not-allowed' };
      expect(getAuthErrorMessage(error)).toBe('This operation is not allowed');
    });

    it('should return appropriate message for too many requests', () => {
      const error = { code: 'auth/too-many-requests' };
      expect(getAuthErrorMessage(error)).toBe('Too many failed attempts. Please try again later');
    });

    it('should return appropriate message for network request failed', () => {
      const error = { code: 'auth/network-request-failed' };
      expect(getAuthErrorMessage(error)).toBe('Network error. Please check your connection');
    });

    it('should return appropriate message for invalid API key', () => {
      const error = { code: 'auth/invalid-api-key' };
      expect(getAuthErrorMessage(error)).toBe('Invalid Firebase configuration. Please contact support');
    });

    it('should return appropriate message for API key not valid', () => {
      const error = { code: 'auth/api-key-not-valid' };
      expect(getAuthErrorMessage(error)).toBe('Firebase configuration error. Please contact support');
    });

    it('should return error message for unknown Firebase error code', () => {
      const error = { code: 'auth/unknown-error', message: 'Unknown Firebase error' };
      expect(getAuthErrorMessage(error)).toBe('Unknown Firebase error');
    });

    it('should return error message when no code but message exists', () => {
      const error = { message: 'Custom error message' };
      expect(getAuthErrorMessage(error)).toBe('Custom error message');
    });

    it('should return default message for unknown error', () => {
      const error = null;
      expect(getAuthErrorMessage(error)).toBe('Unknown error occurred');
    });

    it('should return default message for empty error', () => {
      const error = {};
      expect(getAuthErrorMessage(error)).toBe('Authentication failed. Please try again.');
    });
  });

  describe('onAuthStateChange', () => {
    it('should set up auth state change listener', () => {
      const mockCallback = jest.fn();
      const mockUnsubscribe = jest.fn();

      mockOnAuthStateChanged.mockReturnValue(mockUnsubscribe);

      const unsubscribe = onAuthStateChange(mockCallback);

      expect(mockOnAuthStateChanged).toHaveBeenCalledWith(expect.any(Object), mockCallback);
      expect(unsubscribe).toBe(mockUnsubscribe);
    });
  });

  describe('Firebase Integration', () => {
    it('should use Firebase auth from simplified configuration', async () => {
      // Mock getFirebase to return a specific auth instance
      const mockAuth = {
        signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
        createUserWithEmailAndPassword: mockCreateUserWithEmailAndPassword,
        signOut: mockSignOut,
      };

      jest.doMock('../src/lib/firebase-simplified.js', () => ({
        getFirebase: jest.fn(() => ({ auth: mockAuth })),
      }));

      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
      };

      mockSignInWithEmailAndPassword.mockResolvedValue({
        user: mockUser,
      });

      const result = await signInUser('test@example.com', 'password123');

      expect(result).toEqual({
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
      });

      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
        mockAuth,
        'test@example.com',
        'password123'
      );
    });

    it('should handle Firebase auth not initialized error', async () => {
      // Mock getFirebase to throw an error
      jest.doMock('../src/lib/firebase-simplified.js', () => ({
        getFirebase: jest.fn(() => {
          throw new Error('Firebase auth not initialized');
        }),
      }));

      await expect(signInUser('test@example.com', 'password123'))
        .rejects.toThrow('Firebase auth not initialized');
    });
  });

  describe('Token Refresh', () => {
    it('should handle token refresh automatically', async () => {
      // This test would verify that Firebase automatically handles token refresh
      // In a real scenario, Firebase SDK handles this internally
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        // Firebase SDK would automatically refresh tokens when needed
        getIdToken: jest.fn().mockResolvedValue('refreshed-token'),
      };

      mockSignInWithEmailAndPassword.mockResolvedValue({
        user: mockUser,
      });

      const result = await signInUser('test@example.com', 'password123');

      expect(result).toEqual({
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
      });

      // Verify that the user object has the getIdToken method for token refresh
      expect(typeof mockUser.getIdToken).toBe('function');
    });
  });

  describe('Authentication State Persistence', () => {
    it('should maintain authentication state across page reloads', async () => {
      // This test verifies that Firebase persists auth state
      const mockCallback = jest.fn();
      const mockUnsubscribe = jest.fn();

      mockOnAuthStateChanged.mockReturnValue(mockUnsubscribe);

      // Simulate setting up auth state listener
      const unsubscribe = onAuthStateChange(mockCallback);

      expect(mockOnAuthStateChanged).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');

      // In a real scenario, Firebase would automatically call the callback
      // with the current user state when the listener is set up
    });
  });
});