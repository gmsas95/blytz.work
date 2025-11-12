// Complete VA Profile Management - CRUD Operations
import { FastifyInstance } from "fastify";
import { prisma } from "../utils/prisma.js";
import { verifyAuth } from "../plugins/firebaseAuth.js";
import { z } from "zod";

// Validation schemas
const createVAProfileSchema = z.object({
  name: z.string().min(2, "Name is required"),
  bio: z.string().optional(),
  country: z.string().min(2, "Country is required"),
  hourlyRate: z.number().min(5, "Hourly rate must be at least $5"),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  availability: z.boolean().default(true),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  timezone: z.string().optional(),
  languages: z.array(z.any()).optional(),
  workExperience: z.array(z.any()).optional(),
  education: z.array(z.any()).optional(),
  responseRate: z.number().min(0).max(100).optional(),
  averageRating: z.number().min(1).max(5).optional(),
  totalReviews: true,
  featuredProfile: z.boolean().default(false),
  profileViews: z.number().min(0).default(0),
  resumeUrl: z.string().url().optional(),
  videoIntroUrl: z.string().url().optional(),
  skillsScore: z.number().min(0).max(100).optional(),
  verificationLevel: z.enum(["basic", "professional", "premium"]).default("basic"),
  backgroundCheckPassed: z.boolean().default(false),
  featured: z.boolean().default(false),
  earnedAmount: z.number().min(0).default(0),
  completedJobs: z.number().min(0).default(0),
  avatarUrl: z.string().url().optional()
});

const updateVAProfileSchema = z.object({
  name: z.string().min(2).optional(),
  bio: z.string().optional(),
  country: z.string().min(2).optional(),
  hourlyRate: z.number().min(5).optional(),
  skills: z.array(z.string()).optional(),
  availability: z.boolean().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  timezone: z.string().optional(),
  languages: z.array(z.any()).optional(),
  workExperience: z.array(z.any()).optional(),
  education: z.array(z.any()).optional(),
  responseRate: z.number().min(0).max(100).optional(),
  averageRating: z.number().min(1).max(5).optional(),
  totalReviews: true,
  featuredProfile: z.boolean().optional(),
  profileViews: z.number().min(0).optional(),
  resumeUrl: z.string().url().optional(),
  videoIntroUrl: z.string().url().optional(),
  skillsScore: z.number().min(0).max(100).optional(),
  verificationLevel: z.enum(["basic", "professional", "premium"]).optional(),
  backgroundCheckPassed: z.boolean().optional(),
  featured: z.boolean().optional(),
  earnedAmount: z.number().min(0).optional(),
  completedJobs: z.number().min(0).optional(),
  avatarUrl: z.string().url().optional()
});

