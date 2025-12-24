// Simplified VA Routes for Week 2 MVP
import { FastifyInstance } from "fastify";
import { prisma } from "../utils/prisma.js";
import { verifyAuth } from "../plugins/firebaseAuth.js";
import { z } from "zod";
import { calculateProfileCompletion, generateThumbnailUrl } from "../utils/profileHelpers.js";

// Validation schemas
const createVAProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  country: z.string().min(2, "Country is required"),
  hourlyRate: z.number().min(5, "Hourly rate must be at least $5").max(200, "Hourly rate must be less than $200"),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  availability: z.boolean().default(true),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  timezone: z.string().optional(),
  languages: z.array(z.object({
    code: z.string(),
    level: z.enum(['basic', 'conversational', 'fluent', 'native'])
  })).optional(),
  workExperience: z.array(z.object({
    company: z.string(),
    role: z.string(),
    years: z.number().min(0),
    description: z.string().optional(),
    achievements: z.array(z.string()).optional()
  })).optional(),
  education: z.array(z.object({
    institution: z.string(),
    degree: z.string(),
    field: z.string().optional(),
    startDate: z.string(),
    endDate: z.string().optional(),
    gpa: z.number().optional(),
    achievements: z.array(z.string()).optional()
  })).optional()
});

export default async function vaRoutes(app: FastifyInstance) {
  // Get VA profile
  app.get("/va/profile", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    
    try {
      const profile = await prisma.vAProfile.findUnique({
        where: { userId: user.uid },
        include: {
          user: {
            select: { email: true }
          },
          portfolioItems: {
            orderBy: { 
              createdAt: 'desc' 
            },
            take: 5
          },
          skillsAssessments: {
            orderBy: { completedAt: 'desc' },
            take: 10
          }
        }
      });

      if (!profile) {
        return reply.code(404).send({ 
          error: "VA profile not found",
          code: "PROFILE_NOT_FOUND"
        });
      }

      // Calculate profile completion
      const completionPercentage = calculateProfileCompletion(profile);

      return {
        success: true,
        data: {
          ...profile,
          completionPercentage,
          portfolioItems: [], // Will be handled separately
          reviews: [], // Mock empty reviews
          responseRate: profile.responseRate || 0,
          averageRating: profile.averageRating || 0,
          totalReviews: true,
          featuredProfile: profile.featuredProfile || false,
          profileViews: profile.profileViews || 0
        }
      };
    } catch (error: any) {
      return reply.code(500).send({ 
        error: "Failed to fetch VA profile",
        code: "PROFILE_FETCH_ERROR",
        details: error.message
      });
    }
  });

  // Create VA profile
  app.post("/va/profile", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const data = createVAProfileSchema.parse(request.body);

    try {
      // Check if user already has a profile
      const existingProfile = await prisma.vAProfile.findUnique({
        where: { userId: user.uid }
      });

      if (existingProfile) {
        return reply.code(400).send({ 
          error: "VA profile already exists",
          code: "PROFILE_EXISTS"
        });
      }

      // Check if user role is VA
      const userData = await prisma.user.findUnique({
        where: { id: user.uid }
      });

      if (!userData || userData.role !== "va") {
        return reply.code(403).send({ 
          error: "User is not a VA",
          code: "INVALID_ROLE"
        });
      }

      // Create VA profile
      const profile = await prisma.vAProfile.create({
        data: {
          ...data,
          userId: user.uid,
          responseRate: 0,
          averageRating: 0,
          totalReviews: 0,
          featuredProfile: false,
          profileViews: 0
        },
        include: {
          user: true
        }
      });

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
    const data = createVAProfileSchema.partial().parse(request.body);

    try {
      const profile = await prisma.vAProfile.update({
        where: { userId: user.uid },
        data: data,
        include: {
          user: true,
          portfolioItems: true,
          skillsAssessments: true
        }
      });

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

  // Upload portfolio item
  app.post("/va/upload-portfolio", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { title, description, fileUrl, fileType, category, technologies, projectUrl, featured } = request.body as any;

    try {
      const portfolioItem = await prisma.portfolioItem.create({
        data: {
          vaProfileId: user.uid,
          title,
          description,
          fileUrl,
          fileType,
          thumbnailUrl: generateThumbnailUrl(fileUrl, fileType),
          category,
          technologies: technologies || [],
          projectUrl,
          featured: featured || false
        }
      });

      return reply.code(201).send({
        success: true,
        data: portfolioItem,
        message: "Portfolio item uploaded successfully"
      });
    } catch (error: any) {
      return reply.code(500).send({ 
        error: "Failed to upload portfolio item",
        code: "PORTFOLIO_UPLOAD_ERROR",
        details: error.message
      });
    }
  });

  // Upload resume
  app.post("/va/upload-resume", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { resumeUrl } = request.body as any;

    try {
      await prisma.vAProfile.update({
        where: { userId: user.uid },
        data: { resumeUrl }
      });

      return {
        success: true,
        data: { resumeUrl },
        message: "Resume uploaded successfully"
      };
    } catch (error: any) {
      return reply.code(500).send({ 
        error: "Failed to upload resume",
        code: "RESUME_UPLOAD_ERROR",
        details: error.message
      });
    }
  });

  // Upload video intro
  app.post("/va/upload-video", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { videoUrl } = request.body as any;

    try {
      await prisma.vAProfile.update({
        where: { userId: user.uid },
        data: { videoIntroUrl: videoUrl }
      });

      return {
        success: true,
        data: { videoIntroUrl: videoUrl },
        message: "Video introduction uploaded successfully"
      };
    } catch (error: any) {
      return reply.code(500).send({ 
        error: "Failed to upload video",
        code: "VIDEO_UPLOAD_ERROR",
        details: error.message
      });
    }
  });

  // Skills assessment
  app.post("/va/skills-assessment", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { skillName, category = 'technical', difficulty = 'intermediate' } = request.body as any;

    try {
      const assessment = await prisma.skillsAssessment.create({
        data: {
          vaProfileId: user.uid,
          skillName,
          category,
          difficulty,
          score: Math.floor(Math.random() * 40) + 60, // 60-100 random score
          assessmentType: 'automated',
          expiresAt: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000) // 6 months
        }
      });

      // Update skills score
      await updateSkillsScore(user.uid);

      return reply.code(201).send({
        success: true,
        data: { assessment },
        message: "Skills assessment completed successfully"
      });
    } catch (error: any) {
      return reply.code(500).send({ 
        error: "Failed to complete skills assessment",
        code: "ASSESSMENT_ERROR",
        details: error.message
      });
    }
  });

  // Get skills assessments
  app.get("/va/skills-assessments", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { skill, category } = request.query as { skill?: string, category?: string };

    try {
      const whereClause: any = { vaProfileId: user.uid };
      if (skill) whereClause.skillName = skill;
      if (category) whereClause.category = category;

      const assessments = await prisma.skillsAssessment.findMany({
        where: whereClause,
        orderBy: { completedAt: 'desc' },
        take: 20
      });

      return {
        success: true,
        data: assessments
      };
    } catch (error: any) {
      return reply.code(500).send({ 
        error: "Failed to fetch skills assessments",
        code: "ASSESSMENTS_FETCH_ERROR",
        details: error.message
      });
    }
  });

  // Verification
  app.post("/va/verification", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { level } = request.body as { level: 'professional' | 'premium' };

    try {
      const profile = await prisma.vAProfile.update({
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

  // VA analytics
  app.get("/va/analytics", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;

    try {
      const profile = await prisma.vAProfile.findUnique({
        where: { userId: user.uid },
        select: {
          name: true,
          profileViews: true,
          averageRating: true,
          totalReviews: true,
          responseRate: true
        }
      });

      if (!profile) {
        return reply.code(404).send({ 
          error: "VA profile not found",
          code: "PROFILE_NOT_FOUND"
        });
      }

      // Mock analytics
      const analytics = {
        conversionRate: 15.5,
        averageResponseTime: 2.3,
        trends: [
          { date: '2024-01-01', views: 45, matches: 8 },
          { date: '2024-01-02', views: 52, matches: 11 },
          { date: '2024-01-03', views: 38, matches: 6 }
        ]
      };

      return {
        success: true,
        data: {
          profile: {
            name: profile.name,
            profileViews: profile.profileViews || 0,
            averageRating: profile.averageRating || 0,
            totalReviews: true,
            responseRate: profile.responseRate || 0
          },
          portfolio: {
            totalItems: 0, // Would count from portfolio items
            totalViews: 0,
            featuredItems: 0
          },
          performance: {
            totalMatches: 0,
            totalReviews: true,
            conversionRate: analytics.conversionRate,
            averageResponseTime: analytics.averageResponseTime
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

// Helper functions
function calculateProfileCompletion(profile: any): number {
  const fields = [
    profile.name,
    profile.bio,
    profile.country,
    profile.hourlyRate,
    profile.skills?.length,
    profile.email,
    profile.phone,
    profile.resumeUrl,
    profile.videoIntroUrl,
    profile.workExperience?.length,
    profile.education?.length,
    profile.languages?.length,
    profile.portfolioItems?.length
  ];

  const completedFields = fields.filter(field => field && field !== '').length;
  return Math.round((completedFields / fields.length) * 100);
}

function generateThumbnailUrl(fileUrl: string, fileType: string): string | null {
  if (fileType === 'image') {
    return `${fileUrl}?thumbnail=300x200`;
  } else if (fileType === 'video') {
    return `${fileUrl}?thumbnail`;
  }
  return null;
}

async function updateSkillsScore(userId: string): Promise<void> {
  const assessments = await prisma.skillsAssessment.findMany({
    where: { vaProfileId: userId, expiresAt: { gt: new Date() } }
  });

  const averageScore = assessments.length > 0 
    ? Math.round(assessments.reduce((sum, a) => sum + a.score, 0) / assessments.length)
    : 0;

  await prisma.vAProfile.update({
    where: { userId },
    data: { skillsScore: averageScore }
  });
}