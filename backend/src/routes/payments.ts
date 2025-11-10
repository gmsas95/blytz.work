// Simplified Payment Routes for Week 2 MVP
import { FastifyInstance } from "fastify";
import { verifyAuth } from "../plugins/firebaseAuth.js";

export default async function paymentRoutes(app: FastifyInstance) {
  // Create payment intent
  app.post("/payments/create-intent", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { matchId } = request.body as { matchId: string };

    try {
      // Mock payment intent creation
      const paymentIntent = {
        id: 'pi_' + Date.now(),
        amount: 2999, // $29.99
        currency: 'usd',
        status: 'requires_payment_method',
        client_secret: 'pi_' + Date.now() + '_secret_' + Math.random().toString(36).substr(2, 9),
        metadata: {
          matchId,
          userId: user.uid
        }
      };

      return {
        success: true,
        data: paymentIntent
      };
    } catch (error: any) {
      return reply.code(500).send({ 
        error: "Failed to create payment intent",
        code: "PAYMENT_INTENT_ERROR",
        details: error.message
      });
    }
  });

  // Confirm payment
  app.post("/payments/confirm", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const { paymentIntentId } = request.body as { paymentIntentId: string };

    try {
      // Mock payment confirmation
      return {
        success: true,
        data: {
          paymentIntentId,
          status: 'succeeded',
          message: 'Payment confirmed successfully'
        }
      };
    } catch (error: any) {
      return reply.code(500).send({ 
        error: "Failed to confirm payment",
        code: "PAYMENT_CONFIRM_ERROR",
        details: error.message
      });
    }
  });

  // Get payment status
  app.get("/payments/status/:matchId", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const { matchId } = request.params as { matchId: string };

    try {
      // Mock payment status
      return {
        success: true,
        data: {
          matchId,
          paymentStatus: 'pending',
          amount: 2999,
          createdAt: new Date()
        }
      };
    } catch (error: any) {
      return reply.code(500).send({ 
        error: "Failed to fetch payment status",
        code: "PAYMENT_STATUS_ERROR",
        details: error.message
      });
    }
  });

  // Get payment history
  app.get("/payments/history", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { page = 1, limit = 20 } = request.query as { 
      page: string, 
      limit: string 
    };

    try {
      // Mock payment history
      return {
        success: true,
        data: {
          payments: [
            {
              id: 'pi_1',
              matchId: 'match_1',
              amount: 2999,
              status: 'succeeded',
              createdAt: new Date('2024-01-01'),
              metadata: { vaName: 'John Doe', companyName: 'Acme Corp' }
            }
          ],
          pagination: {
            page: parseInt(String(page)),
            limit: parseInt(String(limit)),
            total: 1,
            totalPages: 1
          }
        }
      };
    } catch (error: any) {
      return reply.code(500).send({ 
        error: "Failed to fetch payment history",
        code: "PAYMENT_HISTORY_ERROR",
        details: error.message
      });
    }
  });

  // Refund payment
  app.post("/payments/refund", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const { paymentId } = request.body as { paymentId: string };

    try {
      // Mock refund
      return {
        success: true,
        data: {
          paymentId,
          refundId: 're_' + Date.now(),
          amount: 2999,
          status: 'succeeded',
          message: 'Refund processed successfully'
        }
      };
    } catch (error: any) {
      return reply.code(500).send({ 
        error: "Failed to process refund",
        code: "REFUND_ERROR",
        details: error.message
      });
    }
  });

  // Subscription routes (mock for now)
  app.post("/payments/subscription/create", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const { planId } = request.body as { planId: string };

    try {
      // Mock subscription creation
      return {
        success: true,
        data: {
          subscriptionId: 'sub_' + Date.now(),
          planId,
          status: 'active',
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      };
    } catch (error: any) {
      return reply.code(500).send({ 
        error: "Failed to create subscription",
        code: "SUBSCRIPTION_CREATE_ERROR",
        details: error.message
      });
    }
  });

  app.post("/payments/subscription/cancel", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const { subscriptionId } = request.body as { subscriptionId: string };

    try {
      // Mock subscription cancellation
      return {
        success: true,
        data: {
          subscriptionId,
          status: 'canceled',
          cancel_at_period_end: true,
          message: 'Subscription canceled successfully'
        }
      };
    } catch (error: any) {
      return reply.code(500).send({ 
        error: "Failed to cancel subscription",
        code: "SUBSCRIPTION_CANCEL_ERROR",
        details: error.message
      });
    }
  });

  app.get("/payments/subscription/list", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    try {
      // Mock subscription list
      return {
        success: true,
        data: {
          subscriptions: [
            {
              id: 'sub_1',
              planId: 'premium_monthly',
              status: 'active',
              current_period_start: new Date('2024-01-01'),
              current_period_end: new Date('2024-02-01'),
              amount: 4999 // $49.99
            }
          ]
        }
      };
    } catch (error: any) {
      return reply.code(500).send({ 
        error: "Failed to fetch subscriptions",
        code: "SUBSCRIPTION_LIST_ERROR",
        details: error.message
      });
    }
  });
}