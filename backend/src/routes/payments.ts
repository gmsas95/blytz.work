// Enhanced Payment and Revenue Management System
import { FastifyInstance } from "fastify";
import { prisma } from "../utils/prisma.js";
import { verifyAuth } from "../plugins/firebaseAuth.js";
import { z } from "zod";

// Validation schemas
const createPaymentSchema = z.object({
  jobId: z.string().optional(),
  contractId: z.string().optional(),
  milestoneId: z.string().optional(),
  receiverId: z.string(),
  amount: z.number().min(100), // Minimum $1.00
  method: z.enum(["card", "bank", "crypto"]).default("card"),
  type: z.enum(["payment", "refund", "payout"]).default("payment"),
  metadata: z.any().optional()
});

const createInvoiceSchema = z.object({
  contractId: z.string(),
  items: z.array(z.object({
    id: z.string(),
    description: z.string(),
    quantity: z.number().min(1),
    amount: z.number().min(0)
  })),
  dueDate: z.string(),
  currency: z.string().default("USD"),
  taxRate: z.number().default(0),
  discount: z.number().default(0),
  notes: z.string().optional()
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
  // Create payment intent
  app.post("/payments/intent", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const data = createPaymentSchema.parse(request.body);

    try {
      // Validate receiver
      if (user.role === 'company' && user.uid === data.receiverId) {
        return reply.code(400).send({ 
          error: "Cannot pay yourself",
          code: "SELF_PAYMENT_ERROR"
        });
      }

      // Get contract or job details if provided
      let contract, job, milestone;
      if (data.contractId) {
        contract = await prisma.contract.findUnique({
          where: { id: data.contractId },
          include: {
            vaProfile: true,
            company: true
          }
        });

        if (!contract || contract.company.userId !== user.uid) {
          return reply.code(403).send({ 
            error: "Access denied to this contract",
            code: "CONTRACT_ACCESS_DENIED"
          });
        }

        if (data.receiverId !== contract.vaProfile.userId) {
          return reply.code(400).send({ 
            error: "Invalid receiver for this contract",
            code: "INVALID_RECEIVER"
          });
        }
      }

      if (data.milestoneId) {
        milestone = await prisma.milestone.findUnique({
          where: { id: data.milestoneId },
          include: {
            contract: {
              include: {
                company: true,
                vaProfile: true
              }
            }
          }
        });

        if (!milestone || milestone.contract.company.userId !== user.uid) {
          return reply.code(403).send({ 
            error: "Access denied to this milestone",
            code: "MILESTONE_ACCESS_DENIED"
          });
        }

        if (data.receiverId !== milestone.contract.vaProfile.userId) {
          return reply.code(400).send({ 
            error: "Invalid receiver for this milestone",
            code: "INVALID_RECEIVER"
          });
        }
      }

      // Calculate platform fee (10%)
      const platformFeePercentage = parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || "10");
      const platformFeeCents = Math.round((data.amount * 100) * (platformFeePercentage / 100));
      const totalAmountCents = Math.round(data.amount * 100);

      // Create Stripe payment intent
      const paymentIntent = await createStripePaymentIntent({
        amount: totalAmountCents,
        currency: 'usd',
        metadata: {
          payerId: user.uid,
          receiverId: data.receiverId,
          contractId: data.contractId || '',
          milestoneId: data.milestoneId || '',
          jobId: data.jobId || '',
          type: data.type
        }
      });

      // Create payment record
      const payment = await prisma.payment.create({
        data: {
          jobId: data.jobId,
          contractId: data.contractId,
          milestoneId: data.milestoneId,
          userId: user.uid,
          receiverId: data.receiverId,
          stripePaymentIntentId: paymentIntent.id,
          amount: totalAmountCents,
          status: 'pending',
          stripeFee: Math.round(totalAmountCents * 0.029 + 30), // 2.9% + $0.30
          platformFee: platformFeeCents,
          method: data.method,
          type: data.type,
          metadata: data.metadata,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      return {
        success: true,
        data: {
          paymentIntent,
          paymentId: payment.id,
          clientSecret: paymentIntent.client_secret,
          amount: data.amount,
          platformFee: platformFeeCents / 100,
          totalAmount: totalAmountCents / 100
        }
      };
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

  // Confirm payment
  app.post("/payments/confirm", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const { paymentIntentId } = request.body as { paymentIntentId: string };
    const user = request.user as any;

    try {
      // Verify payment intent
      const paymentIntent = await verifyStripePaymentIntent(paymentIntentId);
      if (!paymentIntent || paymentIntent.status !== 'succeeded') {
        return reply.code(400).send({ 
          error: "Payment not successful",
          code: "PAYMENT_FAILED"
        });
      }

      // Update payment record
      const payment = await prisma.payment.update({
        where: { stripePaymentIntentId: paymentIntentId },
        data: {
          status: 'succeeded',
          processedAt: new Date(),
          updatedAt: new Date()
        },
        include: {
          contract: true,
          milestone: { include: { job: { select: { id: true, title: true } } }, },
          job: true
        }
      });

      // Update related records
      await updatePaymentRelatedRecords(payment);

      // Create notifications
      await createPaymentNotifications(payment);

      // Update user earnings and spending
      await updateUserFinancialStats(payment);

      return {
        success: true,
        data: payment,
        message: "Payment confirmed successfully"
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
  app.get("/payments/status/:paymentId", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const { paymentId } = request.params as { paymentId: string };
    const user = request.user as any;

    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          contract: {
            select: { id: true, title: true, status: true }
          },
          milestone: {
            select: { id: true, title: true, status: true }
          },
          job: {
            select: { id: true, title: true, status: true }
          }
        }
      });

      if (!payment) {
        return reply.code(404).send({ 
          error: "Payment not found",
          code: "PAYMENT_NOT_FOUND"
        });
      }

      // Verify access
      if (payment.userId !== user.uid && payment.receiverId !== user.uid) {
        return reply.code(403).send({ 
          error: "Access denied",
          code: "PAYMENT_ACCESS_DENIED"
        });
      }

      return {
        success: true,
        data: payment
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
    const { 
      type, // "sent" | "received" | "all"
      status,
      page = 1, 
      limit = 20,
      startDate,
      endDate
    } = request.query as { 
      type?: string;
      status?: string;
      page: string; 
      limit: string;
      startDate?: string;
      endDate?: string;
    };

    try {
      let whereClause: any = {};
      
      // Filter by user role
      if (type === 'sent') {
        whereClause.userId = user.uid;
      } else if (type === 'received') {
        whereClause.receiverId = user.uid;
      } else {
        whereClause.OR = [
          { userId: user.uid },
          { receiverId: user.uid }
        ];
      }

      // Add filters
      if (status) whereClause.status = status;
      if (startDate) whereClause.createdAt = { gte: new Date(startDate) };
      if (endDate) whereClause.createdAt = { lte: new Date(endDate) };

      const payments = await prisma.payment.findMany({
        where: whereClause,
        include: {
          contract: {
            select: { id: true, title: true, status: true }
          },
          milestone: {
            select: { id: true, title: true, status: true }
          },
          job: {
            select: { id: true, title: true, status: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: (parseInt(page) - 1) * parseInt(limit)
      });

      const total = await prisma.payment.count({ where: whereClause });

      return {
        success: true,
        data: {
          payments,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / parseInt(limit))
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

  // Process refund
  app.post("/payments/refund", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { paymentId, reason, amount } = request.body as {
      paymentId: string;
      reason: string;
      amount?: number;
    };

    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          contract: true
        }
      });

      if (!payment) {
        return reply.code(404).send({ 
          error: "Payment not found",
          code: "PAYMENT_NOT_FOUND"
        });
      }

      // Only payer can request refund
      if (payment.userId !== user.uid) {
        return reply.code(403).send({ 
          error: "Only the payer can request a refund",
          code: "REFUND_ACCESS_DENIED"
        });
      }

      // Process Stripe refund
      const refund = await createStripeRefund({
        paymentIntentId: payment.stripePaymentIntentId,
        amount: amount ? Math.round(amount * 100) : payment.amount,
        reason: 'requested_by_customer'
      });

      if (!refund.success) {
        return reply.code(400).send({ 
          error: "Refund failed",
          code: "REFUND_FAILED",
          details: refund.error
        });
      }

      // Update payment record
      const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'refunded',
          refundAmount: Math.round((amount || (payment.amount / 100)) * 100),
          refundedAt: new Date(),
          updatedAt: new Date(),
          metadata: {
            ...payment.metadata,
            refundReason: reason
          }
        }
      });

      // Create notifications
      await createRefundNotifications(updatedPayment, reason);

      return {
        success: true,
        data: updatedPayment,
        message: "Refund processed successfully"
      };
    } catch (error: any) {
      return reply.code(500).send({ 
        error: "Failed to process refund",
        code: "REFUND_ERROR",
        details: error.message
      });
    }
  });

  // Dispute resolution
  app.post("/payments/disputes", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const data = disputeResolutionSchema.parse(request.body);

    try {
      const payment = await prisma.payment.findUnique({
        where: { stripePaymentIntentId: data.paymentId },
        include: {
          contract: true,
          milestone: true
        }
      });

      if (!payment) {
        return reply.code(404).send({ 
          error: "Payment not found",
          code: "PAYMENT_NOT_FOUND"
        });
      }

      // Verify access
      const hasAccess = payment.userId === user.uid || payment.receiverId === user.uid;
      if (!hasAccess) {
        return reply.code(403).send({ 
          error: "Access denied",
          code: "DISPUTE_ACCESS_DENIED"
        });
      }

      // Handle dispute type
      if (data.type === 'refund') {
        // Process refund
        await processDisputeRefund(payment, data.reason, data.amount);
      } else if (data.type === 'escalate') {
        // Create dispute record and notify admin
        await createDisputeRecord(payment, user.uid, data.reason, data.description);
      } else if (data.type === 'resolve') {
        // Mark dispute as resolved
        await resolveDispute(payment, user.uid, data.resolution);
      }

      return {
        success: true,
        message: `Dispute ${data.type} processed successfully`
      };
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ 
          error: "Validation error",
          code: "VALIDATION_ERROR",
          details: error.errors
        });
      }

      return reply.code(500).send({ 
        error: "Failed to process dispute",
        code: "DISPUTE_ERROR",
        details: error.message
      });
    }
  });

  // Get user financial summary
  app.get("/payments/summary", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { period = 'all' } = request.query as { period?: string };

    try {
      let dateFilter: any = {};
      if (period === 'month') {
        dateFilter.createdAt = { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
      } else if (period === 'year') {
        dateFilter.createdAt = { gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) };
      }

      // Get financial data
      const sentPayments = await prisma.payment.findMany({
        where: {
          userId: user.uid,
          status: 'succeeded',
          ...dateFilter
        }
      });

      const receivedPayments = await prisma.payment.findMany({
        where: {
          receiverId: user.uid,
          status: 'succeeded',
          ...dateFilter
        }
      });

      // Calculate totals
      const totalSent = sentPayments.reduce((sum, p) => sum + (p.amount - p.platformFee), 0) / 100;
      const totalReceived = receivedPayments.reduce((sum, p) => sum + (p.amount - p.stripeFee - p.platformFee), 0) / 100;
      const totalPlatformFees = [...sentPayments, ...receivedPayments].reduce((sum, p) => sum + p.platformFee, 0) / 100;

      // Get user earnings
      let userEarnings = 0;
      if (user.role === 'va') {
        const vaProfile = await prisma.vAProfile.findUnique({
          where: { userId: user.uid }
        });
        userEarnings = vaProfile?.earnedAmount || 0;
      }

      // Get company spending
      let companySpending = 0;
      if (user.role === 'company') {
        const company = await prisma.company.findUnique({
          where: { userId: user.uid }
        });
        companySpending = company?.totalSpent || 0;
      }

      return {
        success: true,
        data: {
          summary: {
            totalSent,
            totalReceived,
            netEarnings: totalReceived - totalSent,
            totalPlatformFees,
            userEarnings,
            companySpending
          },
          transactions: {
            sentCount: sentPayments.length,
            receivedCount: receivedPayments.length,
            totalCount: sentPayments.length + receivedPayments.length
          },
          period
        }
      };
    } catch (error: any) {
      return reply.code(500).send({ 
        error: "Failed to fetch financial summary",
        code: "SUMMARY_ERROR",
        details: error.message
      });
    }
  });

  // Create invoice
  app.post("/payments/invoices", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const data = createInvoiceSchema.parse(request.body);

    try {
      // Verify contract access
      const contract = await prisma.contract.findUnique({
        where: { id: data.contractId },
        include: {
          company: true,
          vaProfile: true
        }
      });

      if (!contract || contract.company.userId !== user.uid) {
        return reply.code(403).send({ 
          error: "Access denied",
          code: "INVOICE_ACCESS_DENIED"
        });
      }

      // Calculate invoice totals
      const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.amount), 0);
      const taxAmount = subtotal * (data.taxRate / 100);
      const totalAmount = subtotal + taxAmount - data.discount;

      // Create invoice record
      const invoice = await prisma.invoice.create({
        data: {
          contractId: data.contractId,
          userId: user.uid,
          receiverId: contract.vaProfile.userId,
          invoiceNumber: generateInvoiceNumber(),
          items: data.items,
          subtotal,
          taxRate: data.taxRate,
          taxAmount,
          discount: data.discount,
          totalAmount,
          dueDate: new Date(data.dueDate),
          currency: data.currency,
          notes: data.notes,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      // Create notification for VA
      await createInvoiceNotification(invoice, contract.vaProfile.userId);

      return reply.code(201).send({
        success: true,
        data: invoice,
        message: "Invoice created successfully"
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
        error: "Failed to create invoice",
        code: "INVOICE_ERROR",
        details: error.message
      });
    }
  });

  // Helper functions
  async function createStripePaymentIntent(data: any) {
    // Mock implementation - would integrate with actual Stripe
    return {
      id: 'pi_' + Date.now(),
      client_secret: 'pi_' + Date.now() + '_secret_' + Math.random().toString(36).substr(2, 9),
      status: 'requires_payment_method',
      amount: data.amount,
      currency: data.currency
    };
  }

  async function verifyStripePaymentIntent(paymentIntentId: string) {
    // Mock implementation
    return {
      id: paymentIntentId,
      status: 'succeeded',
      amount: 2999
    };
  }

  async function createStripeRefund(data: any) {
    // Mock implementation
    return {
      success: true,
      id: 're_' + Date.now(),
      amount: data.amount
    };
  }

  async function updatePaymentRelatedRecords(payment: any) {
    // Update contract total paid
    if (payment.contractId) {
      await prisma.contract.update({
        where: { id: payment.contractId },
        data: {
          totalPaid: { increment: payment.amount }
        }
      });
    }

    // Update milestone status if paying for milestone
    if (payment.milestoneId) {
      await prisma.milestone.update({
        where: { id: payment.milestoneId },
        data: {
          status: 'approved',
          approvedAt: new Date()
        }
      });
    }
  }

  async function createPaymentNotifications(payment: any) {
    // Notify receiver
    await prisma.notification.create({
      data: {
        userId: payment.receiverId,
        type: "payment_received",
        title: "Payment Received",
        message: `You received $${(payment.amount / 100).toFixed(2)} for your work`,
        data: { paymentId: payment.id },
        priority: 'high'
      }
    });

    // Notify payer
    await prisma.notification.create({
      data: {
        userId: payment.userId,
        type: "payment_sent",
        title: "Payment Sent",
        message: `Your payment of $${(payment.amount / 100).toFixed(2)} has been processed`,
        data: { paymentId: payment.id },
        priority: 'normal'
      }
    });
  }

  async function updateUserFinancialStats(payment: any) {
    // Update VA earnings
    if (payment.receiverId) {
      await prisma.vAProfile.update({
        where: { userId: payment.receiverId },
        data: {
          earnedAmount: { increment: (payment.amount - payment.stripeFee - payment.platformFee) / 100 },
          completedJobs: { increment: 1 }
        }
      });
    }

    // Update company spending
    if (payment.userId) {
      await prisma.company.update({
        where: { userId: payment.userId },
        data: {
          totalSpent: { increment: payment.amount / 100 }
        }
      });
    }
  }

  async function createRefundNotifications(payment: any, reason: string) {
    // Notify both parties
    [payment.userId, payment.receiverId].forEach((userId) => {
      prisma.notification.create({
        data: {
          userId,
          type: "refund_processed",
          title: "Refund Processed",
          message: `A refund of $${(payment.refundAmount / 100).toFixed(2)} has been processed. Reason: ${reason}`,
          data: { paymentId: payment.id, refundAmount: payment.refundAmount },
          priority: 'high'
        }
      });
    });
  }

  async function processDisputeRefund(payment: any, reason: string, amount?: number) {
    // Similar to refund process
    const refund = await createStripeRefund({
      paymentIntentId: payment.stripePaymentIntentId,
      amount: amount ? Math.round(amount * 100) : payment.amount,
      reason: 'dispute'
    });

    if (refund.success) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'refunded',
          refundAmount: amount ? Math.round(amount * 100) : payment.amount,
          refundedAt: new Date(),
          metadata: {
            ...payment.metadata,
            disputeReason: reason
          }
        }
      });
    }
  }

  async function createDisputeRecord(payment: any, userId: string, reason: string, description?: string) {
    // Would create a dispute record in a separate Dispute table
    console.log('Dispute created:', { paymentId: payment.id, userId, reason, description });
  }

  async function resolveDispute(payment: any, userId: string, resolution: string) {
    // Would update dispute record with resolution
    console.log('Dispute resolved:', { paymentId: payment.id, userId, resolution });
  }

  function generateInvoiceNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INV-${year}${month}-${random}`;
  }

  async function createInvoiceNotification(invoice: any, vaUserId: string) {
    await prisma.notification.create({
      data: {
        userId: vaUserId,
        type: "invoice_created",
        title: "New Invoice Created",
        message: `Invoice ${invoice.invoiceNumber} for $${invoice.totalAmount.toFixed(2)} has been created`,
        data: { invoiceId: invoice.id },
        priority: 'normal'
      }
    });
  }
}