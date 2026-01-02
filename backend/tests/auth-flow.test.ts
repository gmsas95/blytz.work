import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals';
import { app } from '../src/server.js';
import { prisma } from './setup.js';
import { initializeFirebaseAdmin } from '../src/config/firebaseConfig-simplified.js';
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
  initializeFirebaseAdmin: jest.fn(),
  getAuth: jest.fn(() => ({
    verifyIdToken: jest.fn(),
    getUserByEmail: jest.fn(),
    generatePasswordResetLink: jest.fn(),
    createCustomToken: jest.fn(),
  })),
}));

describe('Authentication Flow Tests', () => {
  let testUser: any;
  let mockFirebaseAuth: any;

  beforeAll(async () => {
    // Create test user in database
    testUser = await prisma.user.create({
      data: {
        email: 'auth@test.com',
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
      where: { email: { contains: 'auth@test.com' } }
    });
  });

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('Authentication Middleware', () => {
    it('should allow access with valid token', async () => {
      // Mock successful token verification
      mockFirebaseAuth.verifyIdToken.mockResolvedValue({
        uid: testUser.id,
        email: testUser.email,
      });

      const response = await request(app.server)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('email', testUser.email);
    });

    it('should reject request with missing authorization header', async () => {
      const response = await request(app.server)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Missing authorization header');
      expect(response.body).toHaveProperty('code', 'MISSING_AUTH_HEADER');
    });

    it('should reject request with malformed authorization header', async () => {
      const response = await request(app.server)
        .get('/api/auth/profile')
        .set('Authorization', 'InvalidFormat')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Missing token');
      expect(response.body).toHaveProperty('code', 'MISSING_TOKEN');
    });

    it('should reject request with invalid token', async () => {
      // Mock failed token verification
      mockFirebaseAuth.verifyIdToken.mockRejectedValue(new Error('Invalid token'));

      const response = await request(app.server)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid or expired token');
      expect(response.body).toHaveProperty('code', 'INVALID_TOKEN');
    });

    it('should reject request for user not in database', async () => {
      // Mock successful token verification but user not in database
      mockFirebaseAuth.verifyIdToken.mockResolvedValue({
        uid: 'non-existent-user',
        email: 'nonexistent@test.com',
      });

      const response = await request(app.server)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer valid-token')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'User not found in database');
      expect(response.body).toHaveProperty('code', 'USER_NOT_FOUND');
    });

    it('should handle OPTIONS preflight requests', async () => {
      await request(app.server)
        .options('/api/auth/profile')
        .expect(204);
    });
  });

  describe('User Profile Management', () => {
    it('should get user profile successfully', async () => {
      // Mock successful token verification
      mockFirebaseAuth.verifyIdToken.mockResolvedValue({
        uid: testUser.id,
        email: testUser.email,
      });

      const response = await request(app.server)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('email', testUser.email);
      expect(response.body.data).toHaveProperty('role', testUser.role);
    });

    it('should update user profile successfully', async () => {
      // Mock successful token verification
      mockFirebaseAuth.verifyIdToken.mockResolvedValue({
        uid: testUser.id,
        email: testUser.email,
      });

      const updateData = {
        role: 'company',
        profileComplete: true,
      };

      const response = await request(app.server)
        .put('/api/auth/profile')
        .set('Authorization', 'Bearer valid-token')
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('role', 'company');
      expect(response.body.data).toHaveProperty('profileComplete', true);
    });

    it('should reject profile update with invalid email', async () => {
      // Mock successful token verification
      mockFirebaseAuth.verifyIdToken.mockResolvedValue({
        uid: testUser.id,
        email: testUser.email,
      });

      const updateData = {
        email: 'invalid-email',
      };

      const response = await request(app.server)
        .put('/api/auth/profile')
        .set('Authorization', 'Bearer valid-token')
        .send(updateData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation error');
      expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
    });

    it('should reject profile update with existing email', async () => {
      // Create another test user
      const anotherUser = await prisma.user.create({
        data: {
          email: 'another@test.com',
          role: 'va',
        },
      });

      try {
        // Mock successful token verification
        mockFirebaseAuth.verifyIdToken.mockResolvedValue({
          uid: testUser.id,
          email: testUser.email,
        });

        const updateData = {
          email: anotherUser.email,
        };

        const response = await request(app.server)
          .put('/api/auth/profile')
          .set('Authorization', 'Bearer valid-token')
          .send(updateData)
          .expect(400);

        expect(response.body).toHaveProperty('error', 'Email already exists');
        expect(response.body).toHaveProperty('code', 'EMAIL_EXISTS');
      } finally {
        // Clean up
        await prisma.user.delete({ where: { id: anotherUser.id } });
      }
    });
  });

  describe('Password Reset', () => {
    it('should generate password reset link for valid email', async () => {
      // Mock successful user lookup
      mockFirebaseAuth.getUserByEmail.mockResolvedValue({
        uid: testUser.id,
        email: testUser.email,
      });

      // Mock successful password reset link generation
      mockFirebaseAuth.generatePasswordResetLink.mockResolvedValue('https://reset-link.com');

      const response = await request(app.server)
        .post('/api/auth/forgot-password')
        .send({ email: testUser.email })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Password reset link generated (check console/response for dev)');
      expect(response.body).toHaveProperty('debug_link', 'https://reset-link.com');
    });

    it('should reject password reset for invalid email', async () => {
      const response = await request(app.server)
        .post('/api/auth/forgot-password')
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Please enter a valid email address');
      expect(response.body).toHaveProperty('code', 'INVALID_EMAIL');
    });

    it('should handle user not found for password reset', async () => {
      // Mock user not found
      mockFirebaseAuth.getUserByEmail.mockRejectedValue({ code: 'auth/user-not-found' });

      const response = await request(app.server)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@test.com' })
        .expect(404);

      expect(response.body).toHaveProperty('error', 'No account found with this email address. Please check your email or sign up for a new account.');
      expect(response.body).toHaveProperty('code', 'USER_NOT_FOUND');
    });
  });

  describe('User Synchronization', () => {
    it('should sync existing user successfully', async () => {
      // Mock successful token verification
      mockFirebaseAuth.verifyIdToken.mockResolvedValue({
        uid: testUser.id,
        email: testUser.email,
      });

      const response = await request(app.server)
        .post('/api/auth/sync')
        .set('Authorization', 'Bearer valid-token')
        .send({
          uid: testUser.id,
          email: testUser.email,
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'User synced successfully');
      expect(response.body.data).toHaveProperty('email', testUser.email);
    });

    it('should create new user if not exists', async () => {
      const newUserId = 'new-user-id';
      const newUserEmail = 'newuser@test.com';

      // Mock successful token verification
      mockFirebaseAuth.verifyIdToken.mockResolvedValue({
        uid: newUserId,
        email: newUserEmail,
      });

      const response = await request(app.server)
        .post('/api/auth/sync')
        .set('Authorization', 'Bearer valid-token')
        .send({
          uid: newUserId,
          email: newUserEmail,
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'User synced successfully');
      expect(response.body.data).toHaveProperty('email', newUserEmail);
      expect(response.body.data).toHaveProperty('role', 'va'); // Default role

      // Clean up
      await prisma.user.delete({ where: { id: newUserId } });
    });
  });

  describe('User Creation', () => {
    it('should create new user successfully', async () => {
      const newUserId = 'create-user-id';
      const newUserEmail = 'createuser@test.com';

      // Mock successful token verification
      mockFirebaseAuth.verifyIdToken.mockResolvedValue({
        uid: newUserId,
        email: newUserEmail,
      });

      const response = await request(app.server)
        .post('/api/auth/create')
        .set('Authorization', 'Bearer valid-token')
        .send({
          uid: newUserId,
          email: newUserEmail,
          role: 'company',
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'User created successfully');
      expect(response.body.data).toHaveProperty('email', newUserEmail);
      expect(response.body.data).toHaveProperty('role', 'company');

      // Clean up
      await prisma.user.delete({ where: { id: newUserId } });
    });

    it('should reject creating existing user', async () => {
      // Mock successful token verification
      mockFirebaseAuth.verifyIdToken.mockResolvedValue({
        uid: testUser.id,
        email: testUser.email,
      });

      const response = await request(app.server)
        .post('/api/auth/create')
        .set('Authorization', 'Bearer valid-token')
        .send({
          uid: testUser.id,
          email: testUser.email,
          role: 'va',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'User already exists');
      expect(response.body).toHaveProperty('code', 'USER_EXISTS');
    });
  });

  describe('Custom Token Generation', () => {
    it('should generate custom token successfully', async () => {
      // Mock successful token verification
      mockFirebaseAuth.verifyIdToken.mockResolvedValue({
        uid: testUser.id,
        email: testUser.email,
      });

      // Mock custom token generation
      mockFirebaseAuth.createCustomToken.mockResolvedValue('custom-token-123');

      const response = await request(app.server)
        .post('/api/auth/token')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('token', 'custom-token-123');
      expect(response.body.data).toHaveProperty('expiresIn', '1h');
    });

    it('should handle token generation failure', async () => {
      // Mock successful token verification
      mockFirebaseAuth.verifyIdToken.mockResolvedValue({
        uid: testUser.id,
        email: testUser.email,
      });

      // Mock custom token generation failure
      mockFirebaseAuth.createCustomToken.mockRejectedValue(new Error('Token generation failed'));

      const response = await request(app.server)
        .post('/api/auth/token')
        .set('Authorization', 'Bearer valid-token')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to generate token');
      expect(response.body).toHaveProperty('code', 'TOKEN_GENERATION_ERROR');
    });
  });
});