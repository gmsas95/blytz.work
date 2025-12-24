// Production-ready Firebase Authentication
import { FastifyReply, FastifyRequest } from "fastify";
import admin from "firebase-admin";
import { prisma } from "../utils/prisma.js";

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
    user: AuthenticatedUser;
  }
}


// Initialize Firebase Admin SDK
let firebaseAuth: admin.auth.Auth | null = null;

// Initialize Firebase Admin if credentials are available
if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
  try {
    // Handle private key formatting - ensure proper newlines
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    
    // Replace literal \n with actual newlines if present
    if (privateKey.includes('\\n')) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }
    
    // Ensure the key starts and ends correctly
    if (!privateKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
      privateKey = '-----BEGIN PRIVATE KEY-----\n' + privateKey;
    }
    if (!privateKey.endsWith('-----END PRIVATE KEY-----')) {
      privateKey = privateKey + '\n-----END PRIVATE KEY-----';
    }
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: privateKey,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
    firebaseAuth = admin.auth();
    console.log("✅ Firebase Admin initialized successfully");
  } catch (error) {
    console.error("❌ Firebase Admin initialization failed");
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
    // Production: Verify Firebase token
    if (firebaseAuth) {
      const decodedToken = await firebaseAuth.verifyIdToken(token)
        .catch(error => {
          throw error;
        });
      
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
    // Development mode disabled for security
    // Remove development tokens to prevent authentication bypass
    // Production fallback when Firebase is not initialized
    else {
      return reply.code(500).send({ 
        error: "Firebase Admin not properly initialized",
        code: "FIREBASE_NOT_INITIALIZED"
      });
    }
    
    return;
  } catch (error: any) {
    return reply.code(401).send({ 
      error: "Invalid or expired token",
      code: "INVALID_TOKEN"
    });
  }
}

// Export requireAuth for other routes
export { verifyAuth as requireAuth };