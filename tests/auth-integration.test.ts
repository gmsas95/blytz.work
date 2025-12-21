import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import { app } from '../backend/src/server.js';
import { prisma } from '../backend/tests/setup.js';

// Mock Firebase Admin for integration testing
jest.mock('firebase-admin', () => ({
  auth: jest.fn(() => ({
    verifyIdToken: jest.fn(),
    getUserByEmail: jest.fn(),
    generatePasswordResetLink: jest.fn(),
    createCustomToken: jest.fn(),
  })),
}));

// Mock Firebase Client for integration testing
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn(),
    currentUser: null,
  })),
  initializeApp: jest.fn(),
}));

describe('Frontend-Backend Authentication Integration', () => {
  let testUser: any;
  let mockFirebaseAuth: any;
  let authToken: string = 'mock-firebase-token';

  beforeAll(async () => {
    // Create test user in database
    testUser = await prisma.user.create({
      data: {
        email: 'integration@test.com',
        role: 'va',
        profileComplete: false,
      },
    });

    // Mock Firebase Auth
    const { getAuth } = require('../backend/src/config/firebaseConfig-simplified.js');
    mockFirebaseAuth = getAuth();
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.user.deleteMany({
      where: { email: { contains: 'integration@test.com' } }
    });
  });

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('End-to-End Authentication Flow', () => {
    it('should handle complete authentication flow from frontend to backend', async () => {
      // Step 1: Mock successful Firebase authentication on frontend
      const mockFirebaseUser = {
        uid: testUser.id,
        email: testUser.email,
        displayName: 'Integration Test User',
        getIdToken: jest.fn().mockResolvedValue(authToken),
      };

      // Step 2: Mock backend token verification
      mockFirebaseAuth.verifyIdToken.mockResolvedValue({
        uid: testUser.id,
        email: testUser.email,
      });

      // Step 3: Test authenticated API request
      const response = await request(app.server)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('email', testUser.email);
      expect(response.body.data).toHaveProperty('role', 'va');

      // Verify backend token verification was called
      expect(mockFirebaseAuth.verifyIdToken).toHaveBeenCalledWith(authToken);
    });

    it('should handle user registration and profile creation flow', async () => {
      const newUserId = 'integration-new-user';
      const newUserEmail = 'newintegration@test.com';
      const newUserToken = 'new-user-token';

      // Step 1: Mock Firebase user creation
      mockFirebaseAuth.verifyIdToken.mockResolvedValue({
        uid: newUserId,
        email: newUserEmail,
      });

      // Step 2: Sync user to database
      const syncResponse = await request(app.server)
        .post('/api/auth/sync')
        .set('Authorization', `Bearer ${newUserToken}`)
        .send({
          uid: newUserId,
          email: newUserEmail,
        })
        .expect(200);

      expect(syncResponse.body).toHaveProperty('success', true);
      expect(syncResponse.body.data).toHaveProperty('email', newUserEmail);

      // Step 3: Update user profile
      const updateResponse = await request(app.server)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${newUserToken}`)
        .send({
          role: 'company',
          profileComplete: true,
        })
        .expect(200);

      expect(updateResponse.body).toHaveProperty('success', true);
      expect(updateResponse.body.data).toHaveProperty('role', 'company');
      expect(updateResponse.body.data).toHaveProperty('profileComplete', true);

      // Clean up
      await prisma.user.delete({ where: { id: newUserId } });
    });

    it('should handle password reset flow', async () => {
      const resetEmail = 'integration@test.com';
      const resetLink = 'https://auth.firebaseapp.com/reset?token=reset-token';

      // Step 1: Mock Firebase user lookup
      mockFirebaseAuth.getUserByEmail.mockResolvedValue({
        uid: testUser.id,
        email: resetEmail,
      });

      // Step 2: Mock password reset link generation
      mockFirebaseAuth.generatePasswordResetLink.mockResolvedValue(resetLink);

      // Step 3: Request password reset
      const response = await request(app.server)
        .post('/api/auth/forgot-password')
        .send({ email: resetEmail })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('debug_link', resetLink);

      // Verify Firebase methods were called
      expect(mockFirebaseAuth.getUserByEmail).toHaveBeenCalledWith(resetEmail);
      expect(mockFirebaseAuth.generatePasswordResetLink).toHaveBeenCalledWith(resetEmail);
    });
  });

  describe('Token Management Integration', () => {
    it('should handle custom token generation for client', async () => {
      const customToken = 'custom-firebase-token-123';

      // Mock token verification
      mockFirebaseAuth.verifyIdToken.mockResolvedValue({
        uid: testUser.id,
        email: testUser.email,
      });

      // Mock custom token generation
      mockFirebaseAuth.createCustomToken.mockResolvedValue(customToken);

      // Request custom token
      const response = await request(app.server)
        .post('/api/auth/token')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('token', customToken);
      expect(response.body.data).toHaveProperty('expiresIn', '1h');

      // Verify Firebase methods were called
      expect(mockFirebaseAuth.verifyIdToken).toHaveBeenCalledWith(authToken);
      expect(mockFirebaseAuth.createCustomToken).toHaveBeenCalledWith(testUser.id);
    });

    it('should handle token refresh scenario', async () => {
      const originalToken = 'original-token';
      const refreshedToken = 'refreshed-token';

      // Mock initial token verification
      mockFirebaseAuth.verifyIdToken.mockResolvedValueOnce({
        uid: testUser.id,
        email: testUser.email,
      });

      // Make initial request
      await request(app.server)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${originalToken}`)
        .expect(200);

      // Mock token refresh (new token verification)
      mockFirebaseAuth.verifyIdToken.mockResolvedValueOnce({
        uid: testUser.id,
        email: testUser.email,
      });

      // Make request with refreshed token
      const response = await request(app.server)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${refreshedToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('email', testUser.email);

      // Verify both tokens were verified
      expect(mockFirebaseAuth.verifyIdToken).toHaveBeenCalledWith(originalToken);
      expect(mockFirebaseAuth.verifyIdToken).toHaveBeenCalledWith(refreshedToken);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle invalid token from frontend', async () => {
      const invalidToken = 'invalid-token';

      // Mock token verification failure
      mockFirebaseAuth.verifyIdToken.mockRejectedValue(new Error('Invalid token'));

      const response = await request(app.server)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid or expired token');
      expect(response.body).toHaveProperty('code', 'INVALID_TOKEN');
    });

    it('should handle expired token scenario', async () => {
      const expiredToken = 'expired-token';

      // Mock expired token error
      mockFirebaseAuth.verifyIdToken.mockRejectedValue({
        code: 'auth/id-token-expired',
        message: 'Firebase ID token has expired',
      });

      const response = await request(app.server)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid or expired token');
      expect(response.body).toHaveProperty('code', 'INVALID_TOKEN');
    });

    it('should handle network errors between frontend and backend', async () => {
      // Mock network error
      mockFirebaseAuth.verifyIdToken.mockRejectedValue(new Error('Network error'));

      const response = await request(app.server)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid or expired token');
    });
  });

  describe('Cross-Origin Authentication', () => {
    it('should handle CORS preflight requests', async () => {
      const response = await request(app.server)
        .options('/api/auth/profile')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET')
        .set('Access-Control-Request-Headers', 'authorization')
        .expect(204);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
      expect(response.headers).toHaveProperty('access-control-allow-methods');
      expect(response.headers).toHaveProperty('access-control-allow-headers');
    });

    it('should handle authenticated requests from allowed origins', async () => {
      // Mock successful token verification
      mockFirebaseAuth.verifyIdToken.mockResolvedValue({
        uid: testUser.id,
        email: testUser.email,
      });

      const response = await request(app.server)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Origin', 'http://localhost:3000')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });

  describe('Concurrent Authentication Requests', () => {
    it('should handle multiple simultaneous auth requests', async () => {
      // Mock successful token verification
      mockFirebaseAuth.verifyIdToken.mockResolvedValue({
        uid: testUser.id,
        email: testUser.email,
      });

      // Make multiple simultaneous requests
      const requests = Array.from({ length: 5 }, () =>
        request(app.server)
          .get('/api/auth/profile')
          .set('Authorization', `Bearer ${authToken}`)
      );

      const responses = await Promise.all(requests);

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data).toHaveProperty('email', testUser.email);
      });

      // Verify token verification was called for each request
      expect(mockFirebaseAuth.verifyIdToken).toHaveBeenCalledTimes(5);
    });
  });

  describe('Authentication State Consistency', () => {
    it('should maintain consistent user state across multiple requests', async () => {
      // Mock successful token verification
      mockFirebaseAuth.verifyIdToken.mockResolvedValue({
        uid: testUser.id,
        email: testUser.email,
      });

      // First request - get profile
      const profileResponse = await request(app.server)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(profileResponse.body.data).toHaveProperty('email', testUser.email);
      expect(profileResponse.body.data).toHaveProperty('role', 'va');

      // Second request - update profile
      const updateResponse = await request(app.server)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ role: 'company' })
        .expect(200);

      expect(updateResponse.body.data).toHaveProperty('role', 'company');

      // Third request - verify updated profile
      const verifyResponse = await request(app.server)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(verifyResponse.body.data).toHaveProperty('role', 'company');

      // Verify consistent user identification
      expect(profileResponse.body.data.id).toBe(verifyResponse.body.data.id);
    });
  });
});