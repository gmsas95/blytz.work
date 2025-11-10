// Contract Management Routes
import { FastifyInstance } from "fastify";
import { prisma } from "../utils/prisma.js";
import { verifyAuth } from "../plugins/firebaseAuth.js";
import { z } from "zod";

// Validation schemas
const createMilestoneSchema = z.object({
  contractId: z.string(),
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  amount: z.number().min(1, "Amount must be at least $1"),
  dueDate: z.string().optional()
});

const createTimesheetSchema = z.object({
  contractId: z.string(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  description: z.string().optional()
});

const updateContractSchema = z.object({
  status: z.enum(["active", "completed", "cancelled", "paused", "terminated"]).optional(),
  endDate: z.string().optional(),
  terms: z.any().optional(),
  deliverables: z.array(z.any()).optional(),
  milestones: z.array(z.any()).optional()
});

export default async function contractRoutes(app: FastifyInstance) {
  // Get user's contracts
  app.get("/contracts", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { 
      status, 
      page = 1, 
      limit = 20,
      type // "active", "completed", "all"
    } = request.query as { 
      status?: string; 
      page: string; 
      limit: string;
      type?: string;
    };

    try {
      let whereClause: any = {};
      
      // Filter by user role
      if (user.role === 'company') {
        const company = await prisma.company.findUnique({
          where: { userId: user.uid }
        });
        if (company) whereClause.companyId = company.id;
      } else if (user.role === 'va') {
        const vaProfile = await prisma.vAProfile.findUnique({
          where: { userId: user.uid }
        });
        if (vaProfile) whereClause.vaProfileId = vaProfile.id;
      }

      // Filter by status
      if (type === 'active') {
        whereClause.status = 'active';
      } else if (type === 'completed') {
        whereClause.status = 'completed';
      } else if (status) {
        whereClause.status = status;
      }

      const contracts = await prisma.contract.findMany({
        where: whereClause,
        include: {
          job: {
            select: {
              id: true, title: true, description: true, status: true,
              createdAt: true, updatedAt: true
            }
          },
          jobPosting: {
            select: {
              id: true, title: true, category: true, tags: true
            }
          },
          vaProfile: {
            select: {
              id: true, name: true, country: true, averageRating: true,
              totalReviews: true, skills: true, avatarUrl: true
            }
          },
          company: {
            select: {
              id: true, name: true, country: true, logoUrl: true,
              verificationLevel: true, totalReviews: true
            }
          },
          proposal: {
            select: {
              id: true, coverLetter: true, bidAmount: true, bidType
            }
          },
          milestones: {
            orderBy: { dueDate: 'asc' }
          },
          _count: {
            select: {
              payments: true,
              timesheets: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: (parseInt(page) - 1) * parseInt(limit)
      });

      const total = await prisma.contract.count({ where: whereClause });

      return {
        success: true,
        data: {
          contracts,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / parseInt(limit))
          }
        }
      };
    } catch (error: any) {
      return reply.code(500).send({ 
        error: "Failed to fetch contracts",
        code: "CONTRACTS_FETCH_ERROR",
        details: error.message
      });
    }
  });

  // Get single contract
  app.get("/contracts/:id", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { id } = request.params as { id: string };

    try {
      const contract = await prisma.contract.findUnique({
        where: { id },
        include: {
          job: {
            include: {
              payments: true
            }
          },
          jobPosting: true,
          vaProfile: {
            select: {
              id: true, name: true, country: true, bio: true, averageRating: true,
              totalReviews: true, skills: true, hourlyRate: true, avatarUrl: true
            }
          },
          company: {
            select: {
              id: true, name: true, country: true, bio: true, logoUrl: true,
              verificationLevel: true, totalReviews: true, website: true
            }
          },
          proposal: {
            include: {
              vaProfile: true
            }
          },
          milestones: {
            orderBy: { dueDate: 'asc' }
          },
          timesheets: {
            orderBy: { date: 'desc' }
          },
          payments: {
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (!contract) {
        return reply.code(404).send({ 
          error: "Contract not found",
          code: "CONTRACT_NOT_FOUND"
        });
      }

      // Verify user has access to this contract
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
        return reply.code(403).send({ 
          error: "Access denied",
          code: "ACCESS_DENIED"
        });
      }

      // Calculate contract metrics
      const metrics = await calculateContractMetrics(contract);

      return {
        success: true,
        data: {
          ...contract,
          metrics
        }
      };
    } catch (error: any) {
      return reply.code(500).send({ 
        error: "Failed to fetch contract",
        code: "CONTRACT_FETCH_ERROR",
        details: error.message
      });
    }
  });

  // Update contract
  app.put("/contracts/:id", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { id } = request.params as { id: string };
    const data = updateContractSchema.parse(request.body);

    try {
      // Verify ownership and permissions
      const contract = await prisma.contract.findUnique({
        where: { id },
        include: {
          company: true,
          vaProfile: true
        }
      });

      if (!contract) {
        return reply.code(404).send({ 
          error: "Contract not found",
          code: "CONTRACT_NOT_FOUND"
        });
      }

      // Check permissions (companies can modify more, VAs have limited access)
      let hasPermission = false;
      if (user.role === 'company') {
        const company = await prisma.company.findUnique({
          where: { userId: user.uid }
        });
        hasPermission = company?.id === contract.companyId;
      } else if (user.role === 'va') {
        const vaProfile = await prisma.vAProfile.findUnique({
          where: { userId: user.uid }
        });
        hasPermission = vaProfile?.id === contract.vaProfileId && 
                       (!data.status || ['completed'].includes(data.status));
      }

      if (!hasPermission) {
        return reply.code(403).send({ 
          error: "Insufficient permissions",
          code: "INSUFFICIENT_PERMISSIONS"
        });
      }

      // Update contract
      const updatedContract = await prisma.contract.update({
        where: { id },
        data: {
          ...data,
          endDate: data.endDate ? new Date(data.endDate) : undefined,
          updatedAt: new Date()
        },
        include: {
          job: true,
          vaProfile: true,
          company: true,
          milestones: true
        }
      });

      // Create notifications
      if (data.status) {
        await createContractStatusNotifications(updatedContract, data.status, user.uid);
      }

      return {
        success: true,
        data: updatedContract,
        message: "Contract updated successfully"
      };
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ 
          error: "Validation error",
          code: "VALIDATION_ERROR",
          details: error.errors
        });
      }

      return reply.code(500).send({ 
        error: "Failed to update contract",
        code: "CONTRACT_UPDATE_ERROR",
        details: error.message
      });
    }
  });

  // Milestone routes
  app.post("/contracts/:id/milestones", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { id } = request.params as { id: string };
    const data = createMilestoneSchema.parse(request.body);

    try {
      // Verify contract ownership (company only can create milestones)
      const contract = await prisma.contract.findUnique({
        where: { id },
        include: {
          company: true
        }
      });

      if (!contract) {
        return reply.code(404).send({ 
          error: "Contract not found",
          code: "CONTRACT_NOT_FOUND"
        });
      }

      if (user.role !== 'company') {
        return reply.code(403).send({ 
          error: "Only companies can create milestones",
          code: "INVALID_ROLE"
        });
      }

      const company = await prisma.company.findUnique({
        where: { userId: user.uid }
      });

      if (company?.id !== contract.companyId) {
        return reply.code(403).send({ 
          error: "Access denied",
          code: "ACCESS_DENIED"
        });
      }

      // Create milestone
      const milestone = await prisma.milestone.create({
        data: {
          ...data,
          contractId: id,
          jobId: contract.jobId,
          status: "pending",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      // Notify VA
      await createMilestoneNotification(milestone, contract.vaProfileId);

      return reply.code(201).send({
        success: true,
        data: milestone,
        message: "Milestone created successfully"
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ 
          error: "Validation error",
          code: "VALIDATION_ERROR",
          details: error.errors
        });
      }

      return reply.code(500).send({ 
        error: "Failed to create milestone",
        code: "MILESTONE_CREATE_ERROR",
        details: error.message
      });
    }
  });

  app.put("/contracts/:id/milestones/:milestoneId", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { id, milestoneId } = request.params as { id: string; milestoneId: string };
    const { status } = request.body as { status: string };

    try {
      // Get milestone and verify access
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

      if (!milestone || milestone.contractId !== id) {
        return reply.code(404).send({ 
          error: "Milestone not found",
          code: "MILESTONE_NOT_FOUND"
        });
      }

      // Check permissions
      let hasPermission = false;
      if (user.role === 'company') {
        const company = await prisma.company.findUnique({
          where: { userId: user.uid }
        });
        hasPermission = company?.id === milestone.contract.companyId && 
                       ['approved', 'rejected'].includes(status);
      } else if (user.role === 'va') {
        const vaProfile = await prisma.vAProfile.findUnique({
          where: { userId: user.uid }
        });
        hasPermission = vaProfile?.id === milestone.contract.vaProfileId && 
                       status === 'completed';
      }

      if (!hasPermission) {
        return reply.code(403).send({ 
          error: "Insufficient permissions",
          code: "INSUFFICIENT_PERMISSIONS"
        });
      }

      // Update milestone
      const updateData: any = { status, updatedAt: new Date() };
      if (status === 'completed') updateData.completedAt = new Date();
      if (status === 'approved') updateData.approvedAt = new Date();

      const updatedMilestone = await prisma.milestone.update({
        where: { id: milestoneId },
        data: updateData
      });

      // Create notifications
      await createMilestoneStatusNotifications(updatedMilestone, status, user.uid);

      return {
        success: true,
        data: updatedMilestone,
        message: `Milestone ${status} successfully`
      };
    } catch (error: any) {
      return reply.code(500).send({ 
        error: "Failed to update milestone",
        code: "MILESTONE_UPDATE_ERROR",
        details: error.message
      });
    }
  });

  // Timesheet routes (for hourly contracts)
  app.post("/contracts/:id/timesheets", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { id } = request.params as { id: string };
    const data = createTimesheetSchema.parse(request.body);

    try {
      // Verify contract ownership (VA only can submit timesheets)
      const contract = await prisma.contract.findUnique({
        where: { id },
        include: {
          vaProfile: true
        }
      });

      if (!contract || contract.contractType !== 'hourly') {
        return reply.code(400).send({ 
          error: "Only hourly contracts allow timesheets",
          code: "INVALID_CONTRACT_TYPE"
        });
      }

      if (user.role !== 'va') {
        return reply.code(403).send({ 
          error: "Only VAs can submit timesheets",
          code: "INVALID_ROLE"
        });
      }

      const vaProfile = await prisma.vAProfile.findUnique({
        where: { userId: user.uid }
      });

      if (vaProfile?.id !== contract.vaProfileId) {
        return reply.code(403).send({ 
          error: "Access denied",
          code: "ACCESS_DENIED"
        });
      }

      // Calculate total hours
      const startTime = new Date(`${data.date}T${data.startTime}`);
      const endTime = new Date(`${data.date}T${data.endTime}`);
      const totalHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

      // Create timesheet
      const timesheet = await prisma.timesheet.create({
        data: {
          contractId: id,
          vaProfileId: contract.vaProfileId,
          date: new Date(data.date),
          startTime: startTime,
          endTime: endTime,
          totalHours,
          description: data.description,
          status: "pending",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      // Notify company
      await createTimesheetNotification(timesheet, contract.companyId);

      return reply.code(201).send({
        success: true,
        data: timesheet,
        message: "Timesheet submitted successfully"
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ 
          error: "Validation error",
          code: "VALIDATION_ERROR",
          details: error.errors
        });
      }

      return reply.code(500).send({ 
        error: "Failed to submit timesheet",
        code: "TIMESHEET_ERROR",
        details: error.message
      });
    }
  });

  app.put("/contracts/:id/timesheets/:timesheetId", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { id, timesheetId } = request.params as { id: string; timesheetId: string };
    const { status } = request.body as { status: "approved" | "rejected" };

    try {
      // Get timesheet and verify access
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

      if (!timesheet || timesheet.contractId !== id) {
        return reply.code(404).send({ 
          error: "Timesheet not found",
          code: "TIMESHEET_NOT_FOUND"
        });
      }

      // Only companies can approve/reject timesheets
      if (user.role !== 'company') {
        return reply.code(403).send({ 
          error: "Only companies can approve timesheets",
          code: "INVALID_ROLE"
        });
      }

      const company = await prisma.company.findUnique({
        where: { userId: user.uid }
      });

      if (company?.id !== timesheet.contract.companyId) {
        return reply.code(403).send({ 
          error: "Access denied",
          code: "ACCESS_DENIED"
        });
      }

      // Update timesheet
      const updateData: any = { status, updatedAt: new Date() };
      if (status === 'approved') {
        updateData.approvedAt = new Date();
        updateData.approvedBy = user.uid;
      }

      const updatedTimesheet = await prisma.timesheet.update({
        where: { id: timesheetId },
        data: updateData
      });

      // Update contract total hours
      if (status === 'approved') {
        await prisma.contract.update({
          where: { id },
          data: {
            totalHours: { increment: timesheet.totalHours }
          }
        });
      }

      // Notify VA
      await createTimesheetStatusNotifications(updatedTimesheet, status, timesheet.vaProfileId);

      return {
        success: true,
        data: updatedTimesheet,
        message: `Timesheet ${status} successfully`
      };
    } catch (error: any) {
      return reply.code(500).send({ 
        error: "Failed to update timesheet",
        code: "TIMESHEET_UPDATE_ERROR",
        details: error.message
      });
    }
  });

  // Helper functions
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
    // Get user IDs for notification
    const vaProfile = await prisma.vAProfile.findUnique({
      where: { id: contract.vaProfileId }
    });
    const company = await prisma.company.findUnique({
      where: { id: contract.companyId }
    });

    if (!vaProfile || !company) return;

    // Notify the other party
    const notifyUserId = triggeredBy === company.userId ? vaProfile.userId : company.userId;
    const statusMessage = {
      'completed': 'Contract has been marked as completed',
      'cancelled': 'Contract has been cancelled',
      'paused': 'Contract has been paused',
      'terminated': 'Contract has been terminated'
    };

    await prisma.notification.create({
      data: {
        userId: notifyUserId,
        type: "contract_status_changed",
        title: "Contract Status Updated",
        message: statusMessage[status] || `Contract status changed to ${status}`,
        data: { contractId: contract.id, status },
        priority: 'high'
      }
    });
  }

  async function createMilestoneNotification(milestone: any, vaProfileId: string) {
    const vaProfile = await prisma.vAProfile.findUnique({
      where: { id: vaProfileId }
    });

    if (vaProfile) {
      await prisma.notification.create({
        data: {
          userId: vaProfile.userId,
          type: "milestone_created",
          title: "New Milestone Created",
          message: `A new milestone "${milestone.title}" has been created for your contract`,
          data: { milestoneId: milestone.id, amount: milestone.amount },
          priority: 'normal'
        }
      });
    }
  }

  async function createMilestoneStatusNotifications(milestone: any, status: string, triggeredBy: string) {
    const contract = await prisma.contract.findUnique({
      where: { id: milestone.contractId },
      include: {
        company: true,
        vaProfile: true
      }
    });

    if (!contract) return;

    // Notify the other party
    const notifyUserId = triggeredBy === contract.company.userId ? contract.vaProfile.userId : contract.company.userId;
    const statusMessage = {
      'completed': `Milestone "${milestone.title}" has been completed`,
      'approved': `Milestone "${milestone.title}" has been approved and funded`,
      'rejected': `Milestone "${milestone.title}" has been rejected`
    };

    await prisma.notification.create({
      data: {
        userId: notifyUserId,
        type: "milestone_status_changed",
        title: "Milestone Status Updated",
        message: statusMessage[status] || `Milestone status changed to ${status}`,
        data: { milestoneId: milestone.id, status, amount: milestone.amount },
        priority: status === 'approved' ? 'high' : 'normal'
      }
    });
  }

  async function createTimesheetNotification(timesheet: any, companyId: string) {
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (company) {
      await prisma.notification.create({
        data: {
          userId: company.userId,
          type: "timesheet_submitted",
          title: "Timesheet Submitted",
          message: `A new timesheet for ${timesheet.totalHours.toFixed(1)} hours has been submitted`,
          data: { timesheetId: timesheet.id, hours: timesheet.totalHours },
          priority: 'normal'
        }
      });
    }
  }

  async function createTimesheetStatusNotifications(timesheet: any, status: string, vaProfileId: string) {
    const vaProfile = await prisma.vAProfile.findUnique({
      where: { id: vaProfileId }
    });

    if (vaProfile) {
      await prisma.notification.create({
        data: {
          userId: vaProfile.userId,
          type: "timesheet_status_changed",
          title: "Timesheet Status Updated",
          message: `Your timesheet for ${timesheet.totalHours.toFixed(1)} hours has been ${status}`,
          data: { timesheetId: timesheet.id, status, hours: timesheet.totalHours },
          priority: status === 'approved' ? 'high' : 'normal'
        }
      });
    }
  }
}