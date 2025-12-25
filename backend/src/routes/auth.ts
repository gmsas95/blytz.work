// Simplified User Management for MVP
import { FastifyInstance } from "fastify";
import { prisma } from "../utils/prisma.js";
import { verifyAuth } from "../plugins/firebaseAuth.js";
import { z } from "zod";
import admin from "firebase-admin";

// Get Firebase Auth instance (initialized in firebaseAuth.ts)

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

  // Forgot password endpoint
  app.post("/auth/forgot-password", async (request, reply) => {
    try {
      const { email } = request.body as { email: string };

      // Validate email properly with Zod
      const emailSchema = z.string().email("Please enter a valid email address");
      const validatedEmail = emailSchema.parse(email);

      const authInstance = admin.auth();
      const userRecord = await authInstance.getUserByEmail(email.toLowerCase())
        .catch((error: any) => {
          if (error.code === 'auth/user-not-found') {
            return null;
          }
          console.error("Error checking user:", error);
          return null;
        });

      if (!userRecord) {
        return reply.code(404).send({
          error: "No account found with this email address. Please check your email or sign up for a new account.",
          code: "USER_NOT_FOUND"
        });
      }

      // Generate password reset link
      const link = await admin.auth().generatePasswordResetLink(email);

      // In production, send password reset link via email (e.g., SendGrid, AWS SES)
      // TODO: Implement email sending service
      // await sendPasswordResetEmail(email, link);

      // Log for development purposes only
      app.log.info({ email, userId: userRecord.uid }, 'Password reset link generated');

      // Return success without exposing the reset link
      return reply.send({
        success: true,
        message: "If an account exists with this email, a password reset link has been sent"
      });
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

  // Sync user from Firebase
  app.post("/auth/sync", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const { uid, email } = request.body as { uid: string, email: string };
    
    try {
      let userProfile = await prisma.user.findUnique({
        where: { id: uid }
      });

      if (!userProfile) {
        // Create user from Firebase auth data
        userProfile = await prisma.user.create({
          data: {
            id: uid,
            email: email,
            role: 'va',
            profileComplete: false
          }
        });
        console.log(`✅ User synced to database: ${userProfile.id} from Firebase sync`);
      }

      return reply.send({
        success: true,
        data: userProfile
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
        error: "Failed to sync user",
        code: "USER_SYNC_ERROR",
        details: error.message
      });
    }
  });

  // NEW: Update user role
  app.patch("/auth/role", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const { uid, email } = request.body as any;

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
  // Create user from Firebase auth data
  app.post("/auth/create", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const { uid, email, role } = request.body as any;
    
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

      // Create user from Firebase auth data
      const newUser = await prisma.user.create({
        data: {
          id: uid,
          email,
          role: 'va', // Default to VA
          profileComplete: false
        }
      });

      return reply.code(201).send({
        success: true,
        message: "User created from Firebase",
        data: { userId: newUser.id, email: newUser.email, role: newUser.role }
      });
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
      // Generate a custom token for the user
      const customToken = await admin.auth().createCustomToken(user.uid);

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

  // Sync Firebase user to database
  app.post("/auth/sync-user", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { id: user.uid }
      });
    
      if (existingUser) {
        return reply.send({ 
          success: true,
          message: "User already synced to database"
        });
      }
      
      // Create user from Firebase auth data
      const newUser = await prisma.user.create({
        data: {
          id: user.uid,
          email: user.email,
          role: 'va', // Default to VA, can be updated via role selection
          profileComplete: false
        }
      });
      
      return reply.code(201).send({
        success: true,
        message: "User synced to database",
        data: { userId: user.uid, email: user.email, role: 'va' }
      });
    } catch (error: any) {
      return reply.code(500).send({ 
        error: "Failed to sync user",
        code: "USER_SYNC_ERROR",
        details: error.message
      });
    }
  });

  // NEW: Verify user exists in database
  app.get("/auth/verify-user", {
    preHandler: [verifyAuth]
  }, async (request, reply) => {
    const user = request.user as any;
    
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.uid },
        select: { id: true, email: true, role: true, profileComplete: true }
      });
 
      return {
        exists: !!dbUser,
        userId: dbUser?.id,
        email: dbUser?.email,
        role: dbUser?.role,
        profileComplete: dbUser?.profileComplete
      };
    } catch (error: any) {
      return reply.code(500).send({
        error: "Failed to verify user",
        details: error.message
      });
    }
  });

  // NEW: Create user from Firebase WITHOUT requiring auth
  // This fixes the chicken-and-egg problem where user exists in Firebase but not in database
  app.post("/auth/create-from-firebase", async (request, reply) => {
    const { uid, email, role = 'va' } = request.body as {
      uid: string;
      email: string;
      role?: 'va' | 'company' | 'admin'
    };

    if (!uid || !email) {
      return reply.code(400).send({
        error: "Missing required fields",
        code: "MISSING_FIELDS"
      });
    }

    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { id: uid }
      });

      if (existingUser) {
        return reply.send({
          success: true,
          message: "User already exists in database",
          data: { userId: existingUser.id, email: existingUser.email, role: existingUser.role }
        });
      }

      // Create user from Firebase auth data
      const newUser = await prisma.user.create({
        data: {
          id: uid,
          email: email,
          role: role,
          profileComplete: false
        }
      });

      console.log(`✅ User created from Firebase: ${newUser.id} (${newUser.email})`);

      return reply.code(201).send({
        success: true,
        message: "User created from Firebase",
        data: { userId: newUser.id, email: newUser.email, role: newUser.role }
      });
    } catch (error: any) {
      return reply.code(500).send({
        error: "Failed to create user from Firebase",
        code: "USER_CREATION_ERROR",
        details: error.message
      });
    }
  });
}