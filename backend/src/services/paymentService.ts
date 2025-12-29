// Payment Service - Business Logic Layer
import { PaymentRepository } from '../repositories/paymentRepository.js';
import { ContractRepository } from '../repositories/contractRepository.js';
import { UserRepository } from '../repositories/userRepository.js';
import { NotificationService } from './notificationService.js';

export class PaymentService {
  private paymentRepo: PaymentRepository;
  private contractRepo: ContractRepository;
  private userRepo: UserRepository;
  private notificationService: NotificationService;

  constructor(
    paymentRepo?: PaymentRepository,
    contractRepo?: ContractRepository,
    userRepo?: UserRepository,
    notificationService?: NotificationService
  ) {
    this.paymentRepo = paymentRepo || new PaymentRepository();
    this.contractRepo = contractRepo || new ContractRepository();
    this.userRepo = userRepo || new UserRepository();
    this.notificationService = notificationService || new NotificationService();
  }

  async createPaymentIntent(data: {
    contractId?: string;
    milestoneId?: string;
    jobId?: string;
    receiverId: string;
    amount: number;
    method?: string;
    metadata?: any;
  }, user: any) {
    // Business rule: Cannot pay yourself
    if (user.uid === data.receiverId) {
      throw new Error('Cannot pay yourself');
    }

    // Validate contract access
    if (data.contractId) {
      const contract = await this.contractRepo.findById(data.contractId);
      if (!contract || contract.company.userId !== user.uid) {
        throw new Error('Access denied to this contract');
      }

      // Validate receiver
      if (data.receiverId !== contract.vaProfile.userId) {
        throw new Error('Invalid receiver for this contract');
      }
    }

    // Business rule: Minimum payment amount
    if (data.amount < 100) { // $1.00 in cents
      throw new Error('Minimum payment amount is $1.00');
    }

    // Calculate fees
    const platformFee = this.calculatePlatformFee(data.amount);
    const stripeFee = this.calculateStripeFee(data.amount, data.method);

    // Create Stripe payment intent (simplified - would normally use Stripe SDK)
    const stripePaymentIntentId = `pi_${Date.now()}_${user.uid}`;

    // Create payment record
    const payment = await this.paymentRepo.create({
      contractId: data.contractId,
      milestoneId: data.milestoneId,
      jobId: data.jobId,
      userId: user.uid,
      receiverId: data.receiverId,
      stripePaymentIntentId,
      amount: data.amount,
      method: data.method || 'card',
      type: 'payment',
      metadata: data.metadata,
      stripeFee,
      platformFee
    });

    // Notify receiver
    await this.notificationService.notifyPaymentReceived(
      data.receiverId,
      payment
    );

    return {
      success: true,
      data: {
        paymentIntentId: stripePaymentIntentId,
        amount: data.amount,
        currency: 'usd',
        platformFee,
        stripeFee
      }
    };
  }

  async processRefund(paymentId: string, reason: string, amount?: number) {
    const payment = await this.paymentRepo.findById(paymentId);

    if (!payment) {
      throw new Error('Payment not found');
    }

    // Business rule: Can only refund successful payments
    if (payment.status !== 'succeeded') {
      throw new Error('Can only refund successful payments');
    }

    // Calculate refund amount
    const refundAmount = amount || payment.amount;

    // Update payment record
    await this.paymentRepo.updateRefund(paymentId, {
      refundAmount,
      refundedAt: new Date(),
      status: 'refunded'
    });

    // Notify both parties
    await this.notificationService.notifyRefund(
      payment.userId,
      payment.receiverId,
      refundAmount
    );

    return {
      success: true,
      message: 'Refund processed successfully',
      data: { refundAmount, refundedAt: new Date() }
    };
  }

  async getUserPayments(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    return await this.paymentRepo.findByUserId(userId, { skip, take: limit });
  }

  async getReceiverPayments(receiverId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    return await this.paymentRepo.findByReceiverId(receiverId, { skip, take: limit });
  }

  async getContractPayments(contractId: string) {
    return await this.paymentRepo.findByContractId(contractId);
  }

  private calculatePlatformFee(amount: number): number {
    const feePercentage = parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || '10');
    return Math.round(amount * (feePercentage / 100));
  }

  private calculateStripeFee(amount: number, method: string = 'card'): number {
    // Stripe fees: 2.9% + $0.30 for cards, varies for other methods
    const percentageFee = 0.029;
    const fixedFee = 30; // $0.30 in cents

    return Math.round((amount * percentageFee) + fixedFee);
  }
}
