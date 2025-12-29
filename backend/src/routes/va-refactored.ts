// VA Profile Routes - Refactored with Service Layer
import { FastifyInstance } from "fastify";
import { verifyAuth } from "../plugins/firebaseAuth.js";
import { z } from "zod";
import { ProfileService } from "../services/profileService.js";
import { VAProfileRepository } from "../repositories/vaProfileRepository.js";

// Validation schemas
const createVAProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  country: z.string().min(2, "Country is required"),
  hourlyRate: z.number().min(1, "Hourly rate must be at least $1"),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  bio: z.string().min(10, "Bio must be at least 10 characters").optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  timezone: z.string().optional(),
  availability: z.boolean().default(true),
  languages: z.any().optional(),
  workExperience: z.any().optional(),
  education: z.any().optional()
});

const updateVAProfileSchema = z.object({
  name: z.string().min(2).optional(),
  bio: z.string().min(10).optional(),
  country: z.string().min(2).optional(),
  hourlyRate: z.number().min(1).optional(),
  skills: z.array(z.string()).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  timezone: z.string().optional(),
  availability: z.boolean().optional(),
  languages: z.any().optional(),
  workExperience: z.any().optional(),
  education: z.any().optional(),
  avatarUrl: z.string().url().optional(),
  resumeUrl: z.string().url().optional(),
  videoIntroUrl: z.string().url().optional()
});

export default async function vaRoutes(app: FastifyInstance) {
  const profileService = new ProfileService();
  const vaProfileRepo = new VAProfileRepository();

  // Get VA profile
  app.get("/va/profile", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;

    try {
      const profile = await profileService.getVAProfile(user.uid);

      return {
        success: true,
        data: profile
      };
    } catch (error: any) {
      return reply.code(404).send({
        error: "VA profile not found",
        code: "PROFILE_NOT_FOUND",
        details: error.message
      });
    }
  });

  // Create VA profile
  app.post("/va/profile", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;

    try {
      const data = createVAProfileSchema.parse(request.body);
      const profile = await profileService.createVAProfile(user.uid, data);

      return reply.code(201).send({
        success: true,
        data: profile,
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
        code: "PROFILE_CREATION_ERROR",
        details: error.message
      });
    }
  });

  // Update VA profile
  app.put("/va/profile", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;

    try {
      const data = updateVAProfileSchema.parse(request.body);

      // Get user's VA profile ID
      const existingProfile = await vaProfileRepo.findByUserId(user.uid);
      if (!existingProfile) {
        return reply.code(404).send({
          error: "VA profile not found",
          code: "PROFILE_NOT_FOUND"
        });
      }

      const profile = await profileService.updateVAProfile(existingProfile.id, data);

      return {
        success: true,
        data: profile,
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

  // Search VA profiles
  app.get("/va/search", async (request, reply) => {
    try {
      const query = (request.query as any).query || '';
      const page = parseInt((request.query as any).page || '1');
      const limit = parseInt((request.query as any).limit || '20');

      const filters: any = {};

      // Apply filters if provided
      if ((request.query as any).country) {
        filters.country = (request.query as any).country;
      }
      if ((request.query as any).minRate) {
        filters.hourlyRate = { ...filters.hourlyRate, gte: parseFloat((request.query as any).minRate) };
      }
      if ((request.query as any).maxRate) {
        filters.hourlyRate = { ...filters.hourlyRate, lte: parseFloat((request.query as any).maxRate) };
      }
      if ((request.query as any).skills) {
        const skillsArray = (request.query as any).skills.split(',').map((s: string) => s.trim());
        filters.skills = { hasSome: skillsArray };
      }
      if ((request.query as any).availability) {
        filters.availability = (request.query as any).availability === 'true';
      }

      const profiles = await profileService.searchVAProfiles(query, filters, { page, limit });

      return {
        success: true,
        data: profiles,
        pagination: { page, limit }
      };
    } catch (error: any) {
      return reply.code(500).send({
        error: "Failed to search VA profiles",
        code: "SEARCH_ERROR",
        details: error.message
      });
    }
  });

  // Get VA profile by ID (for viewing other profiles)
  app.get("/va/profile/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const vaProfileRepo = new VAProfileRepository();

      const profile = await vaProfileRepo.findById(id);

      if (!profile) {
        return reply.code(404).send({
          error: "VA profile not found",
          code: "PROFILE_NOT_FOUND"
        });
      }

      // Increment profile view count
      await vaProfileRepo.incrementProfileViews(id);

      return {
        success: true,
        data: profile
      };
    } catch (error: any) {
      return reply.code(500).send({
        error: "Failed to fetch VA profile",
        code: "PROFILE_FETCH_ERROR",
        details: error.message
      });
    }
  });
}
