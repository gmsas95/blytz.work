// Browse companies for VAs
import { FastifyInstance } from "fastify";
import { prisma } from "../utils/prisma.js";
import { verifyAuth } from "../plugins/firebaseAuth-simplified.js";
import { z } from "zod";

const browseCompaniesSchema = z.object({
  search: z.string().optional(),
  industry: z.string().optional(),
  companySize: z.enum(["1-10", "11-50", "51-200", "201+"]).optional(),
  minSpent: z.number().optional(),
  maxSpent: z.number().optional(),
  verificationLevel: z.enum(['basic', 'professional', 'premium']).optional(),
  page: z.string().default('1'),
  limit: z.string().default('20'),
  sortBy: z.enum(['spent', 'size', 'recent', 'jobs']).default('spent')
});

export default async function companiesBrowseRoutes(app: FastifyInstance) {
  // List all companies with filtering
  app.get("/companies/list", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    try {
      const params = browseCompaniesSchema.parse(request.query);
      
      const whereClause: any = {};
      
      // Search filter
      if (params.search) {
        whereClause.OR = [
          { name: { contains: params.search, mode: "insensitive" } },
          { bio: { contains: params.search, mode: "insensitive" } },
          { industry: { contains: params.search, mode: "insensitive" } }
        ];
      }
      
      // Industry filter
      if (params.industry) {
        whereClause.industry = params.industry;
      }
      
      // Company size filter
      if (params.companySize) {
        whereClause.companySize = params.companySize;
      }
      
      // Spending filter
      if (params.minSpent) {
        whereClause.totalSpent = { gte: params.minSpent };
      }
      if (params.maxSpent) {
        whereClause.totalSpent = { ...whereClause.totalSpent, lte: params.maxSpent };
      }
      
      // Verification level filter
      if (params.verificationLevel) {
        whereClause.verificationLevel = params.verificationLevel;
      }
      
      // Sorting
      let orderBy: any = {};
      switch (params.sortBy) {
        case 'spent':
          orderBy = { totalSpent: 'desc' };
          break;
        case 'size':
          orderBy = { companySize: 'desc' };
          break;
        case 'recent':
          orderBy = { createdAt: 'desc' };
          break;
        case 'jobs':
          orderBy = { jobPostings: { _count: 'desc' } };
          break;
        default:
          orderBy = { totalSpent: 'desc' };
      }
      
      const [companies, total] = await Promise.all([
        prisma.company.findMany({
          where: whereClause,
          include: { 
            user: { select: { email: true } },
            jobPostings: { 
              where: { status: 'open' },
              take: 5,
              orderBy: { createdAt: 'desc' }
            }
          },
          orderBy,
          take: parseInt(params.limit),
          skip: (parseInt(params.page) - 1) * parseInt(params.limit)
        }),
        prisma.company.count({ where: whereClause })
      ]);
      
      return {
        success: true,
        data: {
          companies,
          pagination: {
            page: parseInt(params.page),
            limit: parseInt(params.limit),
            total,
            totalPages: Math.ceil(total / parseInt(params.limit))
          }
        }
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
        error: "Failed to fetch companies",
        code: "COMPANIES_FETCH_ERROR",
        details: error.message
      });
    }
  });
}
