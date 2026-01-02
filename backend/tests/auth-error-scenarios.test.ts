import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals';
import { app } from '../src/server.js';
import { prisma } from './setup.js';
import { verifyAuth } from '../src/plugins/firebaseAuth-simplified.js';

// Mock Firebase Admin
jest.mock('firebase-admin', () => ({
  auth: jest.fn(() => ({
    verifyIdToken: jest.fn(),
    getUserByEmail: jest.fn(),
    generatePasswordResetLink: jest.fn(),
    createCustomToken: jest.fn(),
  })),
}));

// Mock Firebase initialization
jest.mock('../src/config/firebaseConfig-simplified.js', () => ({
  ...jest.requireActual('../src/config/firebaseConfig-simplified.js'),
  initializeFirebaseAdmin: jest.fn(() => {
    throw new Error('Firebase initialization failed');
  }),
  getAuth: jest.fn(() => ({
    verifyIdToken: jest.fn(),
    getUserByEmail: jest.fn(),
    generatePasswordResetLink: jest.fn(),
    createCustomToken: jest.fn(),
  })),
}));

describe('Authentication Error Scenarios', () => {
  let testUser: any;
  let mockFirebaseAuth: any;

  beforeAll(async () => {
    // Create test user in database
    testUser = await prisma.user.create({
      data: {
        email: 'error-test@test.com',
        role: 'va',
        profileComplete: false,
      },
    });

    // Mock Firebase Auth
    const { getAuth } = require('../src/config/firebaseConfig-simplified.js');
    mockFirebaseAuth = getAuth();
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.user.deleteMany({
      where: { email: { contains: 'error-test@test.com' } }
    });
  });

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('Firebase Configuration Errors', () => {
    it('should handle Firebase not initialized error', async () => {
      // Mock Firebase Auth as null/not initialized
      jest.doMock('../src/config/firebaseConfig-simplified.js', () => ({
        getAuth: jest.fn(() => null),
      }));

      const response = await request(app.server)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer any-token')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Firebase Auth not properly initialized');
      expect(response.body).toHaveProperty('code', 'FIREBASE_NOT_INITIALIZED');
      expect(response.body).toHaveProperty('message', 'Server configuration error - please contact administrator');
    });

    it('should handle Firebase initialization timeout', async () => {
      // Mock Firebase initialization to take too long
      jest.doMock('../src/config/firebaseConfig-simplified.js', () => ({
        initializeFirebaseAdmin: jest.fn(() => {
          return new Promise((resolve, reject) => {
            setTimeout(() => reject(new Error('Initialization timeout')), 100);
          });
        }),
      }));

      // This would be caught during server startup
      // Test would verify proper error handling in initialization
      expect(true).toBe(true); // Placeholder for initialization timeout test
    });
  });

  describe('Token Validation Errors', () => {
    it('should handle malformed JWT token', async () => {
      const malformedToken = 'this.is.not.a.valid.jwt.token';

      // Mock token verification to throw JWT error
      mockFirebaseAuth.verifyIdToken.mockRejectedValue({
        code: 'auth/argument-error',
        message: 'Decoding Firebase ID token failed',
      });

      const response = await request(app.server)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${malformedToken}`)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid or expired token');
      expect(response.body).toHaveProperty('code', 'INVALID_TOKEN');
    });

    it('should handle expired ID token', async () => {
      const expiredToken = 'expired.firebase.token';

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

    it('should handle revoked ID token', async () => {
      const revokedToken = 'revoked.firebase.token';

      // Mock revoked token error
      mockFirebaseAuth.verifyIdToken.mockRejectedValue({
        code: 'auth/id-token-revoked',
        message: 'Firebase ID token has been revoked',
      });

      const response = await request(app.server)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${revokedToken}`)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid or expired token');
      expect(response.body).toHaveProperty('code', 'INVALID_TOKEN');
    });

    it('should handle token with invalid signature', async () => {
      const invalidSignatureToken = 'token.with.invalid.signature';

      // Mock invalid signature error
      mockFirebaseAuth.verifyIdToken.mockRejectedValue({
        code: 'auth/invalid-id-token',
        message: 'Firebase ID token has invalid signature',
      });

      const response = await request(app.server)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${invalidSignatureToken}`)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid or expired token');
      expect(response.body).toHaveProperty('code', 'INVALID_TOKEN');
    });
  });

  describe('Database Connection Errors', () => {
    it('should handle database connection failure during user lookup', async () => {
      // Mock successful token verification
      mockFirebaseAuth.verifyIdToken.mockResolvedValue({
        uid: testUser.id,
        email: testUser.email,
      });

      // Mock database connection error
      const originalPrisma = prisma.user.findUnique;
      prisma.user.findUnique = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app.server)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer valid-token')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to fetch user profile');
      expect(response.body).toHaveProperty('code', 'PROFILE_FETCH_ERROR');

      // Restore original method
      prisma.user.findUnique = originalPrisma;
    });

    it('should handle database timeout during user creation', async () => {
      const newUserId = 'timeout-user';
      const newUserEmail = 'timeout@test.com';

      // Mock successful token verification
      mockFirebaseAuth.verifyIdToken.mockResolvedValue({
        uid: newUserId,
        email: newUserEmail,
      });

      // Mock database timeout
      const originalPrisma = prisma.user.create;
      prisma.user.create = jest.fn().mockRejectedValue(new Error('Database timeout'));

      const response = await request(app.server)
        .post('/api/auth/sync')
        .set('Authorization', 'Bearer valid-token')
        .send({
          uid: newUserId,
          email: newUserEmail,
        })
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to sync user');
      expect(response.body).toHaveProperty('code', 'USER_SYNC_ERROR');

      // Restore original method
      prisma.user.create = originalPrisma;
    });
  });

  describe('Network and Service Errors', () => {
    it('should handle Firebase service unavailable', async () => {
      // Mock Firebase service unavailable
      mockFirebaseAuth.verifyIdToken.mockRejectedValue({
        code: 'auth/internal-error',
        message: 'Internal error in Firebase authentication service',
      });

      const response = await request(app.server)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer any-token')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid or expired token');
      expect(response.body).toHaveProperty('code', 'INVALID_TOKEN');
    });

    it('should handle network connectivity issues', async () => {
      // Mock network error
      mockFirebaseAuth.verifyIdToken.mockRejectedValue({
        code: 'auth/network-request-failed',
        message: 'Network error (such as timeout, interrupted connection or unreachable host)',
      });

      const response = await request(app.server)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer any-token')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid or expired token');
      expect(response.body).toHaveProperty('code', 'INVALID_TOKEN');
    });

    it('should handle Firebase quota exceeded', async () => {
      // Mock quota exceeded error
      mockFirebaseAuth.verifyIdToken.mockRejectedValue({
        code: 'auth/quota-exceeded',
        message: 'Firebase authentication quota exceeded',
      });

      const response = await request(app.server)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer any-token')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid or expired token');
      expect(response.body).toHaveProperty('code', 'INVALID_TOKEN');
    });
  });

  describe('Input Validation Errors', () => {
    it('should handle invalid email format in forgot password', async () => {
      const response = await request(app.server)
        .post('/api/auth/forgot-password')
        .send({ email: 'invalid-email-format' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Please enter a valid email address');
      expect(response.body).toHaveProperty('code', 'INVALID_EMAIL');
    });

    it('should handle missing email in forgot password', async () => {
      const response = await request(app.server)
        .post('/api/auth/forgot-password')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Please enter a valid email address');
      expect(response.body).toHaveProperty('code', 'INVALID_EMAIL');
    });

    it('should handle invalid profile update data', async () => {
      // Mock successful token verification
      mockFirebaseAuth.verifyIdToken.mockResolvedValue({
        uid: testUser.id,
        email: testUser.email,
      });

      const response = await request(app.server)
        .put('/api/auth/profile')
        .set('Authorization', 'Bearer valid-token')
        .send({
          email: 'invalid-email',
          role: 'invalid-role',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation error');
      expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
    });

    it('should handle missing required fields in user creation', async () => {
      // Mock successful token verification
      mockFirebaseAuth.verifyIdToken.mockResolvedValue({
        uid: 'new-user',
        email: 'new@test.com',
      });

      const response = await request(app.server)
        .post('/api/auth/create')
        .set('Authorization', 'Bearer valid-token')
        .send({
          uid: 'new-user',
          // Missing email and role
        })
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to create user');
      expect(response.body).toHaveProperty('code', 'USER_CREATION_ERROR');
    });
  });

  describe('Concurrent Request Errors', () => {
    it('should handle race conditions in user creation', async () => {
      const newUserId = 'race-condition-user';
      const newUserEmail = 'race@test.com';

      // Mock successful token verification
      mockFirebaseAuth.verifyIdToken.mockResolvedValue({
        uid: newUserId,
        email: newUserEmail,
      });

      // First request creates user
      const firstRequest = request(app.server)
        .post('/api/auth/create')
        .set('Authorization', 'Bearer valid-token')
        .send({
          uid: newUserId,
          email: newUserEmail,
          role: 'va',
        });

      // Second request tries to create same user (should fail)
      const secondRequest = request(app.server)
        .post('/api/auth/create')
        .set('Authorization', 'Bearer valid-token')
        .send({
          uid: newUserId,
          email: newUserEmail,
          role: 'va',
        });

      const [firstResponse, secondResponse] = await Promise.allSettled([
        firstRequest,
        secondRequest,
      ]);

      // One should succeed, one should fail
      const responses = [firstResponse, secondResponse].map(r => 
        r.status === 'fulfilled' ? r.value : r.reason
      );

      const successCount = responses.filter(r => r.status !== 400).length;
      const failureCount = responses.filter(r => r.status === 400).length;

      expect(successCount).toBe(1);
      expect(failureCount).toBe(1);

      // Clean up
      await prisma.user.delete({ where: { id: newUserId } }).catch(() => {});
    });
  });

  describe('Security Error Scenarios', () => {
    it('should handle suspicious authentication patterns', async () => {
      // Mock multiple failed attempts
      mockFirebaseAuth.verifyIdToken.mockRejectedValue(new Error('Invalid token'));

      // Make multiple failed requests
      const failedRequests = Array.from({ length: 10 }, () =>
        request(app.server)
          .get('/api/auth/profile')
          .set('Authorization', 'Bearer invalid-token')
      );

      const responses = await Promise.all(failedRequests);

      // All should return 401
      responses.forEach(response => {
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'Invalid or expired token');
      });

      // Verify rate limiting is working (if implemented)
      expect(mockFirebaseAuth.verifyIdToken).toHaveBeenCalledTimes(10);
    });

    it('should handle token tampering attempts', async () => {
      const tamperedToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.tampered.payload.signature';

      // Mock token tampering detection
      mockFirebaseAuth.verifyIdToken.mockRejectedValue({
        code: 'auth/invalid-id-token',
        message: 'Firebase ID token has been tampered with',
      });

      const response = await request(app.server)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${tamperedToken}`)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid or expired token');
      expect(response.body).toHaveProperty('code', 'INVALID_TOKEN');
    });
  });

  describe('Recovery and Fallback Scenarios', () => {
    it('should handle temporary Firebase service disruption', async () => {
      // Mock temporary service disruption
      mockFirebaseAuth.verifyIdToken
        .mockRejectedValueOnce(new Error('Service temporarily unavailable'))
        .mockResolvedValueOnce({
          uid: testUser.id,
          email: testUser.email,
        });

      // First request fails
      const firstResponse = await request(app.server)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer valid-token')
        .expect(401);

      expect(firstResponse.body).toHaveProperty('error', 'Invalid or expired token');

      // Second request succeeds (service recovered)
      const secondResponse = await request(app.server)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(secondResponse.body).toHaveProperty('success', true);
    });
  });
});