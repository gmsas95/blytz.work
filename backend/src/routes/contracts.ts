// Simplified Contract Routes for Deployment
import { FastifyInstance } from "fastify";
import { prisma } from "../utils/prisma.js";
import { verifyAuth } from "../plugins/firebaseAuth.js";
import { z } from "zod";
import { submitTimesheet, approveTimesheet, createMilestone } from "../utils/contractHelpers.js";

const createContractSchema = z.object({
  jobId: z.string().min(1, "Job ID is required"),
  contractType: z.enum(["fixed", "hourly"]),
  amount: z.number().min(0, "Amount must be positive"),
  hourlyRate: z.number().min(0).optional(),
  currency: z.string().default("USD"),
  startDate: z.string().datetime("Invalid start date"),
  endDate: z.string().datetime().optional(),
  terms: z.string().optional(),
  deliverables: z.array(z.string()).optional(),
  paymentSchedule: z.string().default("upon_completion")
});

const createMilestoneSchema = z.object({
  contractId: z.string().min(1, "Contract ID is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  amount: z.number().min(0, "Amount must be positive"),
  dueDate: z.string().datetime().optional()
});

const createTimesheetSchema = z.object({
  contractId: z.string().min(1, "Contract ID is required"),
  date: z.string().datetime("Invalid date"),
  startTime: z.string().datetime("Invalid start time"),
  endTime: z.string().datetime("Invalid end time"),
  totalHours: z.number().min(0, "Hours must be positive"),
  description: z.string().optional()
});

export default async function contractRoutes(app: FastifyInstance) {
  // Get contracts
  app.get("/contracts", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    
    try {
      const contracts = await prisma.contract.findMany({
        where: {
          OR: [
            { companyId: user.companyId },
            { vaProfileId: user.vaProfileId }
          ]
        },
        include: {
          job: {
            select: { id: true, title: true, status: true }
          },
          jobPosting: {
            select: { id: true, title: true, category: true, tags: true }
          },
          vaProfile: {
            select: { 
              id: true, name: true, country: true, 
              bio: true, averageRating: true, totalReviews: true,
              skills: true, hourlyRate: true, avatarUrl: true
            }
          },
          company: {
            select: { id: true, name: true, logoUrl: true, verificationLevel: true }
          },
          proposal: {
            select: { id: true, coverLetter: true, bidAmount: true, bidType: true }
          },
          _count: {
            select: { milestones: true, timesheets: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      const limit = parseInt(request.query.limit as string) || "20";
      const offset = parseInt(request.query.offset as string) || "1";

      reply.send({
        success: true,
        contracts: contracts.slice(offset - 1, offset - 1 + parseInt(limit)),
        total: contracts.length
      });
    } catch (error) {
      reply.status(500).send({
        success: false,
        message: "Failed to fetch contracts"
      });
    }
  });

  // Create contract
  app.post("/contracts", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    
    try {
      const data = createContractSchema.parse(request.body);

      const contract = await prisma.contract.create({
        data: {
          jobId: data.jobId,
          vaProfileId: user.vaProfileId,
          companyId: user.companyId,
          contractType: data.contractType,
          amount: data.amount,
          hourlyRate: data.hourlyRate,
          currency: data.currency,
          startDate: new Date(data.startDate),
          endDate: data.endDate ? new Date(data.endDate) : null,
          terms: data.terms,
          deliverables: data.deliverables,
          paymentSchedule: data.paymentSchedule
        }
      });

      reply.send({
        success: true,
        contract
      });
    } catch (error) {
      reply.status(400).send({
        success: false,
        message: error.message
      });
    }
  });

  // Get contract details
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
            include: { payments: true }
          },
          jobPosting: {
            select: { id: true, title: true, category: true, tags: true }
          },
          vaProfile: {
            select: { 
              id: true, name: true, country: true, 
              bio: true, averageRating: true, totalReviews: true,
              skills: true, hourlyRate: true, avatarUrl: true
            }
          },
          company: {
            select: { id: true, name: true, verificationLevel: true }
          },
          proposal: {
            select: { id: true, coverLetter: true, bidAmount: true, bidType: true }
          },
          timesheets: true
        }
      });

      if (!contract) {
        return reply.status(404).send({
          success: false,
          message: "Contract not found"
        });
      }

      // Check access
      if (contract.companyId !== user.companyId && contract.vaProfileId !== user.vaProfileId) {
        return reply.status(403).send({
          success: false,
          message: "Access denied"
        });
      }

      reply.send({
        success: true,
        contract
      });
    } catch (error) {
      reply.status(500).send({
        success: false,
        message: "Failed to fetch contract"
      });
    }
  });

  // Create milestone
  app.post("/contracts/:id/milestones", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { id } = request.params as { id: string };
    
    try {
      const data = createMilestoneSchema.parse({ ...request.body, contractId: id });
      
      const result = await createMilestone(data, user);
      
      if (result.success) {
        reply.send(result);
      } else {
        reply.status(400).send(result);
      }
    } catch (error) {
      reply.status(400).send({
        success: false,
        message: error.message
      });
    }
  });

  // Submit timesheet
  app.post("/contracts/:id/timesheets", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { id } = request.params as { id: string };
    
    try {
      const data = createTimesheetSchema.parse({ ...request.body, contractId: id });
      
      const result = await submitTimesheet(data, user);
      
      if (result.success) {
        reply.send(result);
      } else {
        reply.status(400).send(result);
      }
    } catch (error) {
      reply.status(400).send({
        success: false,
        message: error.message
      });
    }
  });

  // Approve timesheet
  app.post("/timesheets/:id/approve", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { id } = request.params as { id: string };
    
    try {
      const result = await approveTimesheet(id, user);
      
      if (result.success) {
        reply.send(result);
      } else {
        reply.status(400).send(result);
      }
    } catch (error) {
      reply.status(500).send({
        success: false,
        message: "Failed to approve timesheet"
      });
    }
  });
}
