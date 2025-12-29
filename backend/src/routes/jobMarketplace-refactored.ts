// Job Marketplace - Refactored with Service Layer
import { FastifyInstance } from "fastify";
import { verifyAuth } from "../plugins/firebaseAuth.js";
import { z } from "zod";
import { ProposalRepository } from "../repositories/proposalRepository.js";
import { JobPostingRepository } from "../repositories/jobPostingRepository.js";
import { CompanyRepository } from "../repositories/companyRepository.js";
import { VAProfileRepository } from "../repositories/vaProfileRepository.js";
import { NotificationService } from "../services/notificationService.js";

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
  const proposalRepo = new ProposalRepository();
  const jobPostingRepo = new JobPostingRepository();
  const companyRepo = new CompanyRepository();
  const vaProfileRepo = new VAProfileRepository();
  const notificationService = new NotificationService();

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
      const company = await companyRepo.findByUserId(user.uid);
      if (!company) {
        return reply.code(404).send({
          error: "Company profile not found",
          code: "COMPANY_NOT_FOUND"
        });
      }

      // Create job posting
      const jobPosting = await jobPostingRepo.create({
        ...data,
        companyId: company.id,
        status: "open",
        views: 0,
        proposalCount: 0
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
      skills,
      experienceLevel,
      employmentType,
      jobType,
      remote
    } = request.query as {
      page: string;
      limit: string;
      search?: string;
      category?: string;
      skills?: string;
      experienceLevel?: string;
      employmentType?: string;
      jobType?: string;
      remote?: string;
    };

    try {
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Build filters
      const whereClause: any = { status: 'open' };

      if (search) {
        whereClause.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { tags: { hasSome: [search] } }
        ];
      }

      if (category) {
        whereClause.category = category;
      }

      if (skills) {
        const skillsArray = skills.split(',').map(s => s.trim());
        whereClause.skillsRequired = { hasSome: skillsArray };
      }

      if (experienceLevel) {
        whereClause.experienceLevel = experienceLevel;
      }

      if (employmentType) {
        whereClause.employmentType = employmentType;
      }

      if (jobType) {
        whereClause.jobType = jobType;
      }

      if (remote) {
        whereClause.remote = remote === 'true';
      }

      const [jobPostings, total] = await Promise.all([
        jobPostingRepo.search(whereClause, { skip, take: parseInt(limit) }),
        jobPostingRepo.count(whereClause)
      ]);

      return {
        success: true,
        data: {
          jobPostings,
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

    try {
      const jobPosting = await jobPostingRepo.findById(id, {
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            verificationLevel: true,
            bio: true,
            industry: true,
            country: true
          }
        },
        proposals: {
          include: {
            vaProfile: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
                averageRating: true,
                totalReviews: true,
                hourlyRate: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      });

      if (!jobPosting) {
        return reply.code(404).send({
          error: "Job posting not found",
          code: "JOB_NOT_FOUND"
        });
      }

      // Increment view count
      await jobPostingRepo.incrementViews(id);

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
      // Verify user owns the job posting
      const jobPosting = await jobPostingRepo.findById(id);
      if (!jobPosting) {
        return reply.code(404).send({
          error: "Job posting not found",
          code: "JOB_NOT_FOUND"
        });
      }

      const company = await companyRepo.findByUserId(user.uid);
      if (!company || jobPosting.companyId !== company.id) {
        return reply.code(403).send({
          error: "Access denied to this job posting",
          code: "ACCESS_DENIED"
        });
      }

      const updated = await jobPostingRepo.update(id, data);

      return {
        success: true,
        data: updated,
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

  // Create Proposal
  app.post("/proposals", {
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
      const vaProfile = await vaProfileRepo.findByUserId(user.uid);
      if (!vaProfile) {
        return reply.code(404).send({
          error: "VA profile not found",
          code: "VA_PROFILE_NOT_FOUND"
        });
      }

      // Check if job posting exists and is open
      const jobPosting = await jobPostingRepo.findById(data.jobPostingId);
      if (!jobPosting) {
        return reply.code(404).send({
          error: "Job posting not found",
          code: "JOB_NOT_FOUND"
        });
      }

      if (jobPosting.status !== 'open') {
        return reply.code(400).send({
          error: "Job posting is not open for proposals",
          code: "JOB_NOT_OPEN"
        });
      }

      // Check if VA already submitted a proposal
      const existingProposal = await proposalRepo.findByJobPostingId(data.jobPostingId);
      const alreadyProposed = existingProposal.some(p => p.vaProfileId === vaProfile.id);
      if (alreadyProposed) {
        return reply.code(400).send({
          error: "You have already submitted a proposal for this job",
          code: "ALREADY_PROPOSED"
        });
      }

      // Create proposal
      const proposal = await proposalRepo.create({
        jobPostingId: data.jobPostingId,
        vaProfileId: vaProfile.id,
        coverLetter: data.coverLetter,
        bidAmount: data.bidAmount,
        bidType: data.bidType,
        hourlyRate: data.hourlyRate,
        estimatedHours: data.estimatedHours,
        deliveryTime: data.deliveryTime,
        attachments: data.attachments,
        status: 'pending'
      });

      // Increment proposal count
      await jobPostingRepo.incrementProposalCount(data.jobPostingId);

      // Notify company
      await notificationService.notifyNewProposal(jobPosting.companyId, proposal.id);

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

  // Get Proposals for Job Posting
  app.get("/jobs/marketplace/:id/proposals", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { id } = request.params as { id: string };

    try {
      // Verify user owns the job posting
      const jobPosting = await jobPostingRepo.findById(id);
      if (!jobPosting) {
        return reply.code(404).send({
          error: "Job posting not found",
          code: "JOB_NOT_FOUND"
        });
      }

      const company = await companyRepo.findByUserId(user.uid);
      if (!company || jobPosting.companyId !== company.id) {
        return reply.code(403).send({
          error: "Access denied to this job posting",
          code: "ACCESS_DENIED"
        });
      }

      const proposals = await proposalRepo.findByJobPostingId(id);

      return {
        success: true,
        data: proposals
      };
    } catch (error: any) {
      return reply.code(500).send({
        error: "Failed to fetch proposals",
        code: "PROPOSALS_FETCH_ERROR",
        details: error.message
      });
    }
  });

  // Get User's Proposals
  app.get("/proposals", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { page = 1, limit = 20 } = request.query as {
      page: string;
      limit: string;
    };

    try {
      const vaProfile = await vaProfileRepo.findByUserId(user.uid);
      if (!vaProfile) {
        return reply.code(404).send({
          error: "VA profile not found",
          code: "VA_PROFILE_NOT_FOUND"
        });
      }

      const proposals = await proposalRepo.findByVAProfileId(vaProfile.id);

      return {
        success: true,
        data: {
          proposals,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: proposals.length
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

  // Update Proposal
  app.put("/proposals/:id", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { id } = request.params as { id: string };
    const data = updateProposalSchema.parse(request.body);

    try {
      // Verify user owns the proposal
      const proposal = await proposalRepo.findById(id);
      if (!proposal) {
        return reply.code(404).send({
          error: "Proposal not found",
          code: "PROPOSAL_NOT_FOUND"
        });
      }

      const vaProfile = await vaProfileRepo.findByUserId(user.uid);
      if (!vaProfile || proposal.vaProfileId !== vaProfile.id) {
        return reply.code(403).send({
          error: "Access denied to this proposal",
          code: "ACCESS_DENIED"
        });
      }

      const updated = await proposalRepo.update(id, data);

      return {
        success: true,
        data: updated,
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
}
