import { FastifyReply, FastifyRequest } from "fastify";
import admin from "firebase-admin";
import { prisma } from "../utils/prisma.js";
import { firebaseConfig } from "../config/firebaseConfig.js";

// Initialize Firebase Admin with detailed logging
let firebaseAuth: admin.auth.Auth | null = null;

export function initializeFirebaseAuth() {
  try {
    if (firebaseConfig.projectId && firebaseConfig.clientEmail && firebaseConfig.privateKey) {
      console.log('🔍 Initializing Firebase Admin with config:', {
        projectId: firebaseConfig.projectId,
        clientEmail: firebaseConfig.clientEmail,
        hasPrivateKey: !!firebaseConfig.privateKey
      });

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: firebaseConfig.projectId,
          clientEmail: firebaseConfig.clientEmail,
          privateKey: firebaseConfig.privateKey,
        }),
      });
      
      firebaseAuth = admin.auth();
      console.log('✅ Firebase Admin initialized successfully');
    } else {
      console.warn('⚠️ Firebase credentials incomplete, using development mode');
      firebaseAuth = null;
    }
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error);
    firebaseAuth = null;
  }
}

export async function verifyAuth(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  console.log('🔍 Auth Debug - Starting verification');
  console.log('🔍 Auth Debug - Headers:', Object.keys(request.headers));
  console.log('🔍 Auth Debug - Authorization:', request.headers.authorization);

  const authHeader = request.headers.authorization;
  
  if (!authHeader) {
    console.log('❌ No authorization header found');
    return reply.code(401).send(createAuthError('MISSING_AUTH_HEADER', 'Missing authorization header'));
  }

  const token = authHeader.split(' ')[1];
  console.log('🔍 Auth Debug - Token extracted:', token ? `${token.substring(0, 20)}...` : 'null');

  if (!token) {
    console.log('❌ No token in authorization header');
    return reply.code(401).send(createAuthError('MISSING_TOKEN', 'Missing token'));
  }

  try {
    if (firebaseAuth) {
      console.log('🔍 Attempting Firebase token verification');
      const decodedToken = await firebaseAuth.verifyIdToken(token);
      console.log('✅ Firebase token verified for:', decodedToken.email);
      
      // Get user from database
      const user = await prisma.user.findUnique({
        where: { email: decodedToken.email },
        select: { id: true, role: true, email: true, profileComplete: true }
      });

      if (!user) {
        console.log('❌ User not found in database:', decodedToken.email);
        return reply.code(401).send(createAuthError('USER_NOT_FOUND', 'User not found in database'));
      }

      request.user = {
        uid: user.id,
        email: user.email,
        role: user.role as 'company' | 'va' | 'admin',
        profileComplete: user.profileComplete
      };
      
      console.log('✅ User authenticated:', user.email, 'Role:', user.role);
      return;
    }
    
    // Development mode disabled for security
    // Remove development tokens to prevent authentication bypass
    console.error('❌ Authentication failed: Firebase not properly initialized');
    return reply.code(401).send(createAuthError('AUTH_NOT_INITIALIZED', 'Authentication system not properly configured'));
    
  } catch (error: any) {
    console.log('❌ Token verification failed:', error.message);
    return reply.code(401).send(createAuthError('INVALID_TOKEN', 'Invalid or expired token'));
  }
}

function createAuthError(code: string, message: string) {
  return {
    success: false,
    error: message,
    code,
    debug: {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      hasFirebaseAuth: !!firebaseAuth
    }
  };
}