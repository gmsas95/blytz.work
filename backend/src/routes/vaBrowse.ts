// Browse VAs for employers with vertical and subcategory filtering
import { FastifyInstance } from "fastify";
import { prisma } from "../utils/prisma.js";
import { verifyAuth } from "../plugins/firebaseAuth-simplified.js";
import { z } from "zod";

// Subcategories for each vertical
const SUBCATEGORIES = {
  technical: [
    "Programming", "DevOps", "Tech Support", "Data Science", "Quality Assurance",
    "Security", "Database Administration", "Mobile Development", "Web Development",
    "Cloud Computing", "Network Engineering", "System Administration",
    "API Development", "Machine Learning", "AI Engineering", "Blockchain",
    "Game Development", "Embedded Systems", "UI/UX Design", "Testing"
  ],
  operations: [
    "Virtual Assistance", "Admin Support", "Customer Service", "Project Management",
    "Bookkeeping", "Data Entry", "Executive Assistant", "Personal Assistant",
    "Research Assistant", "Scheduling", "Email Management", "Calendar Management",
    "Document Preparation", "HR Support", "Operations", "Logistics",
    "Virtual Receptionist", "Transcription", "Translation", "Customer Onboarding"
  ],
  creatives: [
    "Design", "Content Writing", "Marketing", "Social Media", "Branding",
    "Animation", "Video Editing", "Graphic Design", "Copywriting", "SEO",
    "Photography", "Illustration", "Voice Over", "Audio Production",
    "Podcast Production", "3D Modeling", "Motion Graphics", "Brand Strategy"
  ]
};

const browseVASchema = z.object({
  vertical: z.enum(['technical', 'operations', 'creatives']).optional(),
  subcategories: z.string().optional(),
  search: z.string().optional(),
  skills: z.string().optional(),
  minRate: z.number().optional(),
  maxRate: z.number().optional(),
  country: z.string().optional(),
  availability: z.boolean().optional(),
  verificationLevel: z.enum(['basic', 'professional', 'premium']).optional(),
  page: z.string().default('1'),
  limit: z.string().default('20'),
  sortBy: z.enum(['rating', 'rate_low', 'rate_high', 'experience', 'recent']).default('rating')
});

export default async function vaBrowseRoutes(app: FastifyInstance) {
  // Get available subcategories for a vertical
  app.get("/va/subcategories", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const { vertical } = request.query as { vertical?: string };
    
    try {
      const subcategories = vertical ? SUBCATEGORIES[vertical as keyof typeof SUBCATEGORIES] || [];
      
      return {
        success: true,
        data: {
          vertical,
          subcategories
        }
      };
    } catch (error: any) {
      return reply.code(500).send({ 
        error: "Failed to fetch subcategories",
        code: "SUBCATEGORIES_FETCH_ERROR",
        details: error.message
      });
    }
  });

  // List all VAs with filtering
  app.get("/va/profiles/list", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    
    try {
      const params = browseVASchema.parse(request.query);
      
      const whereClause: any = {};
      
      // Vertical filter
      if (params.vertical) {
        whereClause.vertical = params.vertical;
      }
      
      // Subcategories filter (NEW)
      if (params.subcategories) {
        const subcategoryArray = params.subcategories.split(',').map(s => s.trim().toLowerCase());
        whereClause.subcategories = {
          hasSome: subcategoryArray
        };
      }
      
      // Search filter
      if (params.search) {
        whereClause.OR = [
          { name: { contains: params.search, mode: "insensitive" } },
          { bio: { contains: params.search, mode: "insensitive" } },
          { skills: { hasSome: params.search.split(',') } }
        ];
      }
      
      // Skills filter
      if (params.skills) {
        const skillArray = params.skills.split(',').map(s => s.trim());
        whereClause.skills = { hasSome: skillArray };
      }
      
      // Rate filter
      if (params.minRate) {
        whereClause.hourlyRate = { ...whereClause.hourlyRate, gte: parseInt(params.minRate) };
      }
      if (params.maxRate) {
        whereClause.hourlyRate = { ...whereClause.hourlyRate, lte: parseInt(params.maxRate) };
      }
      
      // Country filter
      if (params.country) {
        whereClause.country = params.country;
      }
      
      // Availability filter
      if (params.availability !== undefined) {
        whereClause.availability = params.availability;
      }
      
      // Verification level filter
      if (params.verificationLevel) {
        whereClause.verificationLevel = params.verificationLevel;
      }
      
      // Sorting
      let orderBy: any = {};
      switch (params.sortBy) {
        case 'rating':
          orderBy = { averageRating: 'desc' };
          break;
        case 'rate_low':
          orderBy = { hourlyRate: 'asc' };
          break;
        case 'rate_high':
          orderBy = { hourlyRate: 'desc' };
          break;
        case 'experience':
          orderBy = { completedJobs: 'desc' };
          break;
        case 'recent':
          orderBy = { createdAt: 'desc' };
          break;
        default:
          orderBy = { averageRating: 'desc' };
      }
      
      const [profiles, total] = await Promise.all([
        prisma.vAProfile.findMany({
          where: whereClause,
          include: { 
            user: { select: { email: true } },
            portfolioItems: { take: 3, orderBy: { createdAt: 'desc' } },
            skillsAssessments: { take: 5, orderBy: { completedAt: 'desc' } }
          },
          orderBy,
          take: parseInt(params.limit),
          skip: (parseInt(params.page) - 1) * parseInt(params.limit)
        }),
        prisma.vAProfile.count({ where: whereClause })
      ]);
      
      return {
        success: true,
        data: {
          vaProfiles: profiles,
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
        error: "Failed to fetch VA profiles",
        code: "VA_PROFILES_FETCH_ERROR",
        details: error.message
      });
    }
  });
}
