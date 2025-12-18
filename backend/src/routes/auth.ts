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

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

const signinSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export default async function authRoutes(app: FastifyInstance) {
  // Sign up new user
  app.post("/auth/signup", async (request, reply) => {
    try {
      const { email, password, name } = signupSchema.parse(request.body);

      // Create user with email and password using Admin SDK
      const userRecord = await admin.auth().createUser({
        email: email,
        password: password,
        displayName: name || undefined,
      });
      
      // Create user in database
      const dbUser = await prisma.user.create({
        data: {
          id: userRecord.uid,
          email: userRecord.email || email,
          role: 'va', // Default role
        }
      });
      
      // Create custom token for user
      const token = await admin.auth().createCustomToken(userRecord.uid);
      
      return {
        success: true,
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName || name,
          role: dbUser.role
        },
        token: token
      };
    } catch (error: any) {
      console.error("Firebase sign-up error:", error);
      
      // Handle common Firebase errors
      if (error.code === 'auth/email-already-in-use') {
        return reply.code(409).send({
          error: "An account already exists with this email address"
        });
      }
      
      if (error.code === 'auth/invalid-email') {
        return reply.code(400).send({
          error: "The email address is not valid"
        });
      }
      
      if (error.code === 'auth/weak-password') {
        return reply.code(400).send({
          error: "Password should be at least 6 characters"
        });
      }
      
      if (error.code === 'auth/too-many-requests') {
        return reply.code(429).send({
          error: "Too many attempts. Please try again later"
        });
      }
      
      // Network error handling
      if (error.code === 'auth/network-request-failed') {
        console.error('Network request failed on backend - this indicates Firebase configuration issues');
        return reply.code(503).send({
          error: "Authentication service temporarily unavailable. Please try again later"
        });
      }
      
      return reply.code(500).send({
        error: "Account creation failed. Please try again"
      });
    }
  });

  // Sign in user
  app.post("/auth/signin", async (request, reply) => {
    try {
      const { email, password } = signinSchema.parse(request.body);

      // For sign in, we need to use Firebase REST API since Admin SDK doesn't support password verification
      const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
      const firebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
      
      if (!firebaseApiKey || !firebaseProjectId) {
        return reply.code(500).send({
          error: "Firebase configuration missing"
        });
      }

      const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
          returnSecureToken: true
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        if (data.error && data.error.message) {
          return reply.code(400).send({
            error: data.error.message
          });
        }
        return reply.code(400).send({
          error: "Authentication failed"
        });
      }

      // Get or create user in database
      let dbUser = await prisma.user.findUnique({
        where: { id: data.localId }
      });

      if (!dbUser) {
        // Create user in database if not exists
        dbUser = await prisma.user.create({
          data: {
            id: data.localId,
            email: data.email,
            role: 'va', // Default role
          }
        });
      }

      return {
        success: true,
        user: {
          uid: data.localId,
          email: data.email,
          displayName: data.displayName || null,
          role: dbUser.role
        },
        token: data.idToken
      };
    } catch (error: any) {
      console.error("Firebase sign-in error:", error);
      
      return reply.code(500).send({
        error: "Authentication failed. Please try again"
      });
    }
  });
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

      if (!email || !email.includes('@')) {
        return reply.code(400).send({
          error: "Please enter a valid email address",
          code: "INVALID_EMAIL"
        });
      }

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

      // In a real production app, you would send this via email (e.g., SendGrid, AWS SES)
      // For this implementation, we'll log it and return it for development convenience
      console.log(`Password reset link for ${email}: ${link}`);

      return reply.send({
        success: true,
        message: "Password reset link generated (check console/response for dev)",
        debug_link: link // Remove this in strict production if email service is added
      });
    } catch (error: any) {
      return reply.code(500).send({
        error: "Failed to process forgot password request",
        code: "FORGOT_PASSWORD_ERROR",
        details: error.message
      });
    }
  });

  // Sync user from Firebase
  app.post("/auth/sync", {
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
}