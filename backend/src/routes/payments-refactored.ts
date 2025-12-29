// Enhanced Payment and Revenue Management - Refactored with Service Layer
import { FastifyInstance } from "fastify";
import { verifyAuth } from "../plugins/firebaseAuth.js";
import { z } from "zod";
import { PaymentService } from "../services/paymentService.js";
import { ContractRepository } from "../repositories/contractRepository.js";
import { PaymentRepository } from "../repositories/paymentRepository.js";

// Validation schemas
const createPaymentSchema = z.object({
  contractId: z.string().optional(),
  milestoneId: z.string().optional(),
  jobId: z.string().optional(),
  receiverId: z.string(),
  amount: z.number().min(100),
  method: z.enum(["card", "bank", "crypto"]).default("card"),
  metadata: z.any().optional()
});

const disputeResolutionSchema = z.object({
  paymentId: z.string(),
  type: z.enum(["refund", "escalate", "resolve"]),
  reason: z.string(),
  description: z.string().optional(),
  resolution: z.string().optional(),
  amount: z.number().optional()
});

export default async function paymentRoutes(app: FastifyInstance) {
  const paymentService = new PaymentService();
  const contractRepo = new ContractRepository();
  const paymentRepo = new PaymentRepository();

  // Create payment intent
  app.post("/payments/intent", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const data = createPaymentSchema.parse(request.body);

    try {
      // Validate contract access
      if (data.contractId) {
        const contract = await contractRepo.findById(data.contractId, {
          company: true,
          vaProfile: true
        });
        if (!contract || contract.companyId !== user.uid) {
          return reply.code(403).send({
            error: "Access denied to this contract",
            code: "CONTRACT_ACCESS_DENIED"
          });
        }

        if (data.receiverId !== contract.vaProfileId) {
          return reply.code(400).send({
            error: "Invalid receiver for this contract",
            code: "INVALID_RECEIVER"
          });
        }
      }

      const result = await paymentService.createPaymentIntent(data, user);

      return reply.send({
        success: true,
        data: result.data
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          error: "Validation error",
          code: "VALIDATION_ERROR",
          details: error.errors
        });
      }

      return reply.code(500).send({
        error: "Failed to create payment intent",
        code: "PAYMENT_INTENT_ERROR",
        details: error.message
      });
    }
  });

  // Get user payments
  app.get("/payments", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { type = 'sent', page = '1', limit = '20' } = request.query as {
      type: string;
      page: string;
      limit: string;
    };

    try {
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 20;
      const skip = (pageNum - 1) * limitNum;
      let payments;

      if (type === 'sent') {
        payments = await paymentService.getUserPayments(user.uid, pageNum, limitNum);
      } else if (type === 'received') {
        payments = await paymentService.getReceiverPayments(user.uid, pageNum, limitNum);
      }

      return {
        success: true,
        data: payments,
        pagination: {
          page: pageNum,
          limit: limitNum
        }
      };
    } catch (error: any) {
      return reply.code(500).send({
        error: "Failed to fetch payments",
        code: "PAYMENTS_FETCH_ERROR",
        details: error.message
      });
    }
  });

  // Get payment details
  app.get("/payments/:id", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { id } = request.params as { id: string };

    try {
      const payment = await paymentRepo.findById(id);

      if (!payment) {
        return reply.code(404).send({
          error: "Payment not found",
          code: "PAYMENT_NOT_FOUND"
        });
      }

      // Verify access (user is sender or receiver)
      if (payment.userId !== user.uid && payment.receiverId !== user.uid) {
        return reply.code(403).send({
          error: "Access denied",
          code: "ACCESS_DENIED"
        });
      }

      return {
        success: true,
        data: payment
      };
    } catch (error: any) {
      return reply.code(500).send({
        error: "Failed to fetch payment",
        code: "PAYMENT_FETCH_ERROR",
        details: error.message
      });
    }
  });

  // Process refund
  app.post("/payments/:id/refund", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { id } = request.params as { id: string };
    const { reason, amount } = request.body as {
      reason: string;
      amount?: number;
    };

    try {
      // Verify user initiated the payment
      const payment = await paymentRepo.findById(id);
      if (!payment || payment.userId !== user.uid) {
        return reply.code(403).send({
          error: "Only the payer can request a refund",
          code: "ACCESS_DENIED"
        });
      }

      const result = await paymentService.processRefund(id, reason, amount);

      return reply.send({
        success: true,
        data: result.data,
        message: result.message
      });
    } catch (error: any) {
      return reply.code(500).send({
        error: "Failed to process refund",
        code: "REFUND_ERROR",
        details: error.message
      });
    }
  });

  // Resolve dispute
  app.post("/payments/:id/dispute/resolve", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { id } = request.params as { id: string };
    const data = disputeResolutionSchema.parse(request.body);

    try {
      // Verify admin access or user is involved
      const payment = await paymentRepo.findById(id);
      if (!payment) {
        return reply.code(404).send({
          error: "Payment not found",
          code: "PAYMENT_NOT_FOUND"
        });
      }

      if (user.role !== 'admin' &&
          payment.userId !== user.uid &&
          payment.receiverId !== user.uid) {
        return reply.code(403).send({
          error: "Access denied",
          code: "ACCESS_DENIED"
        });
      }

      // Handle dispute resolution
      if (data.type === 'refund') {
        const result = await paymentService.processRefund(id, data.reason, data.amount);
        return reply.send({
          success: true,
          data: result.data,
          message: "Dispute resolved - refund processed"
        });
      } else if (data.type === 'resolve') {
        // Mark dispute as resolved without refund
        await paymentRepo.update(id, {
          metadata: {
            ...(payment.metadata as any || {}),
            disputeStatus: 'resolved',
            disputeResolution: data.resolution,
            resolvedAt: new Date().toISOString()
          }
        });

        return reply.send({
          success: true,
          message: "Dispute resolved successfully"
        });
      } else {
        // Escalate to admin
        await paymentRepo.update(id, {
          metadata: {
            ...(payment.metadata as any || {}),
            disputeStatus: 'escalated',
            escalatedAt: new Date().toISOString()
          }
        });

        return reply.send({
          success: true,
          message: "Dispute escalated to admin"
        });
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          error: "Validation error",
          code: "VALIDATION_ERROR",
          details: error.errors
        });
      }

      return reply.code(500).send({
        error: "Failed to resolve dispute",
        code: "DISPUTE_ERROR",
        details: error.message
      });
    }
  });

  // Get contract payments
  app.get("/contracts/:contractId/payments", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { contractId } = request.params as { contractId: string };

    try {
      const contract = await contractRepo.findById(contractId);

      if (!contract) {
        return reply.code(404).send({
          error: "Contract not found",
          code: "CONTRACT_NOT_FOUND"
        });
      }

      // Verify access
      let hasAccess = false;
      if (user.role === 'company') {
        hasAccess = contract.companyId === (await contractRepo.findById(contractId))?.companyId;
      } else if (user.role === 'va') {
        hasAccess = contract.vaProfileId === user.uid;
      }

      if (!hasAccess) {
        return reply.code(403).send({
          error: "Access denied",
          code: "ACCESS_DENIED"
        });
      }

      const payments = await paymentService.getContractPayments(contractId);

      return {
        success: true,
        data: payments
      };
    } catch (error: any) {
      return reply.code(500).send({
        error: "Failed to fetch contract payments",
        code: "CONTRACT_PAYMENTS_ERROR",
        details: error.message
      });
    }
  });
}
