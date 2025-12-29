// Contract Management - Refactored with Service Layer
import { FastifyInstance } from "fastify";
import { verifyAuth } from "../plugins/firebaseAuth.js";
import { z } from "zod";
import { ContractService } from "../services/contractService.js";
import { CompanyRepository } from "../repositories/companyRepository.js";
import { VAProfileRepository } from "../repositories/vaProfileRepository.js";
import { MilestoneRepository } from "../repositories/milestoneRepository.js";
import { TimesheetRepository } from "../repositories/timesheetRepository.js";
import { ContractRepository } from "../repositories/contractRepository.js";

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
  contractId: z.string(),
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
  const contractService = new ContractService();
  const companyRepo = new CompanyRepository();
  const vaProfileRepo = new VAProfileRepository();
  const milestoneRepo = new MilestoneRepository();
  const timesheetRepo = new TimesheetRepository();
  const contractRepo = new ContractRepository();

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

      // Get company
      const company = await companyRepo.findByUserId(user.uid);
      if (!company) {
        return reply.code(404).send({
          error: "Company profile not found",
          code: "COMPANY_NOT_FOUND"
        });
      }

      // Create contract via service
      const contract = await contractService.createContractFromProposal(
        data.proposalId,
        company.id,
        data.startDate,
        data.endDate,
        data.contractTerms
      );

      return reply.code(201).send({
        success: true,
        data: contract,
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
    const { type = 'active', page = '1', limit = '20' } = request.query as {
      type: string;
      page: string;
      limit: string;
    };

    try {
      let contracts;
      let total;

      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 20;

      if (user.role === 'company') {
        const company = await companyRepo.findByUserId(user.uid);
        if (company) {
          const skip = (pageNum - 1) * limitNum;
          const whereClause: any = { companyId: company.id };

          if (type === 'active') {
            whereClause.status = { in: ['active', 'paused'] };
          } else if (type === 'completed') {
            whereClause.status = 'completed';
          }

          contracts = await contractRepo.findByCompanyId(company.id, { skip, take: limitNum });
          total = await contractRepo.count(whereClause);
        }
      } else if (user.role === 'va') {
        const vaProfile = await vaProfileRepo.findByUserId(user.uid);
        if (vaProfile) {
          const skip = (pageNum - 1) * limitNum;
          contracts = await contractRepo.findByVAProfileId(vaProfile.id, { skip, take: limitNum });
          total = await contractRepo.count({ vaProfileId: vaProfile.id });
        }
      }

      return {
        success: true,
        data: {
          contracts: contracts || [],
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: total || 0,
            totalPages: Math.ceil((total || 0) / limitNum)
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
      const contract = await contractRepo.findWithAccessCheck(id, user.uid, user.role);

      if (!contract) {
        return reply.code(404).send({
          error: "Contract not found",
          code: "CONTRACT_NOT_FOUND"
        });
      }

      // Verify access
      let hasAccess = false;
      if (user.role === 'company') {
        const company = await companyRepo.findByUserId(user.uid);
        hasAccess = company?.id === contract.companyId;
      } else if (user.role === 'va') {
        const vaProfile = await vaProfileRepo.findByUserId(user.uid);
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
      const contract = await contractService.updateContractStatus(id, status);

      return {
        success: true,
        data: contract,
        message: "Contract updated successfully"
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
  app.post("/contracts/:contractId/milestones", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { contractId } = request.params as { contractId: string };
    const data = createMilestoneSchema.parse(request.body);

    try {
      // Verify user owns the contract
      const contract = await contractRepo.findById(contractId);
      if (!contract || contract.companyId !== (await companyRepo.findByUserId(user.uid))?.id) {
        return reply.code(403).send({
          error: "Access denied to this contract",
          code: "CONTRACT_ACCESS_DENIED"
        });
      }

      const milestone = await milestoneRepo.create({
        contractId,
        jobId: contract.jobId,
        title: data.title,
        description: data.description,
        amount: data.amount,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        status: 'pending'
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
  app.put("/milestones/:id", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { id } = request.params as { id: string };
    const data = updateMilestoneSchema.parse(request.body);

    try {
      const milestone = await milestoneRepo.update(id, data);

      return {
        success: true,
        data: milestone,
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

  // Submit Timesheet
  app.post("/contracts/:contractId/timesheets", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { contractId } = request.params as { contractId: string };
    const data = createTimesheetSchema.parse(request.body);

    try {
      // Verify user is a VA
      if (user.role !== 'va') {
        return reply.code(403).send({
          error: "Only VAs can submit timesheets",
          code: "INVALID_ROLE"
        });
      }

      // Get VA profile
      const vaProfile = await vaProfileRepo.findByUserId(user.uid);
      if (!vaProfile) {
        return reply.code(404).send({
          error: "VA profile not found",
          code: "VA_PROFILE_NOT_FOUND"
        });
      }

      // Get contract
      const contract = await contractRepo.findById(contractId);
      if (!contract || contract.vaProfileId !== vaProfile.id) {
        return reply.code(403).send({
          error: "Access denied to this contract",
          code: "CONTRACT_ACCESS_DENIED"
        });
      }

      // Calculate total hours
      const startDate = new Date(`${data.date}T${data.startTime}`);
      const endDate = new Date(`${data.date}T${data.endTime}`);
      const totalHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);

      const timesheet = await timesheetRepo.create({
        contractId,
        vaProfileId: vaProfile.id,
        jobId: contract.jobId,
        date: new Date(data.date),
        startTime: startDate,
        endTime: endDate,
        totalHours,
        description: data.description,
        status: 'pending'
      });

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
        code: "TIMESHEET_SUBMIT_ERROR",
        details: error.message
      });
    }
  });

  // Approve Timesheet
  app.put("/timesheets/:id/approve", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { id } = request.params as { id: string };

    try {
      // Verify user is a company
      if (user.role !== 'company') {
        return reply.code(403).send({
          error: "Only companies can approve timesheets",
          code: "INVALID_ROLE"
        });
      }

      const timesheet = await timesheetRepo.approve(id, user.uid, new Date());

      return {
        success: true,
        data: timesheet,
        message: "Timesheet approved successfully"
      };
    } catch (error: any) {
      return reply.code(500).send({
        error: "Failed to approve timesheet",
        code: "TIMESHEET_APPROVE_ERROR",
        details: error.message
      });
    }
  });

  // Get Timesheets for Contract
  app.get("/contracts/:contractId/timesheets", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { contractId } = request.params as { contractId: string };

    try {
      const contract = await contractRepo.findById(contractId);

      if (!contract) {
        return reply.code(404).send({
          error: "Contract not found",
          code: "CONTRACT_NOT_FOUND"
        });
      }

      // Verify access
      let hasAccess = false;
      if (user.role === 'company') {
        const company = await companyRepo.findByUserId(user.uid);
        hasAccess = company?.id === contract.companyId;
      } else if (user.role === 'va') {
        const vaProfile = await vaProfileRepo.findByUserId(user.uid);
        hasAccess = vaProfile?.id === contract.vaProfileId;
      }

      if (!hasAccess) {
        return reply.code(403).send({
          error: "Access denied",
          code: "ACCESS_DENIED"
        });
      }

      const timesheets = await timesheetRepo.findByContractId(contractId);

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
}