export default async function vaProfileRoutes(app: FastifyInstance) {
  // Create VA Profile
  app.post("/va/profile", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const data = createVAProfileSchema.parse(request.body);

    try {
      // Check if user already has a VA profile
      const existingProfile = await prisma.user.findUnique({
        where: { id: user.uid },
        include: { vaProfile: true }
      });

      if (existingProfile?.vaProfile) {
        return reply.code(400).send({ 
          error: "VA profile already exists",
          code: "PROFILE_EXISTS"
        });
      }

      // Create VA profile
      const vaProfile = await prisma.vAProfile.create({
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
        data: vaProfile,
        message: "VA profile created successfully"
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
        error: "Failed to create VA profile",
        code: "PROFILE_CREATE_ERROR",
        details: error.message
      });
    }
  });

  // Get VA Profile
  app.get("/va/profile", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;

    try {
      const vaProfile = await prisma.vAProfile.findUnique({
        where: { userId: user.uid }
      });

      if (!vaProfile) {
        return reply.code(404).send({ 
          error: "VA profile not found",
          code: "PROFILE_NOT_FOUND"
        });
      }

      return {
        success: true,
        data: vaProfile
      };
    } catch (error: any) {
      return reply.code(500).send({ 
        error: "Failed to fetch VA profile",
        code: "PROFILE_FETCH_ERROR",
        details: error.message
      });
    }
  });

  // Update VA Profile
  app.put("/va/profile", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const data = updateVAProfileSchema.parse(request.body);

    try {
      // Check if profile exists
      const existingProfile = await prisma.vAProfile.findUnique({
        where: { userId: user.uid }
      });

      if (!existingProfile) {
        return reply.code(404).send({ 
          error: "VA profile not found",
          code: "PROFILE_NOT_FOUND"
        });
      }

      // Update profile
      const updatedProfile = await prisma.vAProfile.update({
        where: { userId: user.uid },
        data: {
          ...data,
          updatedAt: new Date()
        }
      });

      return {
        success: true,
        data: updatedProfile,
        message: "VA profile updated successfully"
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
        error: "Failed to update VA profile",
        code: "PROFILE_UPDATE_ERROR",
        details: error.message
      });
    }
  });

  // Delete VA Profile
  app.delete("/va/profile", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;

    try {
      // Check if profile exists
      const existingProfile = await prisma.vAProfile.findUnique({
        where: { userId: user.uid }
      });

      if (!existingProfile) {
        return reply.code(404).send({ 
          error: "VA profile not found",
          code: "PROFILE_NOT_FOUND"
        });
      }

      // Check for active contracts
      const activeContracts = await prisma.contract.findMany({
        where: {
          vaProfileId: existingProfile.id,
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
      await prisma.vAProfile.delete({
        where: { userId: user.uid }
      });

      // Update user profile completion
      await prisma.user.update({
        where: { id: user.uid },
        data: { profileComplete: false }
      });

      return {
        success: true,
        message: "VA profile deleted successfully"
      };
    } catch (error: any) {
      return reply.code(500).send({ 
        error: "Failed to delete VA profile",
        code: "PROFILE_DELETE_ERROR",
        details: error.message
      });
    }
  });

  // Get VA Profile by ID (public view)
  app.get("/va/profiles/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      const vaProfile = await prisma.vAProfile.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          bio: true,
          country: true,
          hourlyRate: true,
          skills: true,
          availability: true,
          languages: true,
          workExperience: true,
          education: true,
          responseRate: true,
          averageRating: true,
          totalReviews: true,
          featuredProfile: true,
          featured: true,
          earnedAmount: true,
          completedJobs: true,
          avatarUrl: true,
          // Exclude sensitive information
          email: false,
          phone: false,
          resumeUrl: false,
          videoIntroUrl: false
        }
      });

      if (!vaProfile) {
        return reply.code(404).send({ 
          error: "VA profile not found",
          code: "PROFILE_NOT_FOUND"
        });
      }

      return {
        success: true,
        data: vaProfile
      };
    } catch (error: any) {
      return reply.code(500).send({ 
        error: "Failed to fetch VA profile",
        code: "PROFILE_FETCH_ERROR",
        details: error.message
      });
    }
  });

  // List VA Profiles (with pagination and filtering)
  app.get("/va/profiles", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { 
      page = 1, 
      limit = 20, 
      skills, 
      country, 
      minRate, 
      maxRate, 
      available,
      search
    } = request.query as { 
      page: string; 
      limit: string; 
      skills?: string; 
      country?: string; 
      minRate?: string; 
      maxRate?: string; 
      available?: string;
      search?: string;
    };

    try {
      // Only companies can browse VA profiles
      if (user.role !== 'company') {
        return reply.code(403).send({ 
          error: "Only companies can browse VA profiles",
          code: "ACCESS_DENIED"
        });
      }

      const whereClause: any = {};
      
      // Add filters
      if (skills) {
        whereClause.skills = { hasSome: skills.split(',') };
      }
      if (country) {
        whereClause.country = country;
      }
      if (available === 'true') {
        whereClause.availability = true;
      }
      if (minRate || maxRate) {
        whereClause.hourlyRate = {};
        if (minRate) whereClause.hourlyRate.gte = parseInt(minRate);
        if (maxRate) whereClause.hourlyRate.lte = parseInt(maxRate);
      }
      if (search) {
        whereClause.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { bio: { contains: search, mode: "insensitive" } },
          { skills: { hasSome: [search] } }
        ];
      }

      const vaProfiles = await prisma.vAProfile.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          bio: true,
          country: true,
          hourlyRate: true,
          skills: true,
          availability: true,
          languages: true,
          responseRate: true,
          averageRating: true,
          totalReviews: true,
          featuredProfile: true,
          featured: true,
          earnedAmount: true,
          completedJobs: true,
          avatarUrl: true
        },
        orderBy: [
          { featured: 'desc' },
          { averageRating: 'desc' },
          { completedJobs: 'desc' }
        ],
        take: parseInt(limit),
        skip: (parseInt(page) - 1) * parseInt(limit)
      });

      const total = await prisma.vAProfile.count({ where: whereClause });

      return {
        success: true,
        data: {
          vaProfiles,
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
        error: "Failed to fetch VA profiles",
        code: "PROFILES_FETCH_ERROR",
        details: error.message
      });
    }
  });
}