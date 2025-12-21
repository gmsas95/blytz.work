// Simplified Firebase Authentication plugin
// Eliminates complex fallback mechanisms for robust deployment

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

import { FastifyReply, FastifyRequest } from "fastify";
import { getFirebaseAdmin, getAuth } from "../config/firebaseConfig-simplified.js";
import { prisma } from "../utils/prisma.js";

// Initialize Firebase Admin
let firebaseAuth: any = null;

try {
  firebaseAuth = getAuth();
  console.log("✅ Firebase Auth initialized successfully");
} catch (error) {
  console.error("❌ Firebase Auth initialization failed:", error);
}

export async function verifyAuth(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  // Skip auth for OPTIONS preflight requests
  if (request.method === 'OPTIONS') {
    return reply.code(204).send();
  }

  const authHeader = request.headers.authorization;
  
  if (!authHeader) {
    return reply.code(401).send({ 
      error: "Missing authorization header",
      code: "MISSING_AUTH_HEADER"
    });
  }

  const token = authHeader.split(" ")[1];
  
  if (!token) {
    return reply.code(401).send({ 
      error: "Missing token",
      code: "MISSING_TOKEN"
    });
  }

  try {
    if (!firebaseAuth) {
      return reply.code(500).send({ 
        error: "Firebase Auth not properly initialized",
        code: "FIREBASE_NOT_INITIALIZED",
        message: "Server configuration error - please contact administrator"
      });
    }

    // Verify Firebase token
    const decodedToken = await firebaseAuth.verifyIdToken(token);
    
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
    
    return;
  } catch (error: any) {
    console.error('Authentication error:', error);
    return reply.code(401).send({ 
      error: "Invalid or expired token",
      code: "INVALID_TOKEN"
    });
  }
}

// Export requireAuth for other routes
export { verifyAuth as requireAuth };

// Export a function to check if Firebase is initialized
export function isFirebaseInitialized(): boolean {
  return firebaseAuth !== null;
}

// Export a function to get the current Firebase auth instance
export function getFirebaseAuth() {
  return firebaseAuth;
}