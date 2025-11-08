import { FastifyInstance } from "fastify";
import { prisma } from "../utils/prisma.js";
import { requireAuth } from "../plugins/firebaseAuth.js";
import { 
  createPaymentIntentSchema, 
  confirmPaymentSchema,
  CreatePaymentIntent,
  ConfirmPayment
} from "../utils/validation.js";
import { createPaymentIntent, confirmPayment, PLATFORM_FEE_PERCENT } from "../utils/stripe.js";

export default async function paymentRoutes(app: FastifyInstance) {
  // Create payment intent
  app.post("/payments/create-intent", {
    preHandler: [requireAuth],
  }, async (request, reply) => {
    const user = request.user as any;
    const { matchId } = request.body as CreatePaymentIntent;

    try {
      // Verify match belongs to user's company
      const match = await prisma.match.findFirst({
        where: {
          id: matchId,
          jobPosting: {
            company: { userId: user.uid }
          }
        },
          include: {
            jobPosting: { 
              include: { 
                company: { 
                  include: { user: true } 
                } 
              } 
            },
            vaProfile: { include: { user: true } }
          }
      });

      if (!match) {
        return reply.code(404).send({ error: "Match not found" });
      }

      if (match.paymentStatus === "paid") {
        return reply.code(400).send({ error: "Payment already completed for this match" });
      }

      // Calculate amount (flat fee for MVP)
      const baseAmount = 29.99; // $29.99 to unlock contact
      const platformFee = Math.round(baseAmount * PLATFORM_FEE_PERCENT * 100); // in cents
      const totalAmount = Math.round(baseAmount * 100); // in cents

      // Create Stripe payment intent
      const paymentIntent = await createPaymentIntent(matchId, baseAmount);

      // Store payment record
      await prisma.payment.create({
        data: {
          matchId,
          userId: user.uid,
          stripePaymentIntentId: paymentIntent.id,
          amount: totalAmount,
          status: "pending",
          platformFee,
        }
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: baseAmount,
        currency: "usd"
      };
    } catch (error) {
      return reply.code(500).send({ error: "Failed to create payment intent" });
    }
  });

  // Confirm payment and unlock contact
  app.post("/payments/confirm", {
    preHandler: [requireAuth],
  }, async (request, reply) => {
    const user = request.user as any;
    const { paymentIntentId } = request.body as ConfirmPayment;

    try {
      // Confirm payment with Stripe
      const stripePayment = await confirmPayment(paymentIntentId);

      // Find payment record
      const payment = await prisma.payment.findFirst({
        where: {
          stripePaymentIntentId: paymentIntentId,
          userId: user.uid
        },
        include: {
          match: {
            include: {
              jobPosting: { include: { company: true } },
              vaProfile: { include: { user: true } }
            }
          }
        }
      });

      if (!payment) {
        return reply.code(404).send({ error: "Payment not found" });
      }

      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "succeeded",
          stripeFee: Math.round(stripePayment.application_fee_amount || 0),
        }
      });

      // Update match status
      await prisma.match.update({
        where: { id: payment.matchId },
        data: {
          paymentStatus: "paid",
          contactUnlocked: true
        }
      });

      // Return contact information
      const contactInfo = {
        vaEmail: payment.match.vaProfile.user.email,
        vaPhone: payment.match.vaProfile.phone,
        companyEmail: (payment.match.jobPosting.company as any).user.email,
        unlockedAt: new Date().toISOString()
      };

      return contactInfo;
    } catch (error) {
      return reply.code(500).send({ error: "Failed to confirm payment" });
    }
  });

  // Get payment status
  app.get("/payments/status/:matchId", {
    preHandler: [requireAuth],
  }, async (request, reply) => {
    const user = request.user as any;
    const { matchId } = request.params as { matchId: string };

    try {
      const match = await prisma.match.findFirst({
        where: {
          id: matchId,
          jobPosting: {
            company: { userId: user.uid }
          }
        },
        select: {
          paymentStatus: true,
          contactUnlocked: true
        }
      });

      if (!match) {
        return reply.code(404).send({ error: "Match not found" });
      }

      return match;
    } catch (error) {
      return reply.code(500).send({ error: "Failed to get payment status" });
    }
  });
}