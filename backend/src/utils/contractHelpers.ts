// Minimal Contract Helpers
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

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
  } catch (error: any) {
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
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
