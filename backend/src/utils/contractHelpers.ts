import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

// Simplified helpers for deployment
export async function submitTimesheet(timesheetData: any, user: any) {
  try {
    const timesheet = await prisma.timesheet.create({
      data: {
        contractId: timesheetData.contractId,
        vaProfileId: user.vaProfileId,
        jobId: timesheetData.jobId,
        date: new Date(timesheetData.date),
        startTime: new Date(timesheetData.startTime),
        endTime: new Date(timesheetData.endTime),
        totalHours: parseFloat(timesheetData.totalHours),
        description: timesheetData.description,
        status: 'pending'
      }
    });

    return { success: true, timesheet };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function approveTimesheet(timesheetId: string, user: any) {
  try {
    const timesheet = await prisma.timesheet.update({
      where: { id: timesheetId },
      data: {
        status: 'approved',
        approvedAt: new Date(),
        approvedBy: user.id
      }
    });

    return { success: true, timesheet };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function createMilestone(milestoneData: any, user: any) {
  try {
    const milestone = await prisma.milestone.create({
      data: {
        contractId: milestoneData.contractId,
        jobId: milestoneData.jobId,
        title: milestoneData.title,
        description: milestoneData.description,
        amount: parseFloat(milestoneData.amount),
        dueDate: milestoneData.dueDate ? new Date(milestoneData.dueDate) : null,
        status: 'pending'
      }
    });

    return { success: true, milestone };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
