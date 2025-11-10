import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

// Complete Timesheet and Milestone Management Functions
async function getContractTimesheets(contractId: string, user: any) {
  // Get contract and verify access
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      company: true,
      vaProfile: true
    }
  });

  if (!contract) {
    return { success: false, message: "Contract not found" };
  }

  // Check access permissions
  const isCompany = contract.companyId === user.companyId;
  const isVA = contract.vaProfileId === user.vaProfileId;
  
  if (!isCompany && !isVA) {
    return { success: false, message: "Access denied" };
  }

  // Get timesheets
  const timesheets = await prisma.timesheet.findMany({
    where: { contractId },
    orderBy: { date: 'desc' }
  });

  return {
    success: true,
    timesheets: timesheets,
    contract: contract
  };
}

async function submitTimesheet(timesheetData: any, user: any) {
  // Verify contract access
  const contract = await prisma.contract.findUnique({
    where: { id: timesheetData.contractId }
  });

  if (!contract || contract.vaProfileId !== user.vaProfileId) {
    return { success: false, message: "Access denied" };
  }

  // Create timesheet
  const timesheet = await prisma.timesheet.create({
    data: {
      contractId: timesheetData.contractId,
      vaProfileId: user.vaProfileId,
      date: new Date(timesheetData.date),
      startTime: new Date(timesheetData.startTime),
      endTime: new Date(timesheetData.endTime),
      totalHours: timesheetData.totalHours,
      description: timesheetData.description,
      status: 'pending'
    }
  });

  // Create notification for company
  await prisma.notification.create({
    data: {
      userId: contract.companyId,
      type: 'timesheet_submitted',
      title: 'New Timesheet Submitted',
      message: `${user.name} submitted a timesheet for ${timesheet.totalHours} hours`,
      data: {
        timesheetId: timesheet.id,
        contractId: contract.id
      }
    }
  });

  return {
    success: true,
    timesheet
  };
}

async function approveTimesheet(timesheetId: string, user: any) {
  // Get timesheet
  const timesheet = await prisma.timesheet.findUnique({
    where: { id: timesheetId },
    include: {
      contract: {
        include: {
          company: true,
          vaProfile: true
        }
      }
    }
  });

  if (!timesheet) {
    return { success: false, message: "Timesheet not found" };
  }

  // Verify company access
  if (timesheet.contract.companyId !== user.companyId) {
    return { success: false, message: "Access denied" };
  }

  // Update timesheet status
  const updatedTimesheet = await prisma.timesheet.update({
    where: { id: timesheetId },
    data: {
      status: 'approved',
      approvedAt: new Date(),
      approvedBy: user.id
    }
  });

  // Create notification for VA
  await prisma.notification.create({
    data: {
      userId: timesheet.contract.vaProfileId,
      type: 'timesheet_approved',
      title: 'Timesheet Approved',
      message: `Your timesheet for ${timesheet.totalHours} hours has been approved`,
      data: {
        timesheetId: timesheetId,
        contractId: timesheet.contract.id
      }
    }
  });

  return {
    success: true,
    timesheet: updatedTimesheet
  };
}

async function getContractMilestones(contractId: string, user: any) {
  // Get contract and verify access
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      company: true,
      vaProfile: true
    }
  });

  if (!contract) {
    return { success: false, message: "Contract not found" };
  }

  // Check access permissions
  const isCompany = contract.companyId === user.companyId;
  const isVA = contract.vaProfileId === user.vaProfileId;
  
  if (!isCompany && !isVA) {
    return { success: false, message: "Access denied" };
  }

  // Get milestones
  const milestones = await prisma.milestone.findMany({
    where: { contractId },
    orderBy: { dueDate: 'asc' }
  });

  return {
    success: true,
    milestones: milestones,
    contract: contract
  };
}

async function createMilestone(milestoneData: any, user: any) {
  // Verify contract access
  const contract = await prisma.contract.findUnique({
    where: { id: milestoneData.contractId }
  });

  if (!contract || contract.companyId !== user.companyId) {
    return { success: false, message: "Access denied" };
  }

  // Create milestone
  const milestone = await prisma.milestone.create({
    data: {
      contractId: milestoneData.contractId,
      title: milestoneData.title,
      description: milestoneData.description,
      amount: milestoneData.amount,
      dueDate: milestoneData.dueDate ? new Date(milestoneData.dueDate) : null,
      status: 'pending'
    }
  });

  // Create notification for VA
  await prisma.notification.create({
    data: {
      userId: contract.vaProfileId,
      type: 'milestone_created',
      title: 'New Milestone Created',
      message: `New milestone: ${milestoneData.title}`,
      data: {
        milestoneId: milestone.id,
        contractId: contract.id
      }
    }
  });

  return {
    success: true,
    milestone
  };
}

async function completeMilestone(milestoneId: string, user: any) {
  // Get milestone
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: {
      contract: {
        include: {
          company: true,
          vaProfile: true
        }
      }
    }
  });

  if (!milestone) {
    return { success: false, message: "Milestone not found" };
  }

  // Verify VA access
  if (milestone.contract.vaProfileId !== user.vaProfileId) {
    return { success: false, message: "Access denied" };
  }

  // Update milestone status
  const updatedMilestone = await prisma.milestone.update({
    where: { id: milestoneId },
    data: {
      status: 'completed',
      completedAt: new Date()
    }
  });

  // Create notification for company
  await prisma.notification.create({
    data: {
      userId: milestone.contract.companyId,
      type: 'milestone_completed',
      title: 'Milestone Completed',
      message: `Milestone completed: ${milestone.title}`,
      data: {
        milestoneId: milestoneId,
        contractId: milestone.contract.id
      }
    }
  });

  return {
    success: true,
    milestone: updatedMilestone
  };
}

async function approveMilestone(milestoneId: string, user: any) {
  // Get milestone
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: {
      contract: {
        include: {
          company: true,
          vaProfile: true
        }
      }
    }
  });

  if (!milestone) {
    return { success: false, message: "Milestone not found" };
  }

  // Verify company access
  if (milestone.contract.companyId !== user.companyId) {
    return { success: false, message: "Access denied" };
  }

  // Update milestone status
  const updatedMilestone = await prisma.milestone.update({
    where: { id: milestoneId },
    data: {
      status: 'approved',
      approvedAt: new Date()
    }
  });

  // Create notification for VA
  await prisma.notification.create({
    data: {
      userId: milestone.contract.vaProfileId,
      type: 'milestone_approved',
      title: 'Milestone Approved',
      message: `Your milestone has been approved and is ready for payment`,
      data: {
        milestoneId: milestoneId,
        contractId: milestone.contract.id
      }
    }
  });

  return {
    success: true,
    milestone: updatedMilestone
  };
}

export {
  getContractTimesheets,
  submitTimesheet,
  approveTimesheet,
  getContractMilestones,
  createMilestone,
  completeMilestone,
  approveMilestone
};
