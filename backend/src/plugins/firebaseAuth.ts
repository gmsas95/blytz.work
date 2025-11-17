// Type definition for user object
interface AuthenticatedUser {
  uid: string;
  email: string;
  role: 'company' | 'va' | 'admin';
  profileComplete: boolean;
}

// Extend FastifyRequest type
declare module 'fastify' {
  export interface FastifyRequest {
    user?: AuthenticatedUser;
  }
}

// Production-ready Firebase Authentication
import { FastifyReply, FastifyRequest } from "fastify";
import admin from "firebase-admin";
import { prisma } from "../utils/prisma.js";

// Initialize Firebase Admin SDK
let firebaseAuth: admin.auth.Auth | null = null;

// Initialize Firebase Admin if credentials are available
if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
    firebaseAuth = admin.auth();
    console.log("✅ Firebase Admin initialized successfully");
  } catch (error) {
    console.error("❌ Firebase Admin initialization failed:", error);
  }
} else {
  console.warn("⚠️ Firebase credentials not provided, authentication will not work in production");
}

export async function verifyAuth(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const authHeader = request.headers.authorization;
  
  // Skip auth for OPTIONS preflight requests
  if (request.method === 'OPTIONS') {
    return reply.code(204).send();
  }
  
  console.log("🔍 Debug - Auth Header:", authHeader);
  
  if (!authHeader) {
    return reply.code(401).send({ 
      error: "Missing authorization header",
      code: "MISSING_AUTH_HEADER"
    });
  }

  const token = authHeader.split(" ")[1];
  console.log("🔍 Debug - Token:", token ? `${token.substring(0, 20)}...` : 'null');
  
  if (!token) {
    return reply.code(401).send({ 
      error: "Missing token",
      code: "MISSING_TOKEN"
    });
  }

  try {
    // Production: Verify Firebase token
    if (firebaseAuth) {
      console.log('🔍 Debug - Attempting Firebase token verification for:', token.substring(0, 50) + '...');
      
      const decodedToken = await firebaseAuth.verifyIdToken(token)
        .catch(error => {
          console.error('🔍 Debug - Firebase verification failed:', error.message);
          console.error('🔍 Debug - Firebase verification error code:', error.code);
          console.error('🔍 Debug - Firebase verification full error:', error);
          throw error;
        });
      
      console.log('🔍 Debug - Firebase token verified successfully for:', decodedToken.email);
      
      // Get user from database to get role and profile status
      const user = await prisma.user.findUnique({
        where: { email: decodedToken.email },
        select: { id: true, role: true, profileComplete: true, email: true }
      });

      if (!user) {
        return reply.code(401).send({ 
          error: "User not found in database",
          code: "USER_NOT_FOUND"
        });
      }

      request.user = {
        uid: user.id,
        email: user.email,
        role: user.role as 'company' | 'va' | 'admin',
        profileComplete: user.profileComplete
      };
    } 
    // Development: Allow mock token with proper validation
    else if (process.env.NODE_ENV === 'development') {
      // Allow special development token for testing
      if (token === 'dev-token-admin') {
        request.user = {
          uid: 'dev-admin-user',
          email: 'admin@dev.com',
          role: 'admin',
          profileComplete: true
        };
      } 
      else if (token === 'dev-token-company') {
        request.user = {
          uid: 'dev-company-user',
          email: 'company@dev.com',
          role: 'company',
          profileComplete: false
        };
      }
      else if (token === 'dev-token-va') {
        request.user = {
          uid: 'dev-va-user',
          email: 'va@dev.com',
          role: 'va',
          profileComplete: false
        };
      }
      else {
        return reply.code(401).send({ 
          error: "Invalid development token",
          code: "INVALID_DEV_TOKEN",
          hint: "Use: dev-token-admin, dev-token-company, or dev-token-va"
        });
      }
    }
    // Production fallback when Firebase is not initialized
    else {
      return reply.code(500).send({ 
        error: "Firebase Admin not properly initialized",
        code: "FIREBASE_NOT_INITIALIZED"
      });
    }
    
    return;
  } catch (error: any) {
    console.log("🔍 Debug - Token verification failed:", error.message);
    return reply.code(401).send({ 
      error: "Invalid or expired token",
      code: "INVALID_TOKEN",
      details: error.message
    });
  }
}

// Export requireAuth for other routes
export { verifyAuth as requireAuth };