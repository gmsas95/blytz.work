// Complete Server with Hiring & Payment Systems
import Fastify from "fastify";
import cors from "@fastify/cors";
import env from "@fastify/env";
import rateLimit from "@fastify/rate-limit";

// Import routes
import healthRoutes from "./routes/health.js";
import authRoutes from "./routes/auth.js";
import uploadRoutes from "./routes/upload.js";
import jobMarketplaceRoutes from "./routes/jobMarketplace.js";
import paymentRoutes from "./routes/payments.js";
import vaProfileRoutes from "./routes/vaProfiles.js";
import vaRoutes from "./routes/va.js";
import companyRoutes from "./routes/company.js";

// Import utilities
import { createRateLimiter } from "./utils/response.js";

// Environment schema
const envSchema = {
  type: "object",
  required: ["DATABASE_URL", "FIREBASE_PROJECT_ID", "STRIPE_SECRET_KEY", "JWT_SECRET"],
  properties: {
    FIREBASE_PROJECT_ID: { type: "string" },
    FIREBASE_CLIENT_EMAIL: { type: "string" },
    FIREBASE_PRIVATE_KEY: { type: "string" },
    STRIPE_SECRET_KEY: { type: "string" },
    STRIPE_WEBHOOK_SECRET: { type: "string" },
    ALLOWED_ORIGINS: { type: "string", default: "" },
    PAYMENT_AMOUNT: { type: "string", default: "29.99" },
    PLATFORM_FEE_PERCENTAGE: { type: "string", default: "10" },
    PORT: { type: "string", default: "3000" },
    JWT_SECRET: { type: "string" },
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
app.register(authRoutes, { prefix: "/api" });
app.register(uploadRoutes, { prefix: "/api" });
app.register(jobMarketplaceRoutes, { prefix: "/api" });
app.register(paymentRoutes, { prefix: "/api" });
app.register(vaProfileRoutes, { prefix: "/api" });
app.register(vaRoutes, { prefix: "/api" });
app.register(companyRoutes, { prefix: "/api" });

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
    app.log.info(`🔐 Authentication system ready at /api/auth/*`);
    app.log.info(`👤 VA profiles system ready at /api/va/*`);
    app.log.info(`🏢 Company profiles system ready at /api/company/*`);
    app.log.info(`📁 File upload system ready at /api/upload/*`);
    app.log.info(`💼 Job marketplace system ready at /api/jobs/marketplace/*`);
    app.log.info(`🤝 Contract management system ready at /api/contracts/*`);
    app.log.info(`💳 Payment system ready at /api/payments/*`);
    app.log.info(`🚀 Platform-first implementation complete`);
    app.log.info(`🎯 MVP Marketplace Ready - Similar to Fiverr/Upwork`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

// Export app for testing
export { app };

// Start server
start();