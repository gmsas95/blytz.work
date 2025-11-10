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

// Simplified Firebase Authentication for MVP
import { FastifyReply, FastifyRequest } from "fastify";

// For development, use mock authentication
export async function verifyAuth(request: FastifyRequest, reply: FastifyReply): Promise<void> {
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
    // For development, create mock user
    // In production, implement real Firebase verification
    request.user = {
      uid: 'dev-user-' + Math.random().toString(36).substr(2, 9),
      email: 'dev@example.com',
      role: 'company', // Default to company for now
      profileComplete: false
    };
    
    return;
  } catch (error: any) {
    return reply.code(401).send({ 
      error: "Invalid or expired token",
      code: "INVALID_TOKEN",
      details: error.message
    });
  }
}

// Export requireAuth for other routes
export { verifyAuth as requireAuth };