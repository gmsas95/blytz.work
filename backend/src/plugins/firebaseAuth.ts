import admin from "firebase-admin";
import { FastifyReply, FastifyRequest } from "fastify";

// Initialize Firebase Admin
if (!admin.apps.length && process.env.NODE_ENV !== 'test') {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function verifyAuth(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  if (!authHeader) {
    return reply.code(401).send({ error: "Missing authorization header" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return reply.code(401).send({ error: "Missing token" });
  }

  try {
    if (process.env.NODE_ENV === 'test') {
      // Mock authentication for testing
      request.user = {
        uid: 'test-user-id',
        email: 'test@example.com',
        role: 'company'
      };
    } else {
      const decoded = await admin.auth().verifyIdToken(token);
      request.user = {
        uid: decoded.uid,
        email: decoded.email || '',
        role: decoded.role
      };
    }
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