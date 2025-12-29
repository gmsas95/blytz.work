// Proposal Repository - Data Access Layer
import { prisma } from '../utils/prisma.js';

export class ProposalRepository {
  async findById(id: string, include?: any) {
    return await prisma.proposal.findUnique({
      where: { id },
      include
    });
  }

  async findByJobPostingId(jobPostingId: string) {
    return await prisma.proposal.findMany({
      where: { jobPostingId },
      include: {
        vaProfile: {
          include: {
            user: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findByVAProfileId(vaProfileId: string) {
    return await prisma.proposal.findMany({
      where: { vaProfileId },
      include: {
        jobPosting: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async create(data: {
    jobPostingId: string;
    vaProfileId: string;
    coverLetter: string;
    bidAmount: number;
    bidType: string;
    hourlyRate?: number;
    estimatedHours?: number;
    deliveryTime: string;
    attachments?: any;
  }) {
    return await prisma.proposal.create({
      data,
      include: {
        jobPosting: true,
        vaProfile: true
      }
    });
  }

  async update(id: string, data: any) {
    return await prisma.proposal.update({
      where: { id },
      data,
      include: {
        jobPosting: true,
        vaProfile: true
      }
    });
  }

  async updateStatus(id: string, status: string, jobId?: string, respondedAt?: Date) {
    return await prisma.proposal.update({
      where: { id },
      data: {
        status,
        jobId,
        respondedAt
      }
    });
  }

  async countByJobPostingId(jobPostingId: string): Promise<number> {
    return await prisma.proposal.count({
      where: { jobPostingId }
    });
  }
}
