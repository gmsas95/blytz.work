// Contract Management - Complete CRUD Implementation
import { FastifyInstance } from "fastify";
import { prisma } from "../utils/prisma.js";
import { verifyAuth } from "../plugins/firebaseAuth-simplified.js";
import { z } from "zod";

// Validation schemas
const createContractSchema = z.object({
  proposalId: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  contractTerms: z.any().optional()
});

const createMilestoneSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  amount: z.number().min(0, "Amount must be positive"),
  dueDate: z.string().optional()
});

const updateMilestoneSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  amount: z.number().min(0).optional(),
  status: z.enum(["pending", "in_progress", "completed"]).optional(),
  dueDate: z.string().optional()
});

const createTimesheetSchema = z.object({
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  description: z.string().optional()
});

const updateTimesheetSchema = z.object({
  date: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  description: z.string().optional()
});

export default async function contractRoutes(app: FastifyInstance) {
  // Create Contract from Proposal
  app.post("/contracts", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const data = createContractSchema.parse(request.body);

    try {
      // Verify user is a company
      if (user.role !== 'company') {
        return reply.code(403).send({
          error: "Only companies can create contracts",
          code: "INVALID_ROLE"
        });
      }

      // Get proposal
      const proposal = await prisma.proposal.findUnique({
        where: { id: data.proposalId },
        include: {
          jobPosting: true
        }
      });

      if (!proposal) {
        return reply.code(404).send({
          error: "Proposal not found",
          code: "PROPOSAL_NOT_FOUND"
        });
      }

      // Get company
      const company = await prisma.company.findUnique({
        where: { userId: user.uid }
      });

      if (!company) {
        return reply.code(404).send({
          error: "Company profile not found",
          code: "COMPANY_NOT_FOUND"
        });
      }

      // Create job
      const job = await prisma.job.create({
        data: {
          jobPostingId: proposal.jobPostingId,
          vaProfileId: proposal.vaProfileId,
          companyId: company.id,
          status: "active",
          title: proposal.jobPosting.title,
          description: proposal.jobPosting.description,
          budget: proposal.bidType === 'fixed' ? proposal.bidAmount : undefined,
          hourlyRate: proposal.bidType === 'hourly' ? proposal.bidAmount : undefined,
          startDate: new Date(data.startDate),
          endDate: data.endDate ? new Date(data.endDate) : undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      // Create contract
      const contract = await prisma.contract.create({
        data: {
          jobId: job.id,
          jobPostingId: proposal.jobPostingId,
          vaProfileId: proposal.vaProfileId,
          companyId: company.id,
          proposalId: proposal.id,
          contractType: proposal.bidType,
          amount: proposal.bidAmount,
          hourlyRate: proposal.bidType === 'hourly' ? proposal.bidAmount : undefined,
          currency: "USD",
          startDate: new Date(data.startDate),
          endDate: data.endDate ? new Date(data.endDate) : undefined,
          status: "active",
          terms: data.contractTerms,
          paymentSchedule: "upon_completion",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      // Update proposal status
      await prisma.proposal.update({
        where: { id: data.proposalId },
        data: {
          status: "accepted",
          jobId: job.id,
          respondedAt: new Date()
        }
      });

      // Update job posting status
      await prisma.jobPosting.update({
        where: { id: proposal.jobPostingId },
        data: { status: "in_progress" }
      });

      return reply.code(201).send({
        success: true,
        data: { job, contract },
        message: "Contract created successfully"
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
        error: "Failed to create contract",
        code: "CONTRACT_CREATE_ERROR",
        details: error.message
      });
    }
  });

  // Get User Contracts
  app.get("/contracts", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { type = 'active', page = 1, limit = 20 } = request.query as {
      type: string;
      page: string;
      limit: string;
    };

    try {
      let whereClause: any = {};

      if (user.role === 'company') {
        const company = await prisma.company.findUnique({
          where: { userId: user.uid }
        });
        if (company) {
          whereClause.companyId = company.id;
        }
      } else if (user.role === 'va') {
        const vaProfile = await prisma.vAProfile.findUnique({
          where: { userId: user.uid }
        });
        if (vaProfile) {
          whereClause.vaProfileId = vaProfile.id;
        }
      }

      if (type === 'active') {
        whereClause.status = { in: ['active', 'paused'] };
      } else if (type === 'completed') {
        whereClause.status = 'completed';
      }

      const contracts = await prisma.contract.findMany({
        where: whereClause,
        include: {
          job: {
            select: {
              id: true,
              title: true,
              description: true,
              status: true,
              createdAt: true,
              updatedAt: true
            }
          },
          jobPosting: {
            select: {
              id: true,
              title: true,
              category: true,
              tags: true
            }
          },
          vaProfile: {
            select: {
              id: true,
              name: true,
              country: true,
              bio: true,
              averageRating: true,
              totalReviews: true,
              skills: true,
              hourlyRate: true,
              avatarUrl: true
            }
          },
          company: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
              verificationLevel: true,
              // totalReviews: true, // Removed as it doesn't exist on Company model
            }
          },
          proposal: {
            select: {
              id: true,
              coverLetter: true,
              bidAmount: true,
              bidType: true
            }
          },
          _count: {
            select: {
              milestones: true,
              payments: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: typeof limit === 'string' ? parseInt(limit) : limit,
        skip: ((typeof page === 'string' ? parseInt(page) : page) - 1) * (typeof limit === 'string' ? parseInt(limit) : limit)
      });

      const total = await prisma.contract.count({ where: whereClause });

      return {
        success: true,
        data: {
          contracts,
          pagination: {
            page: typeof page === 'string' ? parseInt(page) : page,
            limit: typeof limit === 'string' ? parseInt(limit) : limit,
            total,
            totalPages: Math.ceil(total / (typeof limit === 'string' ? parseInt(limit) : limit))
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

  // Get Single Contract
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
          jobPosting: {
            select: {
              id: true,
              title: true,
              category: true,
              tags: true
            }
          },
          vaProfile: {
            select: {
              id: true,
              name: true,
              country: true,
              bio: true,
              averageRating: true,
              totalReviews: true,
              skills: true,
              hourlyRate: true,
              avatarUrl: true
            }
          },
          company: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
              verificationLevel: true,
              // totalReviews: true, // Removed as it doesn't exist on Company model
            }
          },
          proposal: {
            select: {
              id: true,
              coverLetter: true,
              bidAmount: true,
              bidType: true,
              deliveryTime: true
            }
          },
          payments: true,
          milestones: true,
          timesheets: true
        }
      });

      if (!contract) {
        return reply.code(404).send({
          error: "Contract not found",
          code: "CONTRACT_NOT_FOUND"
        });
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
        return reply.code(403).send({
          error: "Access denied",
          code: "ACCESS_DENIED"
        });
      }

      return {
        success: true,
        data: contract
      };
    } catch (error: any) {
      return reply.code(500).send({
        error: "Failed to fetch contract",
        code: "CONTRACT_FETCH_ERROR",
        details: error.message
      });
    }
  });

  // Update Contract
  app.put("/contracts/:id", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { id } = request.params as { id: string };
    const { status } = request.body as { status: string };

    try {
      const contract = await prisma.contract.findUnique({
        where: { id }
      });

      if (!contract) {
        return reply.code(404).send({
          error: "Contract not found",
          code: "CONTRACT_NOT_FOUND"
        });
      }

      // Only companies can update contract status
      if (user.role !== 'company') {
        return reply.code(403).send({
          error: "Only companies can update contracts",
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

      const updateData: any = { status, updatedAt: new Date() };
      if (status === 'completed') {
        updateData.endDate = new Date();
      }

      const updatedContract = await prisma.contract.update({
        where: { id },
        data: updateData
      });

      return {
        success: true,
        data: updatedContract,
        message: `Contract ${status} successfully`
      };
    } catch (error: any) {
      return reply.code(500).send({
        error: "Failed to update contract",
        code: "CONTRACT_UPDATE_ERROR",
        details: error.message
      });
    }
  });

  // Create Milestone
  app.post("/contracts/:id/milestones", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { id } = request.params as { id: string };
    const data = createMilestoneSchema.parse(request.body);

    try {
      // Get contract and verify access
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

      // Only companies can create milestones
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
          contractId: id,
          jobId: contract.jobId,
          title: data.title,
          description: data.description,
          amount: data.amount,
          dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

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

  // Update Milestone
  app.put("/milestones/:milestoneId", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { milestoneId } = request.params as { milestoneId: string };
    const data = updateMilestoneSchema.parse(request.body);

    try {
      // Get milestone and verify access
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
        return reply.code(404).send({
          error: "Milestone not found",
          code: "MILESTONE_NOT_FOUND"
        });
      }

      // Verify access
      let hasAccess = false;
      if (user.role === 'company') {
        const company = await prisma.company.findUnique({
          where: { userId: user.uid }
        });
        hasAccess = company?.id === milestone.contract.companyId;
      } else if (user.role === 'va') {
        const vaProfile = await prisma.vAProfile.findUnique({
          where: { userId: user.uid }
        });
        const contract = await prisma.contract.findUnique({
          where: { id: milestone.contractId }
        });
        hasAccess = vaProfile?.id === contract?.vaProfileId;
      }

      if (!hasAccess) {
        return reply.code(403).send({
          error: "Access denied",
          code: "ACCESS_DENIED"
        });
      }

      // Update milestone
      const updatedMilestone = await prisma.milestone.update({
        where: { id: milestoneId },
        data: {
          ...data,
          updatedAt: new Date()
        }
      });

      return {
        success: true,
        data: updatedMilestone,
        message: "Milestone updated successfully"
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
        error: "Failed to update milestone",
        code: "MILESTONE_UPDATE_ERROR",
        details: error.message
      });
    }
  });

  // Get Contract Milestones
  app.get("/contracts/:id/milestones", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { id } = request.params as { id: string };

    try {
      // Get contract and verify access
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
        return reply.code(403).send({
          error: "Access denied",
          code: "ACCESS_DENIED"
        });
      }

      // Get milestones
      const milestones = await prisma.milestone.findMany({
        where: { contractId: id },
        orderBy: { dueDate: 'asc' }
      });

      return {
        success: true,
        data: milestones
      };
    } catch (error: any) {
      return reply.code(500).send({
        error: "Failed to fetch milestones",
        code: "MILESTONES_FETCH_ERROR",
        details: error.message
      });
    }
  });

  // Delete Milestone
  app.delete("/milestones/:milestoneId", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { milestoneId } = request.params as { milestoneId: string };

    try {
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
        return reply.code(404).send({
          error: "Milestone not found",
          code: "MILESTONE_NOT_FOUND"
        });
      }

      // Only companies can delete milestones
      if (user.role !== 'company') {
        return reply.code(403).send({
          error: "Only companies can delete milestones",
          code: "INVALID_ROLE"
        });
      }

      const company = await prisma.company.findUnique({
        where: { userId: user.uid }
      });

      if (company?.id !== milestone.contract.companyId) {
        return reply.code(403).send({
          error: "Access denied",
          code: "ACCESS_DENIED"
        });
      }

      // Cannot delete completed milestones
      if (['completed', 'approved'].includes(milestone.status)) {
        return reply.code(400).send({
          error: "Cannot delete completed milestones",
          code: "MILESTONE_COMPLETED"
        });
      }

      // Delete milestone
      await prisma.milestone.delete({
        where: { id: milestoneId }
      });

      return {
        success: true,
        message: "Milestone deleted successfully"
      };
    } catch (error: any) {
      return reply.code(500).send({
        error: "Failed to delete milestone",
        code: "MILESTONE_DELETE_ERROR",
        details: error.message
      });
    }
  });

  // Create Timesheet
  app.post("/contracts/:id/timesheets", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { id } = request.params as { id: string };
    const data = createTimesheetSchema.parse(request.body);

    try {
      // Get contract and verify access
      const contract = await prisma.contract.findUnique({
        where: { id },
        include: {
          vaProfile: true
        }
      });

      if (!contract) {
        return reply.code(404).send({
          error: "Contract not found",
          code: "CONTRACT_NOT_FOUND"
        });
      }

      // Only VAs can create timesheets
      if (user.role !== 'va') {
        return reply.code(403).send({
          error: "Only VAs can create timesheets",
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
      const startTime = new Date(data.startTime);
      const endTime = new Date(data.endTime);
      const totalHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

      // Create timesheet
      const timesheet = await prisma.timesheet.create({
        data: {
          contractId: id,
          jobId: contract.jobId,
          vaProfileId: contract.vaProfileId,
          date: new Date(data.date),
          startTime,
          endTime,
          totalHours,
          description: data.description,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      return reply.code(201).send({
        success: true,
        data: timesheet,
        message: "Timesheet created successfully"
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
        error: "Failed to create timesheet",
        code: "TIMESHEET_CREATE_ERROR",
        details: error.message
      });
    }
  });

  // Update Timesheet
  app.put("/timesheets/:timesheetId", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { timesheetId } = request.params as { timesheetId: string };
    const data = updateTimesheetSchema.parse(request.body);

    try {
      // Get timesheet and verify access
      const timesheet = await prisma.timesheet.findUnique({
        where: { id: timesheetId },
        include: {
          vaProfile: true
        }
      });

      if (!timesheet) {
        return reply.code(404).send({
          error: "Timesheet not found",
          code: "TIMESHEET_NOT_FOUND"
        });
      }

      // Only VAs can update their own timesheets
      if (user.role !== 'va') {
        return reply.code(403).send({
          error: "Only VAs can update timesheets",
          code: "INVALID_ROLE"
        });
      }

      const vaProfile = await prisma.vAProfile.findUnique({
        where: { userId: user.uid }
      });

      if (vaProfile?.id !== timesheet.vaProfileId) {
        return reply.code(403).send({
          error: "Access denied",
          code: "ACCESS_DENIED"
        });
      }

      // Cannot update approved timesheets
      if (timesheet.status === 'approved') {
        return reply.code(400).send({
          error: "Cannot update approved timesheet",
          code: "TIMESHEET_APPROVED"
        });
      }

      // Calculate new total hours if dates changed
      let updateData: any = { ...data, updatedAt: new Date() };
      if (data.date || data.startTime || data.endTime) {
        const date = new Date(data.date || timesheet.date);
        const startTime = new Date(data.startTime || timesheet.startTime);
        const endTime = new Date(data.endTime || timesheet.endTime);
        updateData.totalHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      }

      // Update timesheet
      const updatedTimesheet = await prisma.timesheet.update({
        where: { id: timesheetId },
        data: updateData
      });

      return {
        success: true,
        data: updatedTimesheet,
        message: "Timesheet updated successfully"
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
        error: "Failed to update timesheet",
        code: "TIMESHEET_UPDATE_ERROR",
        details: error.message
      });
    }
  });

  // Get Contract Timesheets
  app.get("/contracts/:id/timesheets", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { id } = request.params as { id: string };

    try {
      // Get contract and verify access
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
        return reply.code(403).send({
          error: "Access denied",
          code: "ACCESS_DENIED"
        });
      }

      // Get timesheets
      const timesheets = await prisma.timesheet.findMany({
        where: { contractId: id },
        orderBy: { date: 'desc' }
      });

      return {
        success: true,
        data: timesheets
      };
    } catch (error: any) {
      return reply.code(500).send({
        error: "Failed to fetch timesheets",
        code: "TIMESHEETS_FETCH_ERROR",
        details: error.message
      });
    }
  });

  // Delete Timesheet
  app.delete("/timesheets/:timesheetId", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { timesheetId } = request.params as { timesheetId: string };

    try {
      // Get timesheet
      const timesheet = await prisma.timesheet.findUnique({
        where: { id: timesheetId },
        include: {
          vaProfile: true
        }
      });

      if (!timesheet) {
        return reply.code(404).send({
          error: "Timesheet not found",
          code: "TIMESHEET_NOT_FOUND"
        });
      }

      // Only VAs can delete their own timesheets
      if (user.role !== 'va') {
        return reply.code(403).send({
          error: "Only VAs can delete timesheets",
          code: "INVALID_ROLE"
        });
      }

      const vaProfile = await prisma.vAProfile.findUnique({
        where: { userId: user.uid }
      });

      if (vaProfile?.id !== timesheet.vaProfileId) {
        return reply.code(403).send({
          error: "Access denied",
          code: "ACCESS_DENIED"
        });
      }

      // Cannot delete approved timesheets
      if (timesheet.status === 'approved') {
        return reply.code(400).send({
          error: "Cannot delete approved timesheet",
          code: "TIMESHEET_APPROVED"
        });
      }

      // Delete timesheet
      await prisma.timesheet.delete({
        where: { id: timesheetId }
      });

      return {
        success: true,
        message: "Timesheet deleted successfully"
      };
    } catch (error: any) {
      return reply.code(500).send({
        error: "Failed to delete timesheet",
        code: "TIMESHEET_DELETE_ERROR",
        details: error.message
      });
    }
  });
}