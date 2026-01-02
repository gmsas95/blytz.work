// Complete VA Profile Management - CRUD Operations
import { FastifyInstance } from "fastify";
import { prisma } from "../utils/prisma.js";
import { verifyAuth } from "../plugins/firebaseAuth-simplified.js";

export default async function vaProfileRoutes(app: FastifyInstance) {
  // Create VA Profile - DISABLED to avoid duplicate route with va.ts
  // This functionality is now handled in va.ts

  // Get VA Profile (moved to va.ts to avoid duplicate routes)

  // Update VA Profile - DISABLED to avoid duplicate route with va.ts
  // This functionality is now handled in va.ts

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
        if (minRate) whereClause.hourlyRate.gte = Number(minRate);
        if (maxRate) whereClause.hourlyRate.lte = Number(maxRate);
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
        take: Number(limit),
        skip: (Number(page) - 1) * Number(limit)
      });

      const total = await prisma.vAProfile.count({ where: whereClause });

      return {
        success: true,
        data: {
          vaProfiles,
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
        error: "Failed to fetch VA profiles",
        code: "PROFILES_FETCH_ERROR",
        details: error.message
      });
    }
  });
}