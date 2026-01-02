// Employer Dashboard API
import { FastifyInstance } from "fastify";
import { prisma } from "../utils/prisma.js";
import { verifyAuth } from "../plugins/firebaseAuth-simplified.js";

export default async function employerRoutes(app: FastifyInstance) {
  // Get Dashboard Stats
  app.get("/employer/dashboard/stats", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    
    try {
      // Get company profile
      const company = await prisma.company.findUnique({
        where: { userId: user.uid },
        include: {
          jobPostings: {
            where: { status: { in: ['active', 'open'] } }
          },
          contracts: true
        }
      });

      if (!company) {
        return reply.code(404).send({ 
          error: "Company profile not found",
          code: "COMPANY_NOT_FOUND"
        });
      }

      // Get total applications
      const applicationsCount = await prisma.proposal.count({
        where: {
          jobPosting: {
            companyId: company.id
          }
        }
      });

      // Get hired VAs count (from contracts)
      const hiredVAs = await prisma.contract.count({
        where: {
          companyId: company.id,
          status: { in: ['active', 'completed'] }
        }
      });

      // Calculate total spent from contracts
      const contracts = await prisma.contract.findMany({
        where: {
          companyId: company.id,
          status: { in: ['active', 'completed', 'paid'] }
        },
        select: {
          amount: true
        }
      });

      const totalSpent = contracts.reduce((sum, contract) => sum + (contract.amount || 0), 0);

      // Get pending reviews count
      const pendingReviews = await prisma.contract.count({
        where: {
          companyId: company.id,
          status: 'completed',
          // employerRating: null - Need to check if this field exists
        }
      });

      // Get unread messages count (mock for now)
      const unreadMessages = 0;

      // Get saved VAs count (mock for now)
      const savedVAs = 0;

      return {
        success: true,
        data: {
          activeJobs: company.jobPostings?.length || 0,
          totalApplications: applicationsCount,
          hiredVAs,
          totalSpent,
          pendingReviews,
          unreadMessages,
          savedVAs
        }
      };
    } catch (error: any) {
      console.error('Dashboard stats error:', error);
      return reply.code(500).send({ 
        error: "Failed to fetch dashboard stats",
        code: "STATS_FETCH_ERROR",
        details: error.message
      });
    }
  });

  // Get Recent Jobs
  app.get("/employer/jobs", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const limit = parseInt((request.query as any).limit || '10');
    const offset = parseInt((request.query as any).offset || '0');
    
    try {
      const company = await prisma.company.findUnique({
        where: { userId: user.uid }
      });

      if (!company) {
        return reply.code(404).send({ 
          error: "Company profile not found",
          code: "COMPANY_NOT_FOUND"
        });
      }

      const jobs = await prisma.jobPosting.findMany({
        where: { companyId: company.id },
        include: {
          _count: {
            select: { proposals: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      });

      return {
        success: true,
        data: {
          jobs: jobs.map(job => ({
            id: job.id,
            title: job.title,
            description: job.description,
            hourlyRate: {
              min: parseInt(job.rateRange?.split('-')[0] || '0') || 0,
              max: parseInt(job.rateRange?.split('-')[1] || '0') || 0
            },
            skills: job.skillsRequired || [],
            createdAt: job.createdAt,
            status: job.status as 'active' | 'closed' | 'filled',
            applicationsCount: job._count?.proposals || 0
          })),
          pagination: {
            total: jobs.length,
            limit,
            offset
          }
        }
      };
    } catch (error: any) {
      console.error('Recent jobs error:', error);
      return reply.code(500).send({ 
        error: "Failed to fetch jobs",
        code: "JOBS_FETCH_ERROR",
        details: error.message
      });
    }
  });

  // Get Recent Applications
  app.get("/employer/applications", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const limit = parseInt((request.query as any).limit || '10');
    const offset = parseInt((request.query as any).offset || '0');
    
    try {
      const company = await prisma.company.findUnique({
        where: { userId: user.uid }
      });

      if (!company) {
        return reply.code(404).send({ 
          error: "Company profile not found",
          code: "COMPANY_NOT_FOUND"
        });
      }

      const proposals = await prisma.proposal.findMany({
        where: {
          jobPosting: {
            companyId: company.id
          }
        },
        include: {
          vaProfile: {
            include: {
              user: {
                select: { email: true }
              }
            }
          },
          jobPosting: true
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      });

      return {
        success: true,
        data: {
          applications: proposals.map(proposal => ({
            id: proposal.id,
            jobId: proposal.jobPostingId,
            jobTitle: proposal.jobPosting.title,
            vaName: proposal.vaProfile?.name || 'Unknown',
            vaAvatar: proposal.vaProfile?.avatarUrl,
            hourlyRate: proposal.hourlyRate || proposal.bidAmount || 0,
            status: proposal.status as 'pending' | 'viewed' | 'interviewed' | 'hired' | 'rejected',
            appliedAt: proposal.createdAt
          })),
          pagination: {
            total: proposals.length,
            limit,
            offset
          }
        }
      };
    } catch (error: any) {
      console.error('Applications error:', error);
      return reply.code(500).send({ 
        error: "Failed to fetch applications",
        code: "APPLICATIONS_FETCH_ERROR",
        details: error.message
      });
    }
  });
}
