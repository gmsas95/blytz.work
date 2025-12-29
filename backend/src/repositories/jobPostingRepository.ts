// Job Posting Repository - Data Access Layer
import { prisma } from '../utils/prisma.js';

export class JobPostingRepository {
  async findById(id: string, include?: any) {
    return await prisma.jobPosting.findUnique({
      where: { id },
      include
    });
  }

  async findByCompanyId(companyId: string, pagination?: { skip?: number; take?: number }) {
    return await prisma.jobPosting.findMany({
      where: { companyId },
      ...pagination,
      include: {
        company: true,
        proposals: {
          include: {
            vaProfile: true
          },
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async search(filters: any, pagination?: { skip?: number; take?: number }) {
    return await prisma.jobPosting.findMany({
      where: filters,
      ...pagination,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            verificationLevel: true
          }
        },
        proposals: {
          select: {
            id: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async create(data: any) {
    return await prisma.jobPosting.create({
      data,
      include: {
        company: true
      }
    });
  }

  async update(id: string, data: any) {
    return await prisma.jobPosting.update({
      where: { id },
      data,
      include: {
        company: true
      }
    });
  }

  async updateStatus(id: string, status: string) {
    return await prisma.jobPosting.update({
      where: { id },
      data: { status }
    });
  }

  async delete(id: string) {
    return await prisma.jobPosting.delete({
      where: { id }
    });
  }

  async incrementViews(id: string) {
    return await prisma.jobPosting.update({
      where: { id },
      data: { views: { increment: 1 } }
    });
  }

  async incrementProposalCount(id: string) {
    return await prisma.jobPosting.update({
      where: { id },
      data: { proposalCount: { increment: 1 } }
    });
  }

  async count(filters?: any): Promise<number> {
    return await prisma.jobPosting.count({ where: filters });
  }
}
