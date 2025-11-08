import { describe, it, expect, jest, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { createPaymentIntent, confirmPayment } from '../src/utils/stripe.js';

const mockStripe = {
  paymentIntents: {
    create: jest.fn().mockResolvedValue({
      id: 'pi_test_123',
      client_secret: 'pi_test_123_secret_test',
      amount: 2999,
      currency: 'usd',
      metadata: { matchId: 'match_123' }
    }),
    retrieve: jest.fn().mockResolvedValue({
      id: 'pi_test_123',
      status: 'succeeded',
      amount: 2999
    })
  }
};

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => mockStripe);
});

describe('Stripe Utils', () => {
  describe('createPaymentIntent', () => {
    it('should create payment intent successfully', async () => {
      const matchId = 'match_123';
      const amount = 29.99;

      const result = await createPaymentIntent(matchId, amount);

      expect(result).toHaveProperty('id', 'pi_test_123');
      expect(result).toHaveProperty('client_secret', 'pi_test_123_secret_test');
      expect(result.metadata).toHaveProperty('matchId', matchId);
    });

    it('should handle errors', async () => {
      // Mock Stripe to throw error
      const { stripe } = await import('../src/utils/stripe.js');
      (stripe as any).paymentIntents.create.mockRejectedValue(new Error('Stripe error'));

      await expect(createPaymentIntent('match_123', 29.99))
        .rejects.toThrow('Failed to create payment intent: Stripe error');
    });
  });

  describe('confirmPayment', () => {
    it('should confirm successful payment', async () => {
      const paymentIntentId = 'pi_test_123';

      const result = await confirmPayment(paymentIntentId);

      expect(result).toHaveProperty('id', 'pi_test_123');
      expect(result).toHaveProperty('status', 'succeeded');
      expect(result).toHaveProperty('amount', 2999);
    });

    it('should throw error for failed payment', async () => {
      // Mock Stripe to return failed payment
      const { stripe } = await import('../src/utils/stripe.js');
      (stripe as any).paymentIntents.retrieve.mockResolvedValue({
        id: 'pi_test_123',
        status: 'requires_payment_method',
      });

      await expect(confirmPayment('pi_test_123'))
        .rejects.toThrow('Failed to confirm payment: Payment not successful');
    });
  });
});