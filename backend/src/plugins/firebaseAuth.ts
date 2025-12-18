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
    // Handle both literal \n and single-line formats
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    
    console.log('🔍 Firebase private key format check:', {
      hasKey: !!privateKey,
      length: privateKey?.length,
      hasLiteralNewline: privateKey?.includes('\\n'),
      hasActualNewline: privateKey?.includes('\n')
    });
    
    if (privateKey && privateKey.includes('\\n')) {
      privateKey = privateKey.replace(/\\n/g, '\n');
      console.log('✅ Fixed literal \\n in private key');
    } else if (privateKey && !privateKey.includes('\n')) {
      // Handle single-line key format
      privateKey = privateKey.replace(/-----BEGIN PRIVATE KEY-----/, '-----BEGIN PRIVATE KEY-----\n');
      privateKey = privateKey.replace(/-----END PRIVATE KEY-----/, '\n-----END PRIVATE KEY-----');
      
      // Add newlines every 64 characters for key content
      const keyContent = privateKey.match(/-----BEGIN PRIVATE KEY-----(.+)-----END PRIVATE KEY-----/s);
      if (keyContent && keyContent[1]) {
        const keyParts = keyContent[1].match(/.{1,64}/g);
        if (keyParts) {
          const formattedContent = keyParts.join('\n');
          privateKey = '-----BEGIN PRIVATE KEY-----\n' + formattedContent + '\n-----END PRIVATE KEY-----';
        }
      }
      console.log('✅ Fixed single-line private key format');
    }
    
    // Additional fix: Ensure proper PEM format for RS256
    if (privateKey && !privateKey.includes('-----BEGIN PRIVATE KEY-----\n')) {
      privateKey = privateKey.replace(/-----BEGIN PRIVATE KEY-----/, '-----BEGIN PRIVATE KEY-----\n');
      privateKey = privateKey.replace(/-----END PRIVATE KEY-----/, '\n-----END PRIVATE KEY-----');
    }
    
    // Remove any extra whitespace or special characters that might cause issues
    if (privateKey) {
      privateKey = privateKey.trim();
      // Ensure proper line endings
      privateKey = privateKey.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    }
    
    console.log('🔍 Attempting Firebase Admin initialization with:', {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      keyLength: privateKey?.length
    });
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: privateKey,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
    firebaseAuth = admin.auth();
    console.log("✅ Firebase Admin initialized successfully");
    
    // Test the auth instance
    firebaseAuth.listUsers(1).then(() => {
      console.log("✅ Firebase Auth instance working correctly");
    }).catch((error) => {
      console.error("❌ Firebase Auth instance test failed:", error.message);
    });
    
  } catch (error: any) {
    console.error("❌ Firebase Admin initialization failed:", error.message);
    console.error("🔍 Error details:", {
      name: error.name,
      code: error.code,
      stack: error.stack?.substring(0, 200) + '...'
    });
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

  const token = authHeader && authHeader.split(" ")[1];
  
  if (!token) {
    return reply.code(401).send({ 
      error: "Missing token",
      code: "MISSING_TOKEN"
    });
  }

  try {
    // Production: Verify Firebase token
    if (firebaseAuth) {
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