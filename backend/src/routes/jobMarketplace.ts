// Job Marketplace API with Complete CRUD
import { FastifyInstance } from "fastify";
import { prisma } from "../utils/prisma.js";
import { verifyAuth } from "../plugins/firebaseAuth.js";
import { z } from "zod";

// Validation schemas
const createJobPostingSchema = z.object({
  title: z.string().min(5, "Title is required"),
  description: z.string().min(10, "Description is required"),
  requirements: z.array(z.string()).optional(),
  responsibilities: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  rateRange: z.string().min(1, "Rate range is required"),
  budget: z.number().min(0).optional(),
  location: z.string().optional(),
  remote: z.boolean().default(true),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  experienceLevel: z.enum(["entry", "mid", "senior", "executive"]).optional(),
  employmentType: z.enum(["fulltime", "parttime", "contract", "freelance"]).optional(),
  jobType: z.enum(["fixed", "hourly"]).default("fixed"),
  duration: z.string().optional(),
  urgency: z.enum(["low", "medium", "high"]).default("medium"),
  skillsRequired: z.array(z.string()).min(1, "At least one skill is required"),
  toolsUsed: z.array(z.any()).optional(),
  teamSize: z.number().min(1).optional(),
  reportingTo: z.string().optional(),
  travelRequired: z.string().optional(),
  workSchedule: z.array(z.any()).optional(),
  featured: z.boolean().default(false)
});

const updateJobPostingSchema = z.object({
  title: z.string().min(5).optional(),
  description: z.string().min(10).optional(),
  requirements: z.array(z.string()).optional(),
  responsibilities: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  rateRange: z.string().min(1).optional(),
  budget: z.number().min(0).optional(),
  location: z.string().optional(),
  remote: z.boolean().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  experienceLevel: z.enum(["entry", "mid", "senior", "executive"]).optional(),
  employmentType: z.enum(["fulltime", "parttime", "contract", "freelance"]).optional(),
  jobType: z.enum(["fixed", "hourly"]).optional(),
  duration: z.string().optional(),
  urgency: z.enum(["low", "medium", "high"]).optional(),
  skillsRequired: z.array(z.string()).optional(),
  toolsUsed: z.array(z.any()).optional(),
  teamSize: z.number().min(1).optional(),
  reportingTo: z.string().optional(),
  travelRequired: z.string().optional(),
  workSchedule: z.array(z.any()).optional(),
  featured: z.boolean().optional()
});

const createProposalSchema = z.object({
  jobPostingId: z.string(),
  coverLetter: z.string().min(10, "Cover letter is required"),
  bidAmount: z.number().min(1, "Bid amount is required"),
  bidType: z.enum(["fixed", "hourly"]).default("fixed"),
  hourlyRate: z.number().min(1).optional(),
  estimatedHours: z.number().min(1).optional(),
  deliveryTime: z.string().min(1, "Delivery time is required"),
  attachments: z.array(z.any()).optional()
});

const updateProposalSchema = z.object({
  coverLetter: z.string().min(10).optional(),
  bidAmount: z.number().min(1).optional(),
  bidType: z.enum(["fixed", "hourly"]).optional(),
  hourlyRate: z.number().min(1).optional(),
  estimatedHours: z.number().min(1).optional(),
  deliveryTime: z.string().min(1).optional(),
  attachments: z.array(z.any()).optional()
});

