// Complete Job Marketplace Routes
import { FastifyInstance } from "fastify";
import { prisma } from "../utils/prisma.js";
import { verifyAuth } from "../plugins/firebaseAuth.js";
import { z } from "zod";

// Validation schemas
const createJobPostingSchema = z.object({
  title: z.string().min(3, "Job title is required"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  requirements: z.array(z.string()).min(1, "At least one requirement is required"),
  responsibilities: z.array(z.string()).min(1, "At least one responsibility is required"),
  benefits: z.array(z.string()).optional(),
  rateRange: z.string().min(3, "Rate range is required"),
  budget: z.number().optional(),
  location: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  experienceLevel: z.enum(["entry", "mid", "senior", "executive"]).optional(),
  employmentType: z.enum(["fulltime", "parttime", "contract", "freelance"]).optional(),
  jobType: z.enum(["fixed", "hourly"]).default("fixed"),
  duration: z.string().optional(),
  urgency: z.enum(["low", "medium", "high"]).default("medium"),
  skillsRequired: z.array(z.string()).min(1, "At least one skill is required"),
  toolsUsed: z.array(z.string()).optional(),
  teamSize: z.number().min(1).optional(),
  reportingTo: z.string().optional(),
  travelRequired: z.string().optional(),
  workSchedule: z.object({
    timezone: z.string(),
    hours: z.string(),
    flexibility: z.string().optional()
  }).optional()
});

const createProposalSchema = z.object({
  jobPostingId: z.string(),
  coverLetter: z.string().min(10, "Cover letter must be at least 10 characters"),
  bidAmount: z.number().min(5, "Bid amount must be at least $5"),
  bidType: z.enum(["fixed", "hourly"]).default("fixed"),
  hourlyRate: z.number().optional(),
  estimatedHours: z.number().optional(),
  deliveryTime: z.string().min(2, "Delivery time is required"),
  attachments: z.array(z.any()).optional()
});

const createContractSchema = z.object({
  jobId: z.string(),
  jobPostingId: z.string(),
  vaProfileId: z.string(),
  proposalId: z.string().optional(),
  contractType: z.enum(["fixed", "hourly"]),
  amount: z.number().min(5, "Amount must be at least $5"),
  hourlyRate: z.number().optional(),
  currency: z.string().default("USD"),
  startDate: z.string(),
  endDate: z.string().optional(),
  terms: z.any().optional(),
  deliverables: z.array(z.any()).optional(),
  milestones: z.array(z.any()).optional(),
  paymentSchedule: z.enum(["upon_completion", "milestones", "weekly", "monthly"]).default("upon_completion")
});

const createMilestoneSchema = z.object({
  contractId: z.string(),
  jobId: z.string(),
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

export default async function jobMarketplaceRoutes(app: FastifyInstance) {
  // Get all job postings (marketplace)
  app.get("/jobs/marketplace", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { 
      page = 1, 
      limit = 20, 
      category, 
      jobType, 
      experienceLevel, 
      skills, 
      budgetRange,
      duration,
      urgent,
      featured,
      search
    } = request.query as { 
      page: string; 
      limit: string; 
      category?: string; 
      jobType?: string; 
      experienceLevel?: string; 
      skills?: string; 
      budgetRange?: string;
      duration?: string;
      urgent?: string;
      featured?: string;
      search?: string;
    };

    try {
      const whereClause: any = { status: "open" };
      
      // Add filters
      if (category) whereClause.category = category;
      if (jobType) whereClause.jobType = jobType;
      if (experienceLevel) whereClause.experienceLevel = experienceLevel;
      if (urgent === "true") whereClause.urgency = "high";
      if (featured === "true") whereClause.featured = true;
      if (search) {
        whereClause.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { tags: { has: search } }
        ];
      }
      if (skills) {
        const skillList = skills.split(',');
        whereClause.skillsRequired = { hasSome: skillList };
      }
      if (budgetRange) {
        const [min, max] = budgetRange.split('-').map(Number);
        if (min && max) {
          whereClause.budget = { gte: min, lte: max };
        }
      }
      if (duration) {
        whereClause.duration = { contains: duration };
      }

      const jobs = await prisma.jobPosting.findMany({
        where: whereClause,
        include: {
          company: {
            select: { 
              id: true, name: true, logoUrl: true, country: true, 
              verificationLevel: true, totalReviews: true 
            }
          },
          _count: {
            select: { proposals: true, views: true }
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

      // Increment views for each job
      await Promise.all(jobs.map(job => 
        prisma.jobPosting.update({
          where: { id: job.id },
          data: { views: { increment: 1 } }
        })
      ));

      return {
        success: true,
        data: {
          jobs,
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
        error: "Failed to fetch job marketplace",
        code: "MARKETPLACE_FETCH_ERROR",
        details: error.message
      });
    }
  });

  // Get single job posting
  app.get("/jobs/marketplace/:id", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = request.user as any;

    try {
      const job = await prisma.jobPosting.findUnique({
        where: { id },
        include: {
          company: {
            select: { 
              id: true, name: true, logoUrl: true, country: true, 
              description: true, verificationLevel: true, totalReviews: true 
            }
          },
          proposals: user.role === 'company' ? {
            include: {
              vaProfile: {
                select: {
                  id: true, name: true, country: true, hourlyRate: true,
                  skills: true, averageRating: true, totalReviews: true,
                  portfolioItems: { take: 3 }
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          } : false,
          _count: {
            select: { proposals: true, views: true }
          }
        }
      });

      if (!job) {
        return reply.code(404).send({ 
          error: "Job posting not found",
          code: "JOB_NOT_FOUND"
        });
      }

      // Check if user has already submitted a proposal
      let userProposal = null;
      if (user.role === 'va') {
        userProposal = await prisma.proposal.findFirst({
          where: {
            jobPostingId: id,
            vaProfileId: user.uid
          }
        });
      }

      return {
        success: true,
        data: {
          ...job,
          userProposal,
          canPropose: user.role === 'va' && !userProposal && job.status === 'open'
        }
      };
    } catch (error: any) {
      return reply.code(500).send({ 
        error: "Failed to fetch job posting",
        code: "JOB_FETCH_ERROR",
        details: error.message
      });
    }
  });

  // Create job posting (company only)
  app.post("/jobs/marketplace", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const data = createJobPostingSchema.parse(request.body);

    try {
      // Check if user is a company
      if (user.role !== 'company') {
        return reply.code(403).send({ 
          error: "Only companies can post jobs",
          code: "INVALID_ROLE"
        });
      }

      // Get company profile
      const company = await prisma.company.findUnique({
        where: { userId: user.uid }
      });

      if (!company) {
        return reply.code(403).send({ 
          error: "Company profile required",
          code: "COMPANY_PROFILE_REQUIRED"
        });
      }

      // Create job posting
      const job = await prisma.jobPosting.create({
        data: {
          ...data,
          companyId: company.id,
          status: "open",
          views: 0,
          proposals: 0,
          featured: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        include: {
          company: true
        }
      });

      // Create notifications for relevant VAs (simplified - would use more sophisticated targeting)
      await createJobNotifications(job);

      return reply.code(201).send({
        success: true,
        data: job,
        message: "Job posted successfully"
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
        code: "JOB_CREATION_ERROR",
        details: error.message
      });
    }
  });

  // Submit proposal (VA only)
  app.post("/jobs/marketplace/proposals", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const data = createProposalSchema.parse(request.body);

    try {
      // Check if user is a VA
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
        return reply.code(403).send({ 
          error: "VA profile required",
          code: "VA_PROFILE_REQUIRED"
        });
      }

      // Check if job is still open
      const job = await prisma.jobPosting.findUnique({
        where: { id: data.jobPostingId }
      });

      if (!job || job.status !== 'open') {
        return reply.code(400).send({ 
          error: "Job is not accepting proposals",
          code: "JOB_NOT_OPEN"
        });
      }

      // Check if user has already submitted a proposal
      const existingProposal = await prisma.proposal.findFirst({
        where: {
          jobPostingId: data.jobPostingId,
          vaProfileId: vaProfile.id
        }
      });

      if (existingProposal) {
        return reply.code(400).send({ 
          error: "You have already submitted a proposal for this job",
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
        },
        include: {
          vaProfile: true
        }
      });

      // Update job posting proposal count
      await prisma.jobPosting.update({
        where: { id: data.jobPostingId },
        data: { proposals: { increment: 1 } }
      });

      // Notify company
      await createProposalNotification(proposal, job.companyId);

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
        code: "PROPOSAL_ERROR",
        details: error.message
      });
    }
  });

  // Get proposals for job (company only)
  app.get("/jobs/marketplace/:id/proposals", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { id } = request.params as { id: string };
    const { status, page = 1, limit = 20 } = request.query as { 
      status?: string; page: string; limit: string 
    };

    try {
      // Check if user owns this job
      const company = await prisma.company.findUnique({
        where: { userId: user.uid },
        include: {
          jobPostings: {
            where: { id },
            select: { id: true }
          }
        }
      });

      if (!company || company.jobPostings.length === 0) {
        return reply.code(403).send({ 
          error: "Access denied",
          code: "ACCESS_DENIED"
        });
      }

      const whereClause: any = { jobPostingId: id };
      if (status) whereClause.status = status;

      const proposals = await prisma.proposal.findMany({
        where: whereClause,
        include: {
          vaProfile: {
            select: {
              id: true, name: true, country: true, hourlyRate: true,
              skills: true, averageRating: true, totalReviews: true,
              responseRate: true, featured: true,
              portfolioItems: { take: 3 }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: (parseInt(page) - 1) * parseInt(limit)
      });

      const total = await prisma.proposal.count({ where: whereClause });

      return {
        success: true,
        data: {
          proposals,
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
        error: "Failed to fetch proposals",
        code: "PROPOSALS_FETCH_ERROR",
        details: error.message
      });
    }
  });

  // Accept proposal
  app.post("/jobs/marketplace/proposals/:id/accept", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { id } = request.params as { id: string };
    const { startDate, endDate, contractTerms } = request.body as {
      startDate: string;
      endDate?: string;
      contractTerms?: any;
    };

    try {
      // Get proposal and verify ownership
      const proposal = await prisma.proposal.findUnique({
        where: { id },
        include: {
          jobPosting: true,
          vaProfile: true
        }
      });

      if (!proposal) {
        return reply.code(404).send({ 
          error: "Proposal not found",
          code: "PROPOSAL_NOT_FOUND"
        });
      }

      // Check if user owns the job
      const company = await prisma.company.findUnique({
        where: { userId: user.uid },
        include: {
          jobPostings: {
            where: { id: proposal.jobPostingId },
            select: { id: true }
          }
        }
      });

      if (!company || company.jobPostings.length === 0) {
        return reply.code(403).send({ 
          error: "Access denied",
          code: "ACCESS_DENIED"
        });
      }

      // Create job and contract
      const job = await prisma.job.create({
        data: {
          jobPostingId: proposal.jobPostingId,
          vaProfileId: proposal.vaProfileId,
          companyId: company.id,
          status: "active",
          title: proposal.jobPosting.title,
          description: proposal.jobPosting.description,
          budget: proposal.jobPosting.budget,
          hourlyRate: proposal.bidType === 'hourly' ? proposal.bidAmount : undefined,
          totalAmount: proposal.bidType === 'fixed' ? proposal.bidAmount : undefined,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

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
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : undefined,
          status: "active",
          terms: contractTerms,
          paymentSchedule: "upon_completion",
          totalPaid: 0,
          totalHours: proposal.bidType === 'hourly' ? 0 : undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      // Update proposal status
      await prisma.proposal.update({
        where: { id },
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

      // Reject other proposals
      await prisma.proposal.updateMany({
        where: {
          jobPostingId: proposal.jobPostingId,
          status: "pending",
          id: { not: id }
        },
        data: { status: "rejected" }
      });

      // Create notifications
      await createContractNotifications(job, contract, company, proposal.vaProfileId);

      return {
        success: true,
        data: { job, contract },
        message: "Proposal accepted and contract created"
      };
    } catch (error: any) {
      return reply.code(500).send({ 
        error: "Failed to accept proposal",
        code: "PROPOSAL_ACCEPT_ERROR",
        details: error.message
      });
    }
  });

  // Get user's proposals (VA only)
  app.get("/jobs/marketplace/proposals/my", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { status, page = 1, limit = 20 } = request.query as { 
      status?: string; page: string; limit: string 
    };

    try {
      if (user.role !== 'va') {
        return reply.code(403).send({ 
          error: "Only VAs can view their proposals",
          code: "INVALID_ROLE"
        });
      }

      const vaProfile = await prisma.vAProfile.findUnique({
        where: { userId: user.uid }
      });

      if (!vaProfile) {
        return reply.code(404).send({ 
          error: "VA profile not found",
          code: "VA_PROFILE_NOT_FOUND"
        });
      }

      const whereClause: any = { vaProfileId: vaProfile.id };
      if (status) whereClause.status = status;

      const proposals = await prisma.proposal.findMany({
        where: whereClause,
        include: {
          jobPosting: {
            select: {
              id: true, title: true, budget: true, status: true,
              company: { select: { id: true, name: true, logoUrl: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: (parseInt(page) - 1) * parseInt(limit)
      });

      const total = await prisma.proposal.count({ where: whereClause });

      return {
        success: true,
        data: {
          proposals,
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
        error: "Failed to fetch proposals",
        code: "PROPOSALS_FETCH_ERROR",
        details: error.message
      });
    }
  });

  // Get marketplace categories
  app.get("/jobs/marketplace/categories", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    try {
      const categories = await prisma.jobPosting.groupBy({
        by: ['category'],
        where: {
          status: 'open',
          category: { not: null }
        },
        _count: {
          category: true
        },
        orderBy: {
          _count: {
            category: 'desc'
          }
        }
      });

      return {
        success: true,
        data: categories.map(cat => ({
          name: cat.category,
          count: cat._count.category
        }))
      };
    } catch (error: any) {
      return reply.code(500).send({ 
        error: "Failed to fetch categories",
        code: "CATEGORIES_FETCH_ERROR",
        details: error.message
      });
    }
  });

  // Helper functions
  async function createJobNotifications(job: any) {
    // Create notifications for VAs with matching skills
    await prisma.notification.createMany({
      data: await Promise.all(
        job.skillsRequired.slice(0, 50).map(async (skill: string) => {
          const vaProfiles = await prisma.vAProfile.findMany({
            where: {
              skills: { has: skill },
              availability: true
            },
            take: 10,
            select: { userId: true }
          });

          return vaProfiles.map(va => ({
            userId: va.userId,
            type: "job_posted",
            title: "New Job Posted",
            message: `A new job "${job.title}" matching your skills has been posted`,
            data: { jobId: job.id, skill },
            priority: job.urgency === 'high' ? 'high' : 'normal'
          }));
        })
      ).then(notifications => notifications.flat())
    });
  }

  async function createProposalNotification(proposal: any, companyId: string) {
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (company) {
      await prisma.notification.create({
        data: {
          userId: company.userId,
          type: "proposal_received",
          title: "New Proposal Received",
          message: `${proposal.vaProfile.name} has submitted a proposal for your job`,
          data: { proposalId: proposal.id },
          priority: 'high'
        }
      });
    }
  }

  async function createContractNotifications(job: any, contract: any, company: any, vaProfileId: string) {
    // Notify VA
    await prisma.notification.create({
      data: {
        userId: job.vaProfileId,
        type: "contract_awarded",
        title: "Contract Awarded",
        message: `Your proposal for "${job.title}" has been accepted`,
        data: { contractId: contract.id, jobId: job.id },
        priority: 'high'
      }
    });

    // Notify company
    await prisma.notification.create({
      data: {
        userId: company.userId,
        type: "contract_created",
        title: "Contract Created",
        message: `Contract has been created with ${contract.vaProfile.name}`,
        data: { contractId: contract.id, jobId: job.id },
        priority: 'normal'
      }
    });
  }
}