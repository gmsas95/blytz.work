import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { app } from '../src/server.js';
import { prisma } from './setup.js';

describe('Health Check', () => {
  it('should return 200 OK', async () => {
    const response = await request(app.server)
      .get('/health')
      .expect(200);

    expect(response.body).toHaveProperty('ok', true);
    expect(response.body).toHaveProperty('timestamp');
  });
});

describe('VA Profile Endpoints', () => {
  let testUser: any;
  let authToken: string;

  beforeAll(async () => {
    // Create test user
    testUser = await prisma.user.create({
      data: {
        email: 'va@test.com',
        role: 'va',
      },
    });

    // In production tests, use real Firebase Auth tokens
    // Mock tokens are disabled for security
    authToken = null;
  });

  describe('POST /api/va/profile', () => {
    it('should create VA profile successfully', async () => {
      const profileData = {
        name: 'John Doe',
        country: 'United States',
        hourlyRate: 50,
        skills: ['JavaScript', 'React', 'Node.js'],
        availability: true,
      };

      const response = await request(app.server)
        .post('/api/va/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(profileData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(profileData.name);
      expect(response.body.country).toBe(profileData.country);
      expect(response.body.hourlyRate).toBe(profileData.hourlyRate);
      expect(response.body.skills).toEqual(profileData.skills);
      expect(response.body.availability).toBe(profileData.availability);
    });

    it('should validate required fields', async () => {
      const response = await request(app.server)
        .post('/api/va/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should require authentication', async () => {
      const response = await request(app.server)
        .post('/api/va/profile')
        .send({})
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Missing authorization header');
    });
  });

  describe('GET /api/va/profile', () => {
    it('should return VA profile for authenticated user', async () => {
      // Create a VA profile first
      await prisma.vAProfile.create({
        data: {
          userId: testUser.id,
          name: 'Test VA',
          country: 'United States',
          hourlyRate: 50,
          skills: ['JavaScript'],
          availability: true,
        },
      });

      const response = await request(app.server)
        .get('/api/va/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Test VA');
    });

    it('should return 404 for non-existent profile', async () => {
      const response = await request(app.server)
        .get('/api/va/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'VA profile not found');
    });
  });
});

describe('Company Endpoints', () => {
  let testUser: any;
  let authToken: string;

  beforeAll(async () => {
    testUser = await prisma.user.create({
      data: {
        email: 'company@test.com',
        role: 'company',
      },
    });

    // In production tests, use real Firebase Auth tokens
    // Mock tokens are disabled for security
    authToken = null;
  });

  describe('POST /api/company', () => {
    it('should create company profile successfully', async () => {
      const companyData = {
        name: 'Test Company',
        country: 'United States',
      };

      const response = await request(app.server)
        .post('/api/company')
        .set('Authorization', `Bearer ${authToken}`)
        .send(companyData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(companyData.name);
      expect(response.body.country).toBe(companyData.country);
    });
  });

  describe('Job Posting', () => {
    let testCompany: any;

    beforeAll(async () => {
      testCompany = await prisma.company.create({
        data: {
          userId: testUser.id,
          name: 'Test Company',
          country: 'United States',
        },
      });
    });

    it('should create job posting successfully', async () => {
      const jobData = {
        title: 'Senior React Developer',
        description: 'Looking for an experienced React developer to join our team.',
        rateRange: '$50-70/hour',
      };

      const response = await request(app.server)
        .post('/api/company/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(jobData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(jobData.title);
      expect(response.body.description).toBe(jobData.description);
      expect(response.body.rateRange).toBe(jobData.rateRange);
      expect(response.body.companyId).toBe(testCompany.id);
    });
  });
});

describe('Matching Endpoints', () => {
  let testCompany: any;
  let testVA: any;
  let testJob: any;
  let companyToken: string;

  beforeAll(async () => {
    // Create test company and job
    const companyUser = await prisma.user.create({
      data: { email: 'company2@test.com', role: 'company' },
    });
    testCompany = await prisma.company.create({
      data: {
        userId: companyUser.id,
        name: 'Test Company',
        country: 'United States',
      },
    });
    testJob = await prisma.jobPosting.create({
      data: {
        companyId: testCompany.id,
        title: 'Test Job',
        description: 'Test description',
        rateRange: '$50-70/hour',
      },
    });

    // Create test VA
    const vaUser = await prisma.user.create({
      data: { email: 'va2@test.com', role: 'va' },
    });
    testVA = await prisma.vAProfile.create({
      data: {
        userId: vaUser.id,
        name: 'Test VA',
        country: 'United States',
        hourlyRate: 60,
        skills: ['JavaScript'],
        availability: true,
      },
    });

    // In production tests, use real Firebase Auth tokens
    // Mock tokens are disabled for security
    companyToken = null;
  });

  describe('GET /api/matches/discover', () => {
    it('should return VA recommendations', async () => {
      const response = await request(app.server)
        .get('/api/matches/discover?jobPostingId=' + testJob.id)
        .set('Authorization', `Bearer ${companyToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/matches/vote', () => {
    it('should record vote successfully', async () => {
      const voteData = {
        jobPostingId: testJob.id,
        vaProfileId: testVA.id,
        vote: true,
      };

      const response = await request(app.server)
        .post('/api/matches/vote')
        .set('Authorization', `Bearer ${companyToken}`)
        .send(voteData)
        .expect(200);

      expect(response.body).toHaveProperty('match', false);
      expect(response.body).toHaveProperty('data');
    });
  });
});