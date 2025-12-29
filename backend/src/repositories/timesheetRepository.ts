// Timesheet Repository - Data Access Layer
import { prisma } from '../utils/prisma.js';

export class TimesheetRepository {
  async findById(id: string, include?: any) {
    return await prisma.timesheet.findUnique({
      where: { id },
      include
    });
  }

  async findByContractId(contractId: string) {
    return await prisma.timesheet.findMany({
      where: { contractId },
      orderBy: { date: 'desc' },
      include: {
        contract: true,
        vaProfile: true
      }
    });
  }

  async findByVAProfileId(vaProfileId: string) {
    return await prisma.timesheet.findMany({
      where: { vaProfileId },
      orderBy: { date: 'desc' }
    });
  }

  async findByJobId(jobId: string) {
    return await prisma.timesheet.findMany({
      where: { jobId },
      orderBy: { date: 'desc' }
    });
  }

  async create(data: {
    contractId: string;
    vaProfileId: string;
    jobId: string;
    date: Date;
    startTime: Date;
    endTime: Date;
    totalHours: number;
    description?: string;
    status?: string;
  }) {
    return await prisma.timesheet.create({
      data,
      include: {
        contract: true,
        vaProfile: true
      }
    });
  }

  async update(id: string, data: any) {
    return await prisma.timesheet.update({
      where: { id },
      data,
      include: {
        contract: true,
        vaProfile: true
      }
    });
  }

  async approve(id: string, approvedBy: string, approvedAt: Date) {
    return await prisma.timesheet.update({
      where: { id },
      data: {
        status: 'approved',
        approvedBy,
        approvedAt
      }
    });
  }

  async delete(id: string) {
    return await prisma.timesheet.delete({
      where: { id }
    });
  }
}
