// Complete Company Profile Management - CRUD Operations
import { FastifyInstance } from "fastify";
import { prisma } from "../utils/prisma.js";
import { verifyAuth } from "../plugins/firebaseAuth-simplified.js";
import { z } from "zod";

// Validation schemas
const createCompanyProfileSchema = z.object({
  name: z.string().min(2, "Company name is required"),
  bio: z.string().optional(),
  country: z.string().min(2, "Country is required"),
  website: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
  industry: z.string().optional(),
  companySize: z.enum(["1-10", "11-50", "51-200", "201+"]).optional(),
  foundedYear: z.number().min(1800).max(new Date().getFullYear()).optional(),
  description: z.string().optional(),
  mission: z.string().optional(),
  values: z.array(z.any()).optional(),
  benefits: z.array(z.any()).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  verificationLevel: z.enum(["basic", "professional", "premium"]).default("basic"),
  backgroundCheckPassed: z.boolean().default(false),
  featuredCompany: z.boolean().default(false),
  socialLinks: z.array(z.any()).optional(),
  techStack: z.array(z.any()).optional(),
  totalSpent: z.number().min(0).default(0)
});

const updateCompanyProfileSchema = z.object({
  name: z.string().min(2).optional(),
  bio: z.string().optional(),
  country: z.string().min(2).optional(),
  website: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
  industry: z.string().optional(),
  companySize: z.enum(["1-10", "11-50", "51-200", "201+"]).optional(),
  foundedYear: z.number().min(1800).max(new Date().getFullYear()).optional(),
  description: z.string().optional(),
  mission: z.string().optional(),
  values: z.array(z.any()).optional(),
  benefits: z.array(z.any()).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  verificationLevel: z.enum(["basic", "professional", "premium"]).optional(),
  backgroundCheckPassed: z.boolean().optional(),
  featuredCompany: z.boolean().optional(),
  socialLinks: z.array(z.any()).optional(),
  techStack: z.array(z.any()).optional(),
  totalSpent: z.number().min(0).optional()
});

