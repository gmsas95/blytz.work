import Fastify from "fastify";
import cors from "@fastify/cors";
import env from "@fastify/env";
import rateLimit from "@fastify/rate-limit";

// Import routes
import healthRoutes from "./routes/health.js";
import authRoutes from "./routes/auth.js"; // NEW AUTH ROUTES
import userRoutes from "./routes/user.routes.js";
import vaRoutes from "./routes/va.js";
import companyRoutes from "./routes/company.js";
import matchingRoutes from "./routes/matching.js";
import paymentRoutes from "./routes/payments.js";

// Import utilities
import { createRateLimiter } from "./utils/response.js";

// Environment schema
const envSchema = {
  type: "object",
  required: ["SUPABASE_DATABASE_URL", "FIREBASE_PROJECT_ID", "STRIPE_SECRET_KEY"],
  properties: {
    SUPABASE_DATABASE_URL: { type: "string" },
    DATABASE_URL: { type: "string" },
    FIREBASE_PROJECT_ID: { type: "string" },
    FIREBASE_CLIENT_EMAIL: { type: "string" },
    FIREBASE_PRIVATE_KEY: { type: "string" },
    STRIPE_SECRET_KEY: { type: "string" },
    STRIPE_WEBHOOK_SECRET: { type: "string" },
    ALLOWED_ORIGINS: { type: "string", default: "" },
    PAYMENT_AMOUNT: { type: "string", default: "29.99" },
    PLATFORM_FEE_PERCENTAGE: { type: "string", default: "10" },
    PORT: { type: "string", default: "3000" },
    NODE_ENV: { type: "string", default: "development" },
  },
};

const app = Fastify({
  logger: true,
});

// Register rate limiting
app.register(rateLimit, {
  global: true,
  max: 100, // Max requests per window
  timeWindow: '15 minutes', // Window duration
  skipOnError: false,
});

// Register plugins
app.register(cors, {
  origin: process.env.NODE_ENV === "production" 
    ? process.env.ALLOWED_ORIGINS?.split(',') || ["https://yourdomain.com"]
    : ["http://localhost:3000", "http://localhost:3001"],
  credentials: true,
});

app.register(env, {
  schema: envSchema,
});

// Register routes
app.register(healthRoutes);
app.register(authRoutes, { prefix: "/api" }); // NEW AUTH ROUTES
app.register(userRoutes, { prefix: "/api" });
app.register(vaRoutes, { prefix: "/api" });
app.register(companyRoutes, { prefix: "/api" });
app.register(matchingRoutes, { prefix: "/api" });
app.register(paymentRoutes, { prefix: "/api" });

// Error handler
app.setErrorHandler((error, request, reply) => {
  app.log.error(error);
  
  if (error.validation) {
    return reply.code(400).send({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation error',
        details: error.validation,
        timestamp: new Date().toISOString(),
      }
    });
  }

  // Don't expose internal errors in production
  const isDev = process.env.NODE_ENV === "development";
  return reply.code(500).send({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: isDev ? error.message : "Internal server error",
      ...(isDev && { stack: error.stack }),
      timestamp: new Date().toISOString(),
    }
  });
});

// Start server
const start = async () => {
  try {
    await app.ready();
    await app.listen({ 
      port: parseInt(process.env.PORT || "3000"), 
      host: "0.0.0.0" 
    });
    app.log.info(`Server listening on port ${process.env.PORT || 3000}`);
    app.log.info(`✅ Separation of Concerns (SoC) architecture implemented`);
    app.log.info(`📊 New user routes available at /api/users/*`);
    app.log.info(`🔐 Authentication system ready at /api/auth/*`);
    app.log.info(`🚀 Platform-first implementation complete`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

// Export app for testing
export { app };

// Start server
start();