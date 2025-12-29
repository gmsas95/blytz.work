// Simplified Company Routes - Refactored with Service Layer
import { FastifyInstance } from "fastify";
import { verifyAuth } from "../plugins/firebaseAuth.js";
import { z } from "zod";
import { ProfileService } from "../services/profileService.js";
import { CompanyRepository } from "../repositories/companyRepository.js";
import { UserRepository } from "../repositories/userRepository.js";

// Validation schemas
const createCompanyProfileSchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  country: z.string().min(2, "Country is required"),
  bio: z.string().min(10, "Bio must be at least 10 characters").optional(),
  website: z.string().optional().transform((val) => val && val.trim() !== "" ? val : null),
  industry: z.string().min(2, "Industry is required"),
  companySize: z.enum(["1-10", "11-50", "51-200", "201+"]).optional(),
  foundedYear: z.number().min(1800).max(new Date().getFullYear()).optional(),
  description: z.string().min(20, "Description must be at least 20 characters").optional(),
  mission: z.string().min(10, "Mission statement is required").optional(),
  values: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  socialLinks: z.object({
    linkedin: z.string().url("Invalid url").optional(),
    twitter: z.string().url("Invalid url").optional(),
    facebook: z.string().url("Invalid url").optional(),
    instagram: z.string().url("Invalid url").optional(),
    youtube: z.string().url("Invalid url").optional()
  }).optional(),
  techStack: z.array(z.string()).optional()
});

export default async function companyRoutes(app: FastifyInstance) {
  const profileService = new ProfileService();
  const companyRepo = new CompanyRepository();
  const userRepo = new UserRepository();

  // Get company profile
  app.get("/company/profile", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;

    try {
      const profile = await profileService.getCompanyProfile(user.uid);

      return {
        success: true,
        data: profile
      };
    } catch (error: any) {
      return reply.code(404).send({
        error: "Company profile not found",
        code: "PROFILE_NOT_FOUND",
        details: error.message
      });
    }
  });

  // Create company profile
  app.post("/company/profile", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const data = createCompanyProfileSchema.parse(request.body);

    try {
      const profile = await profileService.createCompanyProfile(user.uid, data);

      return reply.code(201).send({
        success: true,
        data: profile,
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
        code: "PROFILE_CREATION_ERROR",
        details: error.message
      });
    }
  });

  // Update company profile
  app.put("/company/profile", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const data = createCompanyProfileSchema.partial().parse(request.body);

    try {
      const profile = await profileService.updateCompanyProfile(user.uid, data);

      return {
        success: true,
        data: profile,
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

  // Upload company logo
  app.post("/company/upload-logo", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;

    try {
      const fileUrl = (request as any).fileUrl;
      if (!fileUrl) {
        return reply.code(400).send({
          error: "File URL is required",
          code: "FILE_URL_REQUIRED"
        });
      }

      const company = await companyRepo.findByUserId(user.uid);
      if (!company) {
        return reply.code(404).send({
          error: "Company profile not found",
          code: "PROFILE_NOT_FOUND"
        });
      }

      const profile = await companyRepo.update(company.id, { logoUrl: fileUrl });

      return reply.code(201).send({
        success: true,
        data: { logoUrl: fileUrl },
        message: "Company logo uploaded successfully"
      });
    } catch (error: any) {
      return reply.code(500).send({
        error: "Failed to upload logo",
        code: "LOGO_UPLOAD_ERROR",
        details: error.message
      });
    }
  });

  // Company verification
  app.post("/company/verification", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { level } = request.body as { level: 'professional' | 'premium' };

    try {
      const company = await companyRepo.findByUserId(user.uid);
      if (!company) {
        return reply.code(404).send({
          error: "Company profile not found",
          code: "PROFILE_NOT_FOUND"
        });
      }

      const profile = await companyRepo.update(company.id, {
        verificationLevel: level,
        backgroundCheckPassed: level === 'premium'
      });

      return {
        success: true,
        data: profile,
        message: `Verification request submitted for ${level} level`
      };
    } catch (error: any) {
      return reply.code(500).send({
        error: "Failed to submit verification request",
        code: "VERIFICATION_ERROR",
        details: error.message
      });
    }
  });

  // Search company profiles
  app.get("/company/profiles/search", async (request, reply) => {
    try {
      const page = parseInt((request.query as any).page || '1');
      const limit = parseInt((request.query as any).limit || '20');
      const search = (request.query as any).search || '';
      const sortBy = (request.query as any).sortBy || 'updatedAt';
      const industry = (request.query as any).industry || '';
      const companySize = (request.query as any).companySize || '';
      const verificationLevel = (request.query as any).verificationLevel || '';

      const filters: any = {};
      if (search) {
        // Handled in repository search method
      }
      if (industry && industry !== 'all') {
        filters.industry = industry;
      }
      if (companySize && companySize !== 'all') {
        filters.companySize = companySize;
      }
      if (verificationLevel && verificationLevel !== 'all') {
        filters.verificationLevel = verificationLevel;
      }

      const profiles = await profileService.searchCompanies(search, { page, limit });

      return {
        success: true,
        data: {
          companyProfiles: profiles,
          pagination: {
            page,
            limit
          }
        }
      };
    } catch (error: any) {
      return reply.code(500).send({
        error: "Failed to search company profiles",
        code: "COMPANY_SEARCH_ERROR",
        details: error.message
      });
    }
  });
}
