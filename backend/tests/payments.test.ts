import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals';
import { app } from '../src/server.js';
import { prisma } from './setup.js';
import { createPaymentIntent, confirmPayment } from '../src/utils/stripe.js';

const mockCreatePaymentIntent = jest.fn();
const mockConfirmPayment = jest.fn();

jest.mock('../src/utils/stripe.js', () => ({
  createPaymentIntent: mockCreatePaymentIntent,
  confirmPayment: mockConfirmPayment,
}));

describe('Payment Endpoints', () => {
  let testCompany: any;
  let testVA: any;
  let testJob: any;
  let testMatch: any;
  let companyToken: string;
  let vaToken: string;

  beforeAll(async () => {
    // Create test company
    const companyUser = await prisma.user.create({
      data: { email: 'company-payment@test.com', role: 'company' },
    });
    testCompany = await prisma.company.create({
      data: {
        userId: companyUser.id,
        name: 'Payment Test Company',
        country: 'United States',
      },
    });

    // Create test VA
    const vaUser = await prisma.user.create({
      data: { email: 'va-payment@test.com', role: 'va' },
    });
    testVA = await prisma.vAProfile.create({
      data: {
        userId: vaUser.id,
        name: 'Payment Test VA',
        country: 'United States',
        hourlyRate: 60,
        skills: ['JavaScript'],
        availability: true,
      },
    });

    // Create test job posting
    testJob = await prisma.jobPosting.create({
      data: {
        companyId: testCompany.id,
        title: 'Payment Test Job',
        description: 'Test job for payment testing',
        rateRange: '$50-70/hr',
        isActive: true,
      },
    });

    // Create test match
    testMatch = await prisma.match.create({
      data: {
        jobPostingId: testJob.id,
        vaProfileId: testVA.id,
      },
    });

    // In production tests, use real Firebase Auth tokens
    // Mock tokens are disabled for security
    companyToken = null;
    vaToken = null;
  });

  describe('POST /api/payments/create-intent', () => {
    it('should create payment intent successfully', async () => {
      const mockPaymentIntent = {
        id: 'pi_test_123',
        client_secret: 'pi_test_123_secret_test',
        metadata: { matchId: testMatch.id },
      };
      mockCreatePaymentIntent.mockResolvedValue(mockPaymentIntent);

      const response = await request(app.server)
        .post('/api/payments/create-intent')
        .set('Authorization', `Bearer ${companyToken}`)
        .send({ matchId: testMatch.id })
        .expect(200);

      expect(response.body).toHaveProperty('clientSecret', mockPaymentIntent.client_secret);
      expect(response.body).toHaveProperty('paymentIntentId', mockPaymentIntent.id);
      expect(mockCreatePaymentIntent).toHaveBeenCalledWith(testMatch.id, 29.99);
    });

    it('should validate match exists', async () => {
      const response = await request(app.server)
        .post('/api/payments/create-intent')
        .set('Authorization', `Bearer ${companyToken}`)
        .send({ matchId: 'non-existent-match' })
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Match not found');
    });

    it('should require authentication', async () => {
      const response = await request(app.server)
        .post('/api/payments/create-intent')
        .send({ matchId: testMatch.id })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Missing authorization header');
    });
  });

  describe('POST /api/payments/confirm', () => {
    it('should confirm payment and unlock contact info', async () => {
      const mockPaymentIntent = {
        id: 'pi_test_123',
        status: 'succeeded',
        amount: 2999,
      };
      mockConfirmPayment.mockResolvedValue(mockPaymentIntent);

      const response = await request(app.server)
        .post('/api/payments/confirm')
        .set('Authorization', `Bearer ${companyToken}`)
        .send({ paymentIntentId: 'pi_test_123' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('payment');
      expect(mockConfirmPayment).toHaveBeenCalledWith('pi_test_123');
    });

    it('should handle payment confirmation failure', async () => {
      mockConfirmPayment.mockRejectedValue(new Error('Payment failed'));

      const response = await request(app.server)
        .post('/api/payments/confirm')
        .set('Authorization', `Bearer ${companyToken}`)
        .send({ paymentIntentId: 'pi_test_123' })
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to confirm payment');
    });
  });

  describe('GET /api/payments/match/:matchId', () => {
    beforeEach(async () => {
      await prisma.payment.deleteMany();
    });

    it('should return payment status for match', async () => {
      // Create a payment record
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
        .get(`/api/payments/match/${testMatch.id}`)
        .set('Authorization', `Bearer ${companyToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'succeeded');
      expect(response.body).toHaveProperty('amount', 2999);
    });

    it('should return null for no payment', async () => {
      const response = await request(app.server)
        .get(`/api/payments/match/${testMatch.id}`)
        .set('Authorization', `Bearer ${companyToken}`)
        .expect(200);

      expect(response.body).toBeNull();
    });
  });
});