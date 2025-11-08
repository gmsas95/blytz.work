import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { app } from '../src/server.js';
import { prisma } from './setup.js';

describe('Match Endpoints', () => {
  let testCompany: any;
  let testVA: any;
  let testJob: any;
  let testMatch: any;
  let companyToken: string;
  let vaToken: string;

  beforeAll(async () => {
    // Create test company and job
    const companyUser = await prisma.user.create({
      data: { email: 'company-match@test.com', role: 'company' },
    });
    testCompany = await prisma.company.create({
      data: {
        userId: companyUser.id,
        name: 'Match Test Company',
        country: 'United States',
      },
    });
    testJob = await prisma.jobPosting.create({
      data: {
        companyId: testCompany.id,
        title: 'Match Test Job',
        description: 'Test description for matching',
        rateRange: '$50-70/hour',
      },
    });

    // Create test VA
    const vaUser = await prisma.user.create({
      data: { email: 'va-match@test.com', role: 'va' },
    });
    testVA = await prisma.vAProfile.create({
      data: {
        userId: vaUser.id,
        name: 'Match Test VA',
        country: 'United States',
        hourlyRate: 60,
        skills: ['JavaScript', 'React'],
        availability: true,
      },
    });

    // Create test match
    testMatch = await prisma.match.create({
      data: {
        jobPostingId: testJob.id,
        vaProfileId: testVA.id,
      },
    });

    companyToken = 'mock-company-token';
    vaToken = 'mock-va-token';
  });

  describe('GET /api/matches', () => {
    it('should return company matches', async () => {
      const response = await request(app.server)
        .get('/api/matches')
        .set('Authorization', `Bearer ${companyToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('vaProfile');
      expect(response.body[0]).toHaveProperty('company');
    });

    it('should return VA matches', async () => {
      const response = await request(app.server)
        .get('/api/matches')
        .set('Authorization', `Bearer ${vaToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('vaProfile');
      expect(response.body[0]).toHaveProperty('company');
    });
  });

  describe('GET /api/matches/:id', () => {
    it('should return specific match details', async () => {
      const response = await request(app.server)
        .get(`/api/matches/${testMatch.id}`)
        .set('Authorization', `Bearer ${companyToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', testMatch.id);
      expect(response.body).toHaveProperty('vaProfile');
      expect(response.body).toHaveProperty('company');
      expect(response.body.vaProfile).toHaveProperty('name', testVA.name);
      expect(response.body.company).toHaveProperty('name', testCompany.name);
    });

    it('should return 404 for non-existent match', async () => {
      const response = await request(app.server)
        .get('/api/matches/non-existent')
        .set('Authorization', `Bearer ${companyToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Match not found');
    });
  });

  describe('POST /api/matches/:id/unlock', () => {
    beforeEach(async () => {
      await prisma.payment.deleteMany();
    });

    it('should unlock contact info for paid match', async () => {
      // Create a successful payment
      await prisma.payment.create({
        data: {
          matchId: testMatch.id,
          userId: testCompany.userId,
          amount: 2999,
          stripePaymentIntentId: 'pi_test_123',
          status: 'succeeded',
        },
      });

      const response = await request(app.server)
        .post(`/api/matches/${testMatch.id}/unlock`)
        .set('Authorization', `Bearer ${companyToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('contactInfo');
      expect(response.body.contactInfo).toHaveProperty('vaEmail');
      expect(response.body.contactInfo).toHaveProperty('companyEmail');
    });

    it('should require payment to unlock', async () => {
      const response = await request(app.server)
        .post(`/api/matches/${testMatch.id}/unlock`)
        .set('Authorization', `Bearer ${companyToken}`)
        .expect(402);

      expect(response.body).toHaveProperty('error', 'Payment required to unlock contact information');
    });
  });

  describe('Match Creation Logic', () => {
    it('should create match when both parties like each other', async () => {
      const newCompany = await prisma.user.create({
        data: { email: 'company-likes@test.com', role: 'company' },
      });
      const company = await prisma.company.create({
        data: {
          userId: newCompany.id,
          name: 'Likes Test Company',
          country: 'United States',
        },
      });

      const newVA = await prisma.user.create({
        data: { email: 'va-likes@test.com', role: 'va' },
      });
      const va = await prisma.vAProfile.create({
        data: {
          userId: newVA.id,
          name: 'Likes Test VA',
          country: 'United States',
          hourlyRate: 50,
          skills: ['JavaScript'],
          availability: true,
        },
      });

      const job = await prisma.jobPosting.create({
        data: {
          companyId: company.id,
          title: 'Likes Test Job',
          description: 'Test job',
          rateRange: '$50-70/hour',
        },
      });

      // Company votes yes on VA
      await request(app.server)
        .post('/api/matches/vote')
        .set('Authorization', 'mock-company-token')
        .send({
          jobPostingId: job.id,
          vaProfileId: va.id,
          vote: true,
        });

      // VA votes yes on company/job
      await request(app.server)
        .post('/api/matches/vote')
        .set('Authorization', 'mock-va-token')
        .send({
          jobPostingId: job.id,
          vaProfileId: va.id,
          vote: true,
        });

      // Check if match was created
      const match = await prisma.match.findFirst({
        where: {
          jobPosting: {
            companyId: company.id
          },
          vaProfileId: va.id,
        },
      });

      expect(match).toBeTruthy();
    });
  });
});