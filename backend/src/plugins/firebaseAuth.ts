import admin from "firebase-admin";
import { FastifyReply, FastifyRequest } from "fastify";

// Initialize Firebase Admin
if (!admin.apps.length && process.env.NODE_ENV !== 'production') {
  try {
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      console.warn('Firebase not configured - using mock authentication for development');
    }
  } catch (error: any) {
    console.warn('Firebase initialization failed, using mock auth:', error.message);
  }
}

export async function verifyAuth(request: FastifyRequest, reply: FastifyReply) {
  // In development, skip authentication for now
  if (process.env.NODE_ENV !== 'production') {
    request.user = {
      uid: 'dev-user',
      email: 'dev@example.com',
      role: 'company'
    };
    return;
  }

  const authHeader = request.headers.authorization;
  if (!authHeader) {
    return reply.code(401).send({ error: "Missing authorization header" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return reply.code(401).send({ error: "Missing token" });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    request.user = {
      uid: decoded.uid,
      email: decoded.email || '',
      role: decoded.role || 'va' // Default to VA for safety
    };
  } catch (error) {
    return reply.code(401).send({ error: "Invalid token" });
  }
}

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  await verifyAuth(request, reply);
  
  if (!request.user) {
    return reply.code(401).send({ error: "Authentication failed" });
  }
}

export { admin };