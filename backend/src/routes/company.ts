// Simplified Company Routes for Week 2 MVP
import { FastifyInstance } from "fastify";
import { prisma } from "../utils/prisma.js";
import { verifyAuth } from "../plugins/firebaseAuth.js";
import { z } from "zod";

// Validation schemas - Frontend must match this exactly
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
  // Get company profile
  app.get("/company/profile", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    
    try {
      const profile = await prisma.company.findUnique({
        where: { userId: user.uid },
        include: {
          user: {
            select: { email: true }
          },
          jobPostings: true
        }
      });

      if (!profile) {
        return reply.code(404).send({ 
          error: "Company profile not found",
          code: "PROFILE_NOT_FOUND"
        });
      }

      const completionPercentage = calculateCompanyCompletion(profile);

      return {
        success: true,
        data: {
          ...profile,
          completionPercentage,
          jobPostings: profile.jobPostings || [],
          reviews: [],
          featuredProfile: profile.featuredCompany || false
        }
      };
    } catch (error: any) {
      return reply.code(500).send({ 
        error: "Failed to fetch company profile",
        code: "PROFILE_FETCH_ERROR",
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
      const existingProfile = await prisma.company.findUnique({
        where: { userId: user.uid }
      });

      if (existingProfile) {
        return reply.code(400).send({
          error: "Company profile already exists",
          code: "PROFILE_EXISTS"
        });
      }

      const userData = await prisma.user.findUnique({
        where: { id: user.uid }
      });

      if (!userData) {
        return reply.code(404).send({
          error: "User not found",
          code: "USER_NOT_FOUND"
        });
      }

      if (userData.role !== "company") {
        await prisma.user.update({
          where: { id: user.uid },
          data: { role: "company" }
        });
        app.log.info({ userId: user.uid, previousRole: userData.role }, 'User role auto-updated to company');
      }

      const profile = await prisma.company.create({
        data: {
          ...data,
          userId: user.uid,
          verificationLevel: "basic",
          backgroundCheckPassed: false,
          featuredCompany: false
        },
        include: {
          user: true
        }
      });

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
      const profile = await prisma.company.update({
        where: { userId: user.uid },
        data: data,
        include: {
          user: true
        }
      });

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

      const profile = await prisma.company.update({
        where: { userId: user.uid },
        data: {
          logoUrl: fileUrl
        }
      });

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
      const profile = await prisma.company.update({
        where: { userId: user.uid },
        data: {
          verificationLevel: level,
          backgroundCheckPassed: level === 'premium'
        }
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

  // Get company analytics
  app.get("/company/analytics", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    
    try {
      const profile = await prisma.company.findUnique({
        where: { userId: user.uid },
        include: {
          user: {
            select: { email: true }
          },
          jobPostings: {
            select: { id: true }
          }
        }
      });

      if (!profile) {
        return reply.code(404).send({ 
          error: "Company profile not found",
          code: "PROFILE_NOT_FOUND"
        });
      }

      const analytics = {
        conversionRate: 12.5,
        averageTimeToHire: 14.3,
        costPerHire: 2500,
        averageRating: 4.2,
        responseRate: 85.5,
        satisfactionScore: 4.1,
        trends: [
          { date: '2024-01-01', jobs: 5, matches: 23, hires: 3 },
          { date: '2024-01-02', jobs: 8, matches: 37, hires: 5 },
          { date: '2024-01-03', jobs: 6, matches: 12, hires: 4 }
        ]
      };

      return {
        success: true,
        data: {
          company: {
            name: profile.name,
            verificationLevel: profile.verificationLevel,
            totalJobs: profile.jobPostings?.length || 0,
            totalReviews: 0
          },
          performance: {
            totalMatches: 47,
            conversionRate: analytics.conversionRate,
            averageTimeToHire: analytics.averageTimeToHire,
            costPerHire: analytics.costPerHire,
            averageRating: analytics.averageRating,
            responseRate: analytics.responseRate,
            satisfactionScore: analytics.satisfactionScore
          },
          quality: {
            averageRating: analytics.averageRating,
            responseRate: analytics.responseRate,
            satisfactionScore: analytics.satisfactionScore
          },
          trends: analytics.trends
        }
      };
    } catch (error: any) {
      return reply.code(500).send({
        error: "Failed to fetch analytics",
        code: "ANALYTICS_ERROR",
        details: error.message
      });
    }
  });
}

function calculateCompanyCompletion(profile: any): number {
  const fields = [
    profile.name,
    profile.bio,
    profile.country,
    profile.industry,
    profile.companySize,
    profile.description,
    profile.mission,
    profile.website,
    profile.values?.length,
    profile.benefits?.length,
    profile.email,
    profile.phone,
    profile.logoUrl,
    profile.socialLinks,
    profile.techStack?.length
  ];

  const completedFields = fields.filter(field => field && field !== '' && 
    (typeof field === 'boolean' || (Array.isArray(field) && field.length > 0))).length;

  return Math.round((completedFields / fields.length) * 100);
}