export default async function companyProfileRoutes(app: FastifyInstance) {
  // Create Company Profile
  app.post("/company/profile", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const data = createCompanyProfileSchema.parse(request.body);

    try {
      // Check if user already has a company profile
      const existingProfile = await prisma.user.findUnique({
        where: { id: user.uid },
        include: { company: true }
      });

      if (existingProfile?.company) {
        return reply.code(400).send({ 
          error: "Company profile already exists",
          code: "PROFILE_EXISTS"
        });
      }

      // Create company profile
      const companyProfile = await prisma.company.create({
        data: {
          ...data,
          userId: user.uid
        }
      });

      // Update user profile completion
      await prisma.user.update({
        where: { id: user.uid },
        data: { profileComplete: true }
      });

      return reply.code(201).send({
        success: true,
        data: companyProfile,
        message: "Company profile created successfully"
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
        error: "Failed to create company profile",
        code: "PROFILE_CREATE_ERROR",
        details: error.message
      });
    }
  });

  // Get Company Profile
  app.get("/company/profile", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;

    try {
      const companyProfile = await prisma.company.findUnique({
        where: { userId: user.uid }
      });

      if (!companyProfile) {
        return reply.code(404).send({ 
          error: "Company profile not found",
          code: "PROFILE_NOT_FOUND"
        });
      }

      return {
        success: true,
        data: companyProfile
      };
    } catch (error: any) {
      return reply.code(500).send({ 
        error: "Failed to fetch company profile",
        code: "PROFILE_FETCH_ERROR",
        details: error.message
      });
    }
  });

  // Update Company Profile
  app.put("/company/profile", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const data = updateCompanyProfileSchema.parse(request.body);

    try {
      // Check if profile exists
      const existingProfile = await prisma.company.findUnique({
        where: { userId: user.uid }
      });

      if (!existingProfile) {
        return reply.code(404).send({ 
          error: "Company profile not found",
          code: "PROFILE_NOT_FOUND"
        });
      }

      // Update profile
      const updatedProfile = await prisma.company.update({
        where: { userId: user.uid },
        data: {
          ...data,
          updatedAt: new Date()
        }
      });

      return {
        success: true,
        data: updatedProfile,
        message: "Company profile updated successfully"
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
        error: "Failed to update company profile",
        code: "PROFILE_UPDATE_ERROR",
        details: error.message
      });
    }
  });

  // Delete Company Profile
  app.delete("/company/profile", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;

    try {
      // Check if profile exists
      const existingProfile = await prisma.company.findUnique({
        where: { userId: user.uid }
      });

      if (!existingProfile) {
        return reply.code(404).send({ 
          error: "Company profile not found",
          code: "PROFILE_NOT_FOUND"
        });
      }

      // Check for active job postings
      const activeJobPostings = await prisma.jobPosting.findMany({
        where: {
          companyId: existingProfile.id,
          status: { in: ['open', 'in_progress'] }
        }
      });

      if (activeJobPostings.length > 0) {
        return reply.code(400).send({ 
          error: "Cannot delete profile with active job postings",
          code: "ACTIVE_JOBS_EXIST",
          details: "Please close or delete all active job postings before deleting your profile"
        });
      }

      // Check for active contracts
      const activeContracts = await prisma.contract.findMany({
        where: {
          companyId: existingProfile.id,
          status: { in: ['active', 'paused'] }
        }
      });

      if (activeContracts.length > 0) {
        return reply.code(400).send({ 
          error: "Cannot delete profile with active contracts",
          code: "ACTIVE_CONTRACTS_EXIST",
          details: "Please complete or cancel all active contracts before deleting your profile"
        });
      }

      // Delete profile
      await prisma.company.delete({
        where: { userId: user.uid }
      });

      // Update user profile completion
      await prisma.user.update({
        where: { id: user.uid },
        data: { profileComplete: false }
      });

      return {
        success: true,
        message: "Company profile deleted successfully"
      };
    } catch (error: any) {
      return reply.code(500).send({ 
        error: "Failed to delete company profile",
        code: "PROFILE_DELETE_ERROR",
        details: error.message
      });
    }
  });

  // Get Company Profile by ID (public view)
  app.get("/company/profiles/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      const companyProfile = await prisma.company.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          bio: true,
          country: true,
          website: true,
          logoUrl: true,
          industry: true,
          companySize: true,
          foundedYear: true,
          description: true,
          mission: true,
          values: true,
          benefits: true,
          verificationLevel: true,
          featuredCompany: true,
          socialLinks: true,
          techStack: true,
          totalSpent: true
          // Exclude sensitive information
          // email: false,
          // phone: false,
          // backgroundCheckPassed: false
        }
      });

      if (!companyProfile) {
        return reply.code(404).send({ 
          error: "Company profile not found",
          code: "PROFILE_NOT_FOUND"
        });
      }

      return {
        success: true,
        data: companyProfile
      };
    } catch (error: any) {
      return reply.code(500).send({ 
        error: "Failed to fetch company profile",
        code: "PROFILE_FETCH_ERROR",
        details: error.message
      });
    }
  });

  // List Company Profiles (with pagination and filtering)
  app.get("/company/profiles", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { 
      page = 1, 
      limit = 20, 
      industry, 
      country, 
      companySize, 
      verificationLevel,
      featured,
      search
    } = request.query as { 
      page: string; 
      limit: string; 
      industry?: string; 
      country?: string; 
      companySize?: string; 
      verificationLevel?: string;
      featured?: string;
      search?: string;
    };

    try {
      // Only VAs can browse company profiles
      if (user.role !== 'va') {
        return reply.code(403).send({ 
          error: "Only VAs can browse company profiles",
          code: "ACCESS_DENIED"
        });
      }

      const whereClause: any = {};
      
      // Add filters
      if (industry) {
        whereClause.industry = industry;
      }
      if (country) {
        whereClause.country = country;
      }
      if (companySize) {
        whereClause.companySize = companySize;
      }
      if (verificationLevel) {
        whereClause.verificationLevel = verificationLevel;
      }
      if (featured === 'true') {
        whereClause.featuredCompany = true;
      }
      if (search) {
        whereClause.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { bio: { contains: search, mode: "insensitive" } },
          { industry: { contains: search, mode: "insensitive" } }
        ];
      }

      const companyProfiles = await prisma.company.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          bio: true,
          country: true,
          website: true,
          logoUrl: true,
          industry: true,
          companySize: true,
          foundedYear: true,
          description: true,
          mission: true,
          benefits: true,
          verificationLevel: true,
          featuredCompany: true,
          socialLinks: true,
          techStack: true,
          totalSpent: true
        },
        orderBy: [
          { featuredCompany: 'desc' },
          { totalSpent: 'desc' },
          { name: 'asc' }
        ],
        take: Number(limit),
        skip: (Number(page) - 1) * Number(limit)
      });

      const total = await prisma.company.count({ where: whereClause });

      return {
        success: true,
        data: {
          companyProfiles,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit))
          }
        }
      };
    } catch (error: any) {
      return reply.code(500).send({ 
        error: "Failed to fetch company profiles",
        code: "PROFILES_FETCH_ERROR",
        details: error.message
      });
    }
  });
}