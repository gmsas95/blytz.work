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
    throw new Error("Contract not found");
  }

  // Verify access
  let hasAccess = false;
  if (user.role === 'company') {
    const company = await prisma.company.findUnique({
      where: { userId: user.uid }
    });
    hasAccess = company?.id === contract.companyId;
  } else if (user.role === 'va') {
    const vaProfile = await prisma.vAProfile.findUnique({
      where: { userId: user.uid }
    });
    hasAccess = vaProfile?.id === contract.vaProfileId;
  }

  if (!hasAccess) {
    throw new Error("Access denied");
  }

  // Get timesheets
  const timesheets = await prisma.timesheet.findMany({
    where: { contractId },
    orderBy: { date: 'desc' }
  });

  return timesheets;
}

async function deleteTimesheet(timesheetId: string, user: any) {
  // Get timesheet
  const timesheet = await prisma.timesheet.findUnique({
    where: { id: timesheetId },
    include: {
      vaProfile: true
    }
  });

  if (!timesheet) {
    throw new Error("Timesheet not found");
  }

  // Only VAs can delete their own timesheets
  if (user.role !== 'va') {
    throw new Error("Only VAs can delete timesheets");
  }

  const vaProfile = await prisma.vAProfile.findUnique({
    where: { userId: user.uid }
  });

  if (vaProfile?.id !== timesheet.vaProfileId) {
    throw new Error("Access denied");
  }

  // Cannot delete approved timesheets
  if (timesheet.status === 'approved') {
    throw new Error("Cannot delete approved timesheet");
  }

  // Delete timesheet
  await prisma.timesheet.delete({
    where: { id: timesheetId }
  });

  return true;
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
    throw new Error("Contract not found");
  }

  // Verify access
  let hasAccess = false;
  if (user.role === 'company') {
    const company = await prisma.company.findUnique({
      where: { userId: user.uid }
    });
    hasAccess = company?.id === contract.companyId;
  } else if (user.role === 'va') {
    const vaProfile = await prisma.vAProfile.findUnique({
      where: { userId: user.uid }
    });
    hasAccess = vaProfile?.id === contract.vaProfileId;
  }

  if (!hasAccess) {
    throw new Error("Access denied");
  }

  // Get milestones
  const milestones = await prisma.milestone.findMany({
    where: { contractId },
    orderBy: { dueDate: 'asc' }
  });

  return milestones;
}

async function deleteMilestone(milestoneId: string, user: any) {
  // Get milestone
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: {
      contract: {
        include: {
          company: true
        }
      }
    }
  });

  if (!milestone) {
    throw new Error("Milestone not found");
  }

  // Only companies can delete milestones
  if (user.role !== 'company') {
    throw new Error("Only companies can delete milestones");
  }

  const company = await prisma.company.findUnique({
    where: { userId: user.uid }
  });

  if (company?.id !== milestone.contract.companyId) {
    throw new Error("Access denied");
  }

  // Cannot delete completed milestones
  if (['completed', 'approved'].includes(milestone.status)) {
    throw new Error("Cannot delete completed milestones");
  }

  // Delete milestone
  await prisma.milestone.delete({
    where: { id: milestoneId }
  });

  return true;
}

async function calculateContractMetrics(contract: any) {
  const totalMilestones = contract.milestones.length;
  const completedMilestones = contract.milestones.filter((m: any) => m.status === 'completed').length;
  const approvedMilestones = contract.milestones.filter((m: any) => m.status === 'approved').length;
  
  const totalTimesheets = contract.timesheets.length;
  const approvedTimesheets = contract.timesheets.filter((t: any) => t.status === 'approved').length;
  const totalHours = contract.timesheets
    .filter((t: any) => t.status === 'approved')
    .reduce((sum: number, t: any) => sum + t.totalHours, 0);

  const totalPaid = contract.payments
    .filter((p: any) => p.status === 'succeeded')
    .reduce((sum: number, p: any) => sum + (p.amount / 100), 0);

  return {
    milestoneProgress: totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0,
    milestoneApproved: totalMilestones > 0 ? (approvedMilestones / totalMilestones) * 100 : 0,
    timesheetProgress: totalTimesheets > 0 ? (approvedTimesheets / totalTimesheets) * 100 : 0,
    totalHours,
    totalPaid,
    amountRemaining: contract.amount - totalPaid
  };
}

async function createContractStatusNotifications(contract: any, status: string, triggeredBy: string) {
  // This would be implemented with proper notification system
  console.log('Contract status notification:', { contractId: contract.id, status, triggeredBy });
}

async function createMilestoneStatusNotifications(milestone: any, status: string, triggeredBy: string) {
  // This would be implemented with proper notification system
  console.log('Milestone status notification:', { milestoneId: milestone.id, status, triggeredBy });
}

async function createTimesheetStatusNotifications(timesheet: any, status: string, vaProfileId: string) {
  // This would be implemented with proper notification system
  console.log('Timesheet status notification:', { timesheetId: timesheet.id, status, vaProfileId });
}

async function createContractNotifications(job: any, contract: any, company: any, vaProfileId: string) {
  // This would be implemented with proper notification system
  console.log('Contract creation notification:', { jobId: job.id, contractId: contract.id, companyId: company.id, vaProfileId });
}

export {
  getContractTimesheets,
  deleteTimesheet,
  getContractMilestones,
  deleteMilestone,
  calculateContractMetrics,
  createContractStatusNotifications,
  createMilestoneStatusNotifications,
  createTimesheetStatusNotifications,
  createContractNotifications
};