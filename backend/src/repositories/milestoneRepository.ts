// Milestone Repository - Data Access Layer
import { prisma } from '../utils/prisma.js';

export class MilestoneRepository {
  async findById(id: string, include?: any) {
    return await prisma.milestone.findUnique({
      where: { id },
      include
    });
  }

  async findByContractId(contractId: string) {
    return await prisma.milestone.findMany({
      where: { contractId },
      orderBy: { dueDate: 'asc' }
    });
  }

  async findByJobId(jobId: string) {
    return await prisma.milestone.findMany({
      where: { jobId },
      include: {
        contract: true
      },
      orderBy: { dueDate: 'asc' }
    });
  }

  async create(data: {
    contractId: string;
    jobId: string;
    title: string;
    description?: string;
    amount: number;
    dueDate?: Date;
    status?: string;
  }) {
    return await prisma.milestone.create({
      data,
      include: {
        contract: true,
        job: true
      }
    });
  }

  async update(id: string, data: any) {
    return await prisma.milestone.update({
      where: { id },
      data,
      include: {
        contract: true,
        job: true
      }
    });
  }

  async updateStatus(id: string, status: string, completedAt?: Date, approvedAt?: Date) {
    return await prisma.milestone.update({
      where: { id },
      data: {
        status,
        completedAt,
        approvedAt
      }
    });
  }

  async delete(id: string) {
    return await prisma.milestone.delete({
      where: { id }
    });
  }
}
