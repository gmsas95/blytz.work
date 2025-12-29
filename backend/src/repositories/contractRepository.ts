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

  async findByCompanyId(companyId: string, pagination?: { skip?: number; take?: number }) {
    return await prisma.contract.findMany({
      where: { companyId },
      ...pagination,
      include: {
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
}