export default async function jobMarketplaceRoutes(app: FastifyInstance) {
  // Create Job Posting
  app.post("/jobs/marketplace", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const data = createJobPostingSchema.parse(request.body);

    try {
      // Verify user is a company
      if (user.role !== 'company') {
        return reply.code(403).send({ 
          error: "Only companies can post jobs",
          code: "INVALID_ROLE"
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

      // Create job posting
      const jobPosting = await prisma.jobPosting.create({
        data: {
          ...data,
          companyId: company.id,
          status: "open",
          views: 0,
          proposals: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      return reply.code(201).send({
        success: true,
        data: jobPosting,
        message: "Job posting created successfully"
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
        error: "Failed to create job posting",
        code: "JOB_CREATE_ERROR",
        details: error.message
      });
    }
  });

  // Get Job Postings
  app.get("/jobs/marketplace", async (request, reply) => {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      category, 
      jobType, 
      experienceLevel, 
      skills, 
      budgetRange, 
      duration, 
      urgent, 
      featured,
      status = 'open'
    } = request.query as { 
      page: string; 
      limit: string; 
      search?: string; 
      category?: string; 
      jobType?: string; 
      experienceLevel?: string; 
      skills?: string; 
      budgetRange?: string; 
      duration?: string; 
      urgent?: string; 
      featured?: string;
      status?: string;
    };

    try {
      const whereClause: any = { status };
      
      if (search) {
        whereClause.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { skillsRequired: { hasSome: [search] } },
          { tags: { hasSome: [search] } }
        ];
      }
      
      if (category) {
        whereClause.category = category;
      }
      
      if (jobType) {
        whereClause.jobType = jobType;
      }
      
      if (experienceLevel) {
        whereClause.experienceLevel = experienceLevel;
      }
      
      if (skills) {
        const skillArray = skills.split(',').map(s => s.trim());
        whereClause.skillsRequired = { hasSome: skillArray };
      }
      
      if (budgetRange) {
        const [min, max] = budgetRange.split('-').map(v => parseFloat(v.trim()));
        whereClause.budget = {};
        if (min) whereClause.budget.gte = min;
        if (max) whereClause.budget.lte = max;
      }
      
      if (duration) {
        whereClause.duration = duration;
      }
      
      if (urgent === 'true') {
        whereClause.urgency = { in: ['high'] };
      }
      
      if (featured === 'true') {
        whereClause.featured = true;
      }

      const jobPostings = await prisma.jobPosting.findMany({
        where: whereClause,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
              country: true,
              verificationLevel: true,
              totalReviews: true
            }
          },
          _count: {
            select: {
              proposals: true
            }
          }
        },
        orderBy: [
          { featured: 'desc' },
          { urgency: 'desc' },
          { createdAt: 'desc' }
        ],
        take: parseInt(limit),
        skip: (parseInt(page) - 1) * parseInt(limit)
      });

      const total = await prisma.jobPosting.count({ where: whereClause });

      return {
        success: true,
        data: {
          jobs: jobPostings,
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
        error: "Failed to fetch job postings",
        code: "JOBS_FETCH_ERROR",
        details: error.message
      });
    }
  });

  // Get Single Job Posting
  app.get("/jobs/marketplace/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = (request as any).user;

    try {
      const jobPosting = await prisma.jobPosting.findUnique({
        where: { id },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
              country: true,
              verificationLevel: true,
              totalReviews: true,
              description: true,
              foundedYear: true,
              companySize: true,
              industry: true
            }
          },
          proposals: {
            where: user?.role === 'va' ? { vaProfile: { userId: user.uid } } : undefined,
            include: {
              vaProfile: {
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true,
                  country: true,
                  averageRating: true,
                  totalReviews: true,
                  skills: true,
                  hourlyRate: true
                }
              }
            }
          }
        }
      });

      if (!jobPosting) {
        return reply.code(404).send({ 
          error: "Job posting not found",
          code: "JOB_NOT_FOUND"
        });
      }

      // Increment view count
      await prisma.jobPosting.update({
        where: { id },
        data: { views: { increment: 1 } }
      });

      return {
        success: true,
        data: jobPosting
      };
    } catch (error: any) {
      return reply.code(500).send({ 
        error: "Failed to fetch job posting",
        code: "JOB_FETCH_ERROR",
        details: error.message
      });
    }
  });

  // Update Job Posting
  app.put("/jobs/marketplace/:id", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { id } = request.params as { id: string };
    const data = updateJobPostingSchema.parse(request.body);

    try {
      // Verify user is a company
      if (user.role !== 'company') {
        return reply.code(403).send({ 
          error: "Only companies can update job postings",
          code: "INVALID_ROLE"
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

      // Get job posting
      const jobPosting = await prisma.jobPosting.findUnique({
        where: { id }
      });

      if (!jobPosting) {
        return reply.code(404).send({ 
          error: "Job posting not found",
          code: "JOB_NOT_FOUND"
        });
      }

      // Verify ownership
      if (jobPosting.companyId !== company.id) {
        return reply.code(403).send({ 
          error: "Access denied",
          code: "ACCESS_DENIED"
        });
      }

      // Update job posting
      const updatedJobPosting = await prisma.jobPosting.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date()
        }
      });

      return {
        success: true,
        data: updatedJobPosting,
        message: "Job posting updated successfully"
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
        error: "Failed to update job posting",
        code: "JOB_UPDATE_ERROR",
        details: error.message
      });
    }
  });

  // Delete Job Posting
  app.delete("/jobs/marketplace/:id", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { id } = request.params as { id: string };

    try {
      // Verify user is a company
      if (user.role !== 'company') {
        return reply.code(403).send({ 
          error: "Only companies can delete job postings",
          code: "INVALID_ROLE"
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

      // Get job posting with contracts
      const jobPosting = await prisma.jobPosting.findUnique({
        where: { id },
        include: {
          contracts: true,
          proposals: true
        }
      });

      if (!jobPosting) {
        return reply.code(404).send({ 
          error: "Job posting not found",
          code: "JOB_NOT_FOUND"
        });
      }

      // Verify ownership
      if (jobPosting.companyId !== company.id) {
        return reply.code(403).send({ 
          error: "Access denied",
          code: "ACCESS_DENIED"
        });
      }

      // Check for active contracts
      const activeContracts = jobPosting.contracts.filter(c => 
        ['active', 'paused'].includes(c.status)
      );

      if (activeContracts.length > 0) {
        return reply.code(400).send({ 
          error: "Cannot delete job posting with active contracts",
          code: "ACTIVE_CONTRACTS_EXIST",
          details: "Please complete or cancel all active contracts before deleting the job posting"
        });
      }

      // Delete job posting (cascades will handle proposals)
      await prisma.jobPosting.delete({
        where: { id }
      });

      return {
        success: true,
        message: "Job posting deleted successfully"
      };
    } catch (error: any) {
      return reply.code(500).send({ 
        error: "Failed to delete job posting",
        code: "JOB_DELETE_ERROR",
        details: error.message
      });
    }
  });

  // Create Proposal
  app.post("/jobs/marketplace/proposals", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const data = createProposalSchema.parse(request.body);

    try {
      // Verify user is a VA
      if (user.role !== 'va') {
        return reply.code(403).send({ 
          error: "Only VAs can submit proposals",
          code: "INVALID_ROLE"
        });
      }

      // Get VA profile
      const vaProfile = await prisma.vAProfile.findUnique({
        where: { userId: user.uid }
      });

      if (!vaProfile) {
        return reply.code(404).send({ 
          error: "VA profile not found",
          code: "VA_NOT_FOUND"
        });
      }

      // Get job posting
      const jobPosting = await prisma.jobPosting.findUnique({
        where: { id: data.jobPostingId }
      });

      if (!jobPosting) {
        return reply.code(404).send({ 
          error: "Job posting not found",
          code: "JOB_NOT_FOUND"
        });
      }

      if (jobPosting.status !== 'open') {
        return reply.code(400).send({ 
          error: "Job posting is not accepting proposals",
          code: "JOB_CLOSED"
        });
      }

      // Check if VA already has a proposal for this job
      const existingProposal = await prisma.proposal.findFirst({
        where: {
          jobPostingId: data.jobPostingId,
          vaProfileId: vaProfile.id,
          status: { notIn: ['rejected', 'withdrawn'] }
        }
      });

      if (existingProposal) {
        return reply.code(400).send({ 
          error: "You already have a proposal for this job posting",
          code: "PROPOSAL_EXISTS"
        });
      }

      // Create proposal
      const proposal = await prisma.proposal.create({
        data: {
          ...data,
          vaProfileId: vaProfile.id,
          status: "pending",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      // Increment proposal count
      await prisma.jobPosting.update({
        where: { id: data.jobPostingId },
        data: { proposals: { increment: 1 } }
      });

      return reply.code(201).send({
        success: true,
        data: proposal,
        message: "Proposal submitted successfully"
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
        error: "Failed to submit proposal",
        code: "PROPOSAL_CREATE_ERROR",
        details: error.message
      });
    }
  });

  // Update Proposal
  app.put("/jobs/marketplace/proposals/:id", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { id } = request.params as { id: string };
    const data = updateProposalSchema.parse(request.body);

    try {
      // Get proposal
      const proposal = await prisma.proposal.findUnique({
        where: { id },
        include: {
          vaProfile: true
        }
      });

      if (!proposal) {
        return reply.code(404).send({ 
          error: "Proposal not found",
          code: "PROPOSAL_NOT_FOUND"
        });
      }

      // Verify ownership
      if (user.role !== 'va') {
        return reply.code(403).send({ 
          error: "Only VAs can update proposals",
          code: "INVALID_ROLE"
        });
      }

      const vaProfile = await prisma.vAProfile.findUnique({
        where: { userId: user.uid }
      });

      if (vaProfile?.id !== proposal.vaProfileId) {
        return reply.code(403).send({ 
          error: "Access denied",
          code: "ACCESS_DENIED"
        });
      }

      // Cannot update accepted/rejected proposals
      if (['accepted', 'rejected'].includes(proposal.status)) {
        return reply.code(400).send({ 
          error: "Cannot update proposal after decision",
          code: "PROPOSAL_DECIDED"
        });
      }

      // Update proposal
      const updatedProposal = await prisma.proposal.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date()
        }
      });

      return {
        success: true,
        data: updatedProposal,
        message: "Proposal updated successfully"
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
        error: "Failed to update proposal",
        code: "PROPOSAL_UPDATE_ERROR",
        details: error.message
      });
    }
  });

  // Delete/Withdraw Proposal
  app.delete("/jobs/marketplace/proposals/:id", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { id } = request.params as { id: string };

    try {
      // Get proposal
      const proposal = await prisma.proposal.findUnique({
        where: { id },
        include: {
          vaProfile: true,
          jobPosting: true
        }
      });

      if (!proposal) {
        return reply.code(404).send({ 
          error: "Proposal not found",
          code: "PROPOSAL_NOT_FOUND"
        });
      }

      // Verify ownership
      if (user.role !== 'va') {
        return reply.code(403).send({ 
          error: "Only VAs can delete proposals",
          code: "INVALID_ROLE"
        });
      }

      const vaProfile = await prisma.vAProfile.findUnique({
        where: { userId: user.uid }
      });

      if (vaProfile?.id !== proposal.vaProfileId) {
        return reply.code(403).send({ 
          error: "Access denied",
          code: "ACCESS_DENIED"
        });
      }

      // Cannot delete accepted proposals
      if (proposal.status === 'accepted') {
        return reply.code(400).send({ 
          error: "Cannot delete accepted proposal",
          code: "PROPOSAL_ACCEPTED",
          details: "Please contact the company directly to withdraw from this job"
        });
      }

      // Delete proposal
      await prisma.proposal.delete({
        where: { id }
      });

      // Decrement proposal count
      await prisma.jobPosting.update({
        where: { id: proposal.jobPostingId },
        data: { proposals: { decrement: 1 } }
      });

      return {
        success: true,
        message: "Proposal withdrawn successfully"
      };
    } catch (error: any) {
      return reply.code(500).send({ 
        error: "Failed to delete proposal",
        code: "PROPOSAL_DELETE_ERROR",
        details: error.message
      });
    }
  });

  // Get Job Categories
  app.get("/jobs/marketplace/categories", async (request, reply) => {
    try {
      const categories = await prisma.jobPosting.groupBy({
        by: ['category'],
        _count: {
          id: true
        },
        where: {
          status: 'open',
          category: { not: null }
        }
      });

      const categoryList = categories
        .map(cat => ({
          name: cat.category,
          count: cat._count.id
        }))
        .filter(cat => cat.name !== null)
        .sort((a, b) => b.count - a.count);

      return {
        success: true,
        data: categoryList
      };
    } catch (error: any) {
      return reply.code(500).send({ 
        error: "Failed to fetch job categories",
        code: "CATEGORIES_FETCH_ERROR",
        details: error.message
      });
    }
  });
}