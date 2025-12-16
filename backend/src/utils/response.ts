import { FastifyReply, FastifyRequest } from "fastify";
import { handleApiError, ApiError } from "./errors.js";

export function sendSuccess<T>(reply: FastifyReply, data: T, message?: string) {
  return reply.code(200).send({
    success: true,
    data,
    message,
  });
}

export function sendError(reply: FastifyReply, error: Error | ApiError, statusCode?: number) {
  const apiError = handleApiError(error);
  const code = statusCode || ('statusCode' in error && typeof error.statusCode === 'number' ? error.statusCode : 500);
  
  return reply.code(code).send({
    success: false,
    error: apiError,
  });
}

export async function withErrorHandling(
  handler: (request: FastifyRequest, reply: FastifyReply) => Promise<any>
) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      return await handler(request, reply);
    } catch (error) {
      return sendError(reply, error as Error);
    }
  };
}

export function createRateLimiter(maxRequests: number, windowMs: number) {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (request: FastifyRequest, reply: FastifyReply, done: () => void) => {
    const clientId = request.ip || request.headers['x-forwarded-for'] as string || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean up old entries
    for (const [id, data] of requests.entries()) {
      if (data.resetTime < windowStart) {
        requests.delete(id);
      }
    }

    const clientData = requests.get(clientId);
    
    if (!clientData) {
      requests.set(clientId, { count: 1, resetTime: now + windowMs });
      return done();
    }

    if (clientData.resetTime < now) {
      clientData.count = 1;
      clientData.resetTime = now + windowMs;
      return done();
    }

    if (clientData.count >= maxRequests) {
      return reply.code(429).send({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests',
          timestamp: new Date().toISOString(),
        }
      });
    }

    clientData.count++;
    done();
  };
}