// Simplified User Management for MVP
import { FastifyInstance } from "fastify";
import { prisma } from "../utils/prisma.js";
import { verifyAuth } from "../plugins/firebaseAuth.js";
import { z } from "zod";

// Validation schemas
const updateProfileSchema = z.object({
  email: z.string().email().optional(),
  role: z.enum(['company', 'va']).optional(),
  profileComplete: z.boolean().optional(),
});

export default async function authRoutes(app: FastifyInstance) {
  // Get current user profile
  app.get("/auth/profile", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    
    try {
      const userProfile = await prisma.user.findUnique({
        where: { id: user.uid },
        include: {
          vaProfile: true,
          company: true,
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        }
      });

      if (!userProfile) {
        return reply.code(404).send({ 
          error: "User profile not found",
          code: "USER_NOT_FOUND"
        });
      }

      return {
        success: true,
        data: userProfile
      };
    } catch (error: any) {
      return reply.code(500).send({ 
        error: "Failed to fetch user profile",
        code: "PROFILE_FETCH_ERROR",
        details: error.message
      });
    }
  });

  // Update user profile
  app.put("/auth/profile", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const updateData = updateProfileSchema.parse(request.body);

    try {
      // Check if email is being changed and is unique
      if (updateData.email && updateData.email !== user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: updateData.email }
        });

        if (existingUser) {
          return reply.code(400).send({ 
            error: "Email already exists",
            code: "EMAIL_EXISTS"
          });
        }
      }

      // Update user profile
      const updatedUser = await prisma.user.update({
        where: { id: user.uid },
        data: updateData,
        include: {
          vaProfile: true,
          company: true
        }
      });

      return {
        success: true,
        data: updatedUser,
        message: "Profile updated successfully"
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
        error: "Failed to update profile",
        code: "PROFILE_UPDATE_ERROR",
        details: error.message
      });
    }
  });

  // Sync user from Firebase
  app.post("/auth/sync", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { uid, email, photoURL } = request.body as any;

    try {
      let userProfile = await prisma.user.findUnique({
        where: { id: uid }
      });

      if (!userProfile) {
        // Create new user
        userProfile = await prisma.user.create({
          data: {
            id: uid,
            email: email,
            role: 'va' // Default role for now
          }
        });
      }

      return {
        success: true,
        data: userProfile,
        message: "User synced successfully"
      };
    } catch (error: any) {
      return reply.code(500).send({ 
        error: "Failed to sync user",
        code: "USER_SYNC_ERROR",
        details: error.message
      });
    }
  });

  // Create new user from Firebase
  app.post("/auth/create", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { uid, email, role, photoURL } = request.body as any;

    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { id: uid }
      });

      if (existingUser) {
        return reply.code(400).send({ 
          error: "User already exists",
          code: "USER_EXISTS"
        });
      }

      // Create new user
      const newUser = await prisma.user.create({
        data: {
          id: uid,
          email: email,
          role: role
        }
      });

      return {
        success: true,
        data: newUser,
        message: "User created successfully"
      };
    } catch (error: any) {
      return reply.code(500).send({ 
        error: "Failed to create user",
        code: "USER_CREATION_ERROR",
        details: error.message
      });
    }
  });

  // Generate custom token for client
  app.post("/auth/token", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;

    try {
      // For now, return a mock token
      const customToken = "mock_custom_token_" + user.uid;
      
      return {
        success: true,
        data: {
          token: customToken,
          expiresIn: '1h'
        }
      };
    } catch (error: any) {
      return reply.code(500).send({ 
        error: "Failed to generate token",
        code: "TOKEN_GENERATION_ERROR",
        details: error.message
      });
    }
  });
}