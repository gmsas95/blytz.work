import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { prisma } from '../src/utils/prisma.js';
import { createPaymentIntent, confirmPayment } from '../src/utils/stripe.js';
import { createApiError } from '../src/utils/errors.js';

describe('Payment Utils', () => {
  beforeAll(async () => {
    // Test database setup if needed
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('createPaymentIntent', () => {
    it('should create a payment intent with correct amount', async () => {
      const matchId = 'test-match-id';
      const amount = 29.99;
      
      const paymentIntent = await createPaymentIntent(matchId, amount);
      
      expect(paymentIntent).toBeDefined();
      expect(paymentIntent.amount).toBe(Math.round(amount * 100));
      expect(paymentIntent.currency).toBe('usd');
      expect(paymentIntent.metadata.matchId).toBe(matchId);
    });

    it('should handle stripe errors gracefully', async () => {
      // Test with invalid data to trigger error
      await expect(createPaymentIntent('', -1)).rejects.toThrow();
    });
  });

  describe('confirmPayment', () => {
    it('should confirm a successful payment', async () => {
      // First create a payment intent
      const paymentIntent = await createPaymentIntent('test-match-id', 29.99);
      
      // Mock successful payment (in real test, you'd use Stripe test fixtures)
      const confirmedPayment = await confirmPayment(paymentIntent.id);
      
      expect(confirmedPayment).toBeDefined();
      expect(confirmedPayment.status).toBe('succeeded');
    });

    it('should reject failed payments', async () => {
      await expect(confirmPayment('invalid-payment-intent-id')).rejects.toThrow();
    });
  });
});

describe('Error Handling', () => {
  it('should create proper API errors', () => {
    const error = createApiError('Test error', 400, 'TEST_ERROR');
    
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('TEST_ERROR');
    expect(error.message).toBe('Test error');
    expect(error.isOperational).toBe(true);
  });
});