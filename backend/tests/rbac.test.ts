import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals';
import { app } from '../src/server.js';
import { prisma } from './setup.js';

// Mock Firebase Admin
jest.mock('firebase-admin', () => ({
  auth: jest.fn(() => ({
    verifyIdToken: jest.fn(),
  })),
}));

// Mock Firebase initialization
jest.mock('../src/config/firebaseConfig-simplified.js', () => ({
  getAuth: jest.fn(() => ({
    verifyIdToken: jest.fn(),
  })),
}));

describe('Role-Based Access Control (RBAC) Tests', () => {
  let vaUser: any;
  let companyUser: any;
  let adminUser: any;
  let mockFirebaseAuth: any;

  beforeAll(async () => {
    // Create test users with different roles
    vaUser = await prisma.user.create({
      data: {
        email: 'va-rbac@test.com',
        role: 'va',
        profileComplete: true,
      },
    });

    companyUser = await prisma.user.create({
      data: {
        email: 'company-rbac@test.com',
        role: 'company',
        profileComplete: true,
      },
    });

    adminUser = await prisma.user.create({
      data: {
        email: 'admin-rbac@test.com',
        role: 'admin',
        profileComplete: true,
      },
    });

    // Mock Firebase Auth
    const { getAuth } = require('../src/config/firebaseConfig-simplified.js');
    mockFirebaseAuth = getAuth();
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.user.deleteMany({
      where: { 
        email: { 
          contains: 'rbac@test.com' 
        } 
      }
    });
  });

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('VA Role Access Control', () => {
    it('should allow VA to access their own profile', async () => {
      // Mock successful token verification
      mockFirebaseAuth.verifyIdToken.mockResolvedValue({
        uid: vaUser.id,
        email: vaUser.email,
      });

      const response = await request(app.server)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer va-token')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('email', vaUser.email);
      expect(response.body.data).toHaveProperty('role', 'va');
    });

    it('should allow VA to create and update their VA profile', async () => {
      // Mock successful token verification
      mockFirebaseAuth.verifyIdToken.mockResolvedValue({
        uid: vaUser.id,
        email: vaUser.email,
      });

      // Create VA profile
      const profileData = {
        name: 'Test VA',
        country: 'United States',
        hourlyRate: 50,
        skills: ['JavaScript', 'React'],
        availability: true,
      };

      const createResponse = await request(app.server)
        .post('/api/va/profile')
        .set('Authorization', 'Bearer va-token')
        .send(profileData)
        .expect(201);

      expect(createResponse.body).toHaveProperty('id');
      expect(createResponse.body.name).toBe(profileData.name);

      // Update VA profile
      const updateData = {
        hourlyRate: 60,
        availability: false,
      };

      const updateResponse = await request(app.server)
        .put('/api/va/profile')
        .set('Authorization', 'Bearer va-token')
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.hourlyRate).toBe(60);
      expect(updateResponse.body.availability).toBe(false);
    });

    it('should prevent VA from accessing company-only endpoints', async () => {
      // Mock successful token verification
      mockFirebaseAuth.verifyIdToken.mockResolvedValue({
        uid: vaUser.id,
        email: vaUser.email,
      });

      // Try to create company profile (should be restricted)
      const response = await request(app.server)
        .post('/api/company')
        .set('Authorization', 'Bearer va-token')
        .send({
          name: 'Unauthorized Company',
          country: 'United States',
        })
        .expect(403); // Should be forbidden

      expect(response.body).toHaveProperty('error');
    });

    it('should prevent VA from posting jobs', async () => {
      // Mock successful token verification
      mockFirebaseAuth.verifyIdToken.mockResolvedValue({
        uid: vaUser.id,
        email: vaUser.email,
      });

      const jobData = {
        title: 'Unauthorized Job Posting',
        description: 'This should not be allowed',
        rateRange: '$50-70/hour',
      };

      const response = await request(app.server)
        .post('/api/company/jobs')
        .set('Authorization', 'Bearer va-token')
        .send(jobData)
        .expect(403); // Should be forbidden

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Company Role Access Control', () => {
    it('should allow Company to access their own profile', async () => {
      // Mock successful token verification
      mockFirebaseAuth.verifyIdToken.mockResolvedValue({
        uid: companyUser.id,
        email: companyUser.email,
      });

      const response = await request(app.server)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer company-token')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('email', companyUser.email);
      expect(response.body.data).toHaveProperty('role', 'company');
    });

    it('should allow Company to create and update company profile', async () => {
      // Mock successful token verification
      mockFirebaseAuth.verifyIdToken.mockResolvedValue({
        uid: companyUser.id,
        email: companyUser.email,
      });

      // Create company profile
      const companyData = {
        name: 'Test Company',
        country: 'United States',
        industry: 'Technology',
      };

      const createResponse = await request(app.server)
        .post('/api/company')
        .set('Authorization', 'Bearer company-token')
        .send(companyData)
        .expect(201);

      expect(createResponse.body).toHaveProperty('id');
      expect(createResponse.body.name).toBe(companyData.name);

      // Create company profile entry in database for update test
      await prisma.company.create({
        data: {
          userId: companyUser.id,
          name: companyData.name,
          country: companyData.country,
        },
      });

      // Update company profile
      const updateData = {
        industry: 'Software Development',
      };

      const updateResponse = await request(app.server)
        .put('/api/company')
        .set('Authorization', 'Bearer company-token')
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.industry).toBe('Software Development');
    });

    it('should allow Company to post jobs', async () => {
      // Mock successful token verification
      mockFirebaseAuth.verifyIdToken.mockResolvedValue({
        uid: companyUser.id,
        email: companyUser.email,
      });

      // Create company profile first
      await prisma.company.create({
        data: {
          userId: companyUser.id,
          name: 'Test Company for Jobs',
          country: 'United States',
        },
      });

      const jobData = {
        title: 'Senior React Developer',
        description: 'Looking for an experienced React developer',
        rateRange: '$50-70/hour',
        requirements: ['5+ years experience', 'React expertise'],
      };

      const response = await request(app.server)
        .post('/api/company/jobs')
        .set('Authorization', 'Bearer company-token')
        .send(jobData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(jobData.title);
      expect(response.body.description).toBe(jobData.description);
    });

    it('should prevent Company from accessing VA-only endpoints', async () => {
      // Mock successful token verification
      mockFirebaseAuth.verifyIdToken.mockResolvedValue({
        uid: companyUser.id,
        email: companyUser.email,
      });

      // Try to create VA profile (should be restricted)
      const vaProfileData = {
        name: 'Unauthorized VA',
        country: 'United States',
        hourlyRate: 50,
        skills: ['JavaScript'],
        availability: true,
      };

      const response = await request(app.server)
        .post('/api/va/profile')
        .set('Authorization', 'Bearer company-token')
        .send(vaProfileData)
        .expect(403); // Should be forbidden

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Admin Role Access Control', () => {
    it('should allow Admin to access any user profile', async () => {
      // Mock successful token verification
      mockFirebaseAuth.verifyIdToken.mockResolvedValue({
        uid: adminUser.id,
        email: adminUser.email,
      });

      const response = await request(app.server)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('email', adminUser.email);
      expect(response.body.data).toHaveProperty('role', 'admin');
    });

    it('should allow Admin to access system endpoints', async () => {
      // Mock successful token verification
      mockFirebaseAuth.verifyIdToken.mockResolvedValue({
        uid: adminUser.id,
        email: adminUser.email,
      });

      // Test access to admin-only endpoints (if they exist)
      const response = await request(app.server)
        .get('/api/admin/users')
        .set('Authorization', 'Bearer admin-token')
        .expect(200); // Should succeed for admin

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should allow Admin to manage user roles', async () => {
      // Mock successful token verification
      mockFirebaseAuth.verifyIdToken.mockResolvedValue({
        uid: adminUser.id,
        email: adminUser.email,
      });

      // Update user role (admin privilege)
      const response = await request(app.server)
        .put('/api/admin/users/' + vaUser.id + '/role')
        .set('Authorization', 'Bearer admin-token')
        .send({ role: 'company' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('role', 'company');

      // Restore original role
      await prisma.user.update({
        where: { id: vaUser.id },
        data: { role: 'va' },
      });
    });
  });

  describe('Cross-Role Access Prevention', () => {
    it('should prevent VA from accessing another VA\'s profile', async () => {
      // Create another VA user
      const anotherVA = await prisma.user.create({
        data: {
          email: 'another-va@test.com',
          role: 'va',
          profileComplete: true,
        },
      });

      try {
        // Mock successful token verification for first VA
        mockFirebaseAuth.verifyIdToken.mockResolvedValue({
          uid: vaUser.id,
          email: vaUser.email,
        });

        // Try to access another VA's profile
        const response = await request(app.server)
          .get(`/api/va/profiles/${anotherVA.id}`)
          .set('Authorization', 'Bearer va-token')
          .expect(403); // Should be forbidden

        expect(response.body).toHaveProperty('error');
      } finally {
        // Clean up
        await prisma.user.delete({ where: { id: anotherVA.id } });
      }
    });

    it('should prevent Company from accessing another Company\'s jobs', async () => {
      // Create another company user and job
      const anotherCompany = await prisma.user.create({
        data: {
          email: 'another-company@test.com',
          role: 'company',
          profileComplete: true,
        },
      });

      const anotherCompanyProfile = await prisma.company.create({
        data: {
          userId: anotherCompany.id,
          name: 'Another Company',
          country: 'United States',
        },
      });

      const anotherJob = await prisma.jobPosting.create({
        data: {
          companyId: anotherCompanyProfile.id,
          title: 'Another Job',
          description: 'This should not be accessible',
          rateRange: '$60-80/hour',
        },
      });

      try {
        // Mock successful token verification for first company
        mockFirebaseAuth.verifyIdToken.mockResolvedValue({
          uid: companyUser.id,
          email: companyUser.email,
        });

        // Try to access another company's job
        const response = await request(app.server)
          .get(`/api/jobs/${anotherJob.id}`)
          .set('Authorization', 'Bearer company-token')
          .expect(403); // Should be forbidden

        expect(response.body).toHaveProperty('error');
      } finally {
        // Clean up
        await prisma.jobPosting.delete({ where: { id: anotherJob.id } });
        await prisma.company.delete({ where: { id: anotherCompanyProfile.id } });
        await prisma.user.delete({ where: { id: anotherCompany.id } });
      }
    });
  });

  describe('Role-Based Resource Access', () => {
    it('should allow VA to apply for jobs but not create them', async () => {
      // Mock successful token verification for VA
      mockFirebaseAuth.verifyIdToken.mockResolvedValue({
        uid: vaUser.id,
        email: vaUser.email,
      });

      // Create a job to apply to
      const companyProfile = await prisma.company.create({
        data: {
          userId: companyUser.id,
          name: 'Hiring Company',
          country: 'United States',
        },
      });

      const job = await prisma.jobPosting.create({
        data: {
          companyId: companyProfile.id,
          title: 'React Developer',
          description: 'Looking for React developer',
          rateRange: '$50-70/hour',
        },
      });

      try {
        // VA should be able to apply for job
        const applicationData = {
          jobPostingId: job.id,
          coverLetter: 'I am interested in this position',
          proposedRate: 55,
        };

        const applyResponse = await request(app.server)
          .post('/api/va/apply')
          .set('Authorization', 'Bearer va-token')
          .send(applicationData)
          .expect(201);

        expect(applyResponse.body).toHaveProperty('id');

        // VA should NOT be able to create jobs
        const jobData = {
          title: 'Unauthorized Job',
          description: 'VA should not create jobs',
          rateRange: '$40-60/hour',
        };

        const createJobResponse = await request(app.server)
          .post('/api/company/jobs')
          .set('Authorization', 'Bearer va-token')
          .send(jobData)
          .expect(403);

        expect(createJobResponse.body).toHaveProperty('error');
      } finally {
        // Clean up
        await prisma.jobPosting.delete({ where: { id: job.id } });
        await prisma.company.delete({ where: { id: companyProfile.id } });
      }
    });

    it('should allow Company to review applications but not apply for jobs', async () => {
      // Mock successful token verification for Company
      mockFirebaseAuth.verifyIdToken.mockResolvedValue({
        uid: companyUser.id,
        email: companyUser.email,
      });

      // Create a job and application
      const companyProfile = await prisma.company.create({
        data: {
          userId: companyUser.id,
          name: 'Hiring Company',
          country: 'United States',
        },
      });

      const job = await prisma.jobPosting.create({
        data: {
          companyId: companyProfile.id,
          title: 'React Developer',
          description: 'Looking for React developer',
          rateRange: '$50-70/hour',
        },
      });

      try {
        // Company should be able to review applications
        const reviewResponse = await request(app.server)
          .get(`/api/company/jobs/${job.id}/applications`)
          .set('Authorization', 'Bearer company-token')
          .expect(200);

        expect(Array.isArray(reviewResponse.body)).toBe(true);

        // Company should NOT be able to apply for jobs
        const applicationData = {
          jobPostingId: job.id,
          coverLetter: 'Company should not apply',
          proposedRate: 55,
        };

        const applyResponse = await request(app.server)
          .post('/api/va/apply')
          .set('Authorization', 'Bearer company-token')
          .send(applicationData)
          .expect(403);

        expect(applyResponse.body).toHaveProperty('error');
      } finally {
        // Clean up
        await prisma.jobPosting.delete({ where: { id: job.id } });
        await prisma.company.delete({ where: { id: companyProfile.id } });
      }
    });
  });

  describe('Role Validation in API Endpoints', () => {
    it('should validate role in payment endpoints', async () => {
      // Mock successful token verification for VA
      mockFirebaseAuth.verifyIdToken.mockResolvedValue({
        uid: vaUser.id,
        email: vaUser.email,
      });

      // VA should be able to view their own payments
      const paymentsResponse = await request(app.server)
        .get('/api/payments')
        .set('Authorization', 'Bearer va-token')
        .expect(200);

      expect(Array.isArray(paymentsResponse.body)).toBe(true);

      // VA should NOT be able to process payments (admin/company function)
      const processPaymentResponse = await request(app.server)
        .post('/api/payments/process')
        .set('Authorization', 'Bearer va-token')
        .send({
          amount: 100,
          recipientId: 'some-user-id',
        })
        .expect(403);

      expect(processPaymentResponse.body).toHaveProperty('error');
    });

    it('should validate role in contract endpoints', async () => {
      // Mock successful token verification for Company
      mockFirebaseAuth.verifyIdToken.mockResolvedValue({
        uid: companyUser.id,
        email: companyUser.email,
      });

      // Company should be able to create contracts
      const contractData = {
        vaProfileId: vaUser.id,
        jobTitle: 'React Developer',
        terms: 'Fixed price project',
        milestones: [
          {
            title: 'Milestone 1',
            description: 'Complete UI',
            amount: 1000,
            dueDate: new Date().toISOString(),
          },
        ],
      };

      const createResponse = await request(app.server)
        .post('/api/contracts')
        .set('Authorization', 'Bearer company-token')
        .send(contractData)
        .expect(201);

      expect(createResponse.body).toHaveProperty('id');

      // Company should be able to manage their contracts
      const contractId = createResponse.body.id;
      const updateResponse = await request(app.server)
        .put(`/api/contracts/${contractId}`)
        .set('Authorization', 'Bearer company-token')
        .send({ status: 'active' })
        .expect(200);

      expect(updateResponse.body).toHaveProperty('status', 'active');

      // Clean up
      await prisma.contract.delete({ where: { id: contractId } });
    });
  });
});