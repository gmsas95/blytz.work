// Simplified User Management for MVP - Refactored with Service Layer
import { FastifyInstance } from "fastify";
import { verifyAuth } from "../plugins/firebaseAuth.js";
import { z } from "zod";
import { AuthService } from "../services/authService.js";

// Validation schemas
const updateProfileSchema = z.object({
  email: z.string().email().optional(),
  role: z.enum(['company', 'va']).optional(),
  profileComplete: z.boolean().optional(),
});

export default async function authRoutes(app: FastifyInstance) {
  const authService = new AuthService();

  // Create user from Firebase (called after Firebase signup)
  app.post("/auth/create", async (request, reply) => {
    try {
      const { uid, email, displayName } = request.body as any;

      const result = await authService.createUser({ uid, email, displayName });

      return reply.code(201).send(result);
    } catch (error: any) {
      return reply.code(500).send({
        error: "Failed to create user",
        code: "USER_CREATION_ERROR",
        details: error.message
      });
    }
  });

  // Get current user profile
  app.get("/auth/profile", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;

    try {
      const userProfile = await authService.getProfile(user.uid);

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

    try {
      const updateData = updateProfileSchema.parse(request.body);
      const result = await authService.updateProfile(user.uid, updateData);

      return reply.send(result);
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

  // Forgot password endpoint
  app.post("/auth/forgot-password", async (request, reply) => {
    try {
      const { email } = request.body as { email: string };

      // Validate email properly with Zod
      const emailSchema = z.string().email("Please enter a valid email address");
      const validatedEmail = emailSchema.parse(email);

      const result = await authService.requestPasswordReset(validatedEmail);

      return reply.send(result);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          error: "Validation error",
          code: "VALIDATION_ERROR",
          details: error.errors
        });
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      app.log.error({ error: errorMessage }, 'Forgot password request failed');

      // Don't reveal if email exists or not for security
      return reply.send({
        success: true,
        message: "If an account exists with this email, a password reset link has been sent"
      });
    }
  });

  // Update user role (for onboarding flow)
  app.patch("/auth/role", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    const { role } = request.body as { role: 'va' | 'company' | 'admin' };

    try {
      const result = await authService.updateRole(user.uid, role);

      return reply.send(result);
    } catch (error: any) {
      return reply.code(500).send({
        error: "Failed to update user role",
        code: "ROLE_UPDATE_ERROR",
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
      const result = await authService.generateCustomToken(user.uid);

      return reply.send(result);
    } catch (error: any) {
      return reply.code(500).send({
        error: "Failed to generate token",
        code: "TOKEN_GENERATION_ERROR",
        details: error.message
      });
    }
  });
}
