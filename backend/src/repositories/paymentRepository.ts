// Payment Repository - Data Access Layer
import { prisma } from '../utils/prisma.js';

export class PaymentRepository {
  async findById(id: string) {
    return await prisma.payment.findUnique({
      where: { id },
      include: {
        job: true,
        contract: true,
        match: true,
        user: true
      }
    });
  }

  async findByStripePaymentIntentId(stripePaymentIntentId: string) {
    return await prisma.payment.findUnique({
      where: { stripePaymentIntentId }
    });
  }

  async findByUserId(userId: string, pagination?: { skip?: number; take?: number }) {
    return await prisma.payment.findMany({
      where: { userId },
      ...pagination,
      orderBy: { createdAt: 'desc' }
    });
  }

  async findByReceiverId(receiverId: string, pagination?: { skip?: number; take?: number }) {
    return await prisma.payment.findMany({
      where: { receiverId },
      ...pagination,
      orderBy: { createdAt: 'desc' }
    });
  }

  async findByContractId(contractId: string) {
    return await prisma.payment.findMany({
      where: { contractId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async create(data: {
    jobId?: string;
    contractId?: string;
    milestoneId?: string;
    matchId?: string;
    userId: string;
    receiverId: string;
    stripePaymentIntentId: string;
    amount: number;
    method?: string;
    type?: string;
    metadata?: any;
    stripeFee?: number;
    platformFee?: number;
  }) {
    return await prisma.payment.create({
      data: {
        ...data,
        status: 'pending',
        method: data.method || 'card'
      },
      include: {
        job: true,
        contract: true,
        user: true
      }
    });
  }

  async update(id: string, data: any) {
    return await prisma.payment.update({
      where: { id },
      data
    });
  }

  async updateStatus(id: string, status: string) {
    return await prisma.payment.update({
      where: { id },
      data: { status }
    });
  }

  async updateRefund(id: string, refundData: {
    refundAmount: number;
    refundedAt: Date;
  }) {
    return await prisma.payment.update({
      where: { id },
      data: refundData
    });
  }

  async getTotalByUserId(userId: string) {
    const payments = await prisma.payment.findMany({
      where: { userId },
      select: { amount: true }
    });

    return payments.reduce((sum, p) => sum + p.amount, 0);
  }
}
