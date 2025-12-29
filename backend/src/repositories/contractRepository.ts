// Contract Repository - Data Access Layer
import { prisma } from '../utils/prisma.js';

export class ContractRepository {
  async findById(id: string, include?: any) {
    return await prisma.contract.findUnique({
      where: { id },
      include
    });
  }

  async findByJobId(jobId: string) {
    return await prisma.contract.findMany({
      where: { jobId }
    });
  }

  async findByCompanyId(companyId: string, pagination?: { skip?: number; take?: number }, include?: any) {
    return await prisma.contract.findMany({
      where: { companyId },
      ...pagination,
      include: include || {
        job: {
          include: {
            vaProfile: true
          }
        },
        jobPosting: true
      }
    });
  }

  async findByVAProfileId(vaProfileId: string, pagination?: { skip?: number; take?: number }) {
    return await prisma.contract.findMany({
      where: { vaProfileId },
      ...pagination,
      include: {
        job: {
          include: {
            company: true
          }
        },
        jobPosting: true
      }
    });
  }

  async create(data: {
    jobId: string;
    jobPostingId: string;
    vaProfileId: string;
    companyId: string;
    proposalId?: string;
    contractType: string;
    amount: number;
    hourlyRate?: number;
    currency?: string;
    startDate: Date;
    endDate?: Date;
    status?: string;
    terms?: any;
    deliverables?: any[];
    milestonesData?: any[];
    paymentSchedule?: string;
  }) {
    return await prisma.contract.create({
      data,
      include: {
        job: true,
        vaProfile: true,
        company: true
      }
    });
  }

  async update(id: string, data: any) {
    return await prisma.contract.update({
      where: { id },
      data,
      include: {
        job: true,
        vaProfile: true,
        company: true
      }
    });
  }

  async updateStatus(id: string, status: string) {
    return await prisma.contract.update({
      where: { id },
      data: { status }
    });
  }

  async count(where?: any): Promise<number> {
    return await prisma.contract.count({ where });
  }

  async findWithAccessCheck(id: string, userId: string, role: string, include?: any) {
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: include || {
        job: {
          include: {
            payments: true
          }
        },
        jobPosting: {
          select: {
            id: true,
            title: true,
            category: true,
            tags: true
          }
        },
        vaProfile: {
          select: {
            id: true,
            name: true,
            country: true,
            bio: true,
            averageRating: true,
            totalReviews: true,
            skills: true,
            hourlyRate: true,
            avatarUrl: true
          }
        },
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            verificationLevel: true
          }
        },
        proposal: {
          select: {
            id: true,
            coverLetter: true,
            bidAmount: true,
            bidType: true,
            deliveryTime: true
          }
        },
        payments: true,
        milestones: true,
        timesheets: true
      }
    });

    return contract;
  }
}
