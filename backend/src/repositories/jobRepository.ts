// Job Repository - Data Access Layer
import { prisma } from '../utils/prisma.js';

export class JobRepository {
  async findById(id: string, include?: any) {
    return await prisma.job.findUnique({
      where: { id },
      include
    });
  }

  async findByCompanyId(companyId: string, pagination?: { skip?: number; take?: number }) {
    return await prisma.job.findMany({
      where: { companyId },
      ...pagination,
      include: {
        vaProfile: true,
        jobPosting: true
      }
    });
  }

  async findByVAProfileId(vaProfileId: string, pagination?: { skip?: number; take?: number }) {
    return await prisma.job.findMany({
      where: { vaProfileId },
      ...pagination,
      include: {
        company: true,
        jobPosting: true
      }
    });
  }

  async findByJobPostingId(jobPostingId: string) {
    return await prisma.job.findMany({
      where: { jobPostingId },
      include: {
        vaProfile: true,
        company: true
      }
    });
  }

  async create(data: {
    jobPostingId: string;
    vaProfileId: string;
    companyId: string;
    status?: string;
    title: string;
    description: string;
    budget?: number;
    hourlyRate?: number;
    totalHours?: number;
    totalAmount?: number;
    startDate?: Date;
    endDate?: Date;
  }) {
    return await prisma.job.create({
      data,
      include: {
        vaProfile: true,
        company: true,
        jobPosting: true
      }
    });
  }

  async update(id: string, data: any) {
    return await prisma.job.update({
      where: { id },
      data,
      include: {
        vaProfile: true,
        company: true
      }
    });
  }

  async updateStatus(id: string, status: string) {
    return await prisma.job.update({
      where: { id },
      data: { status }
    });
  }
}
