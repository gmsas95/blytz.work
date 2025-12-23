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
import vaRoutes from "./routes/va.js";
import companyRoutes from "./routes/company.js";
import contractsRoutes from "./routes/contracts.js";
import chatRoutes from "./routes/chat-final-fix.js";

// Import utilities
import { prisma, testDatabaseConnection } from "./utils/prisma.js";

// Environment schema
const envSchema = {
  type: "object",
  required: ["DATABASE_URL", "JWT_SECRET"],
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
    ? (process.env.ALLOWED_ORIGINS?.split(',') || ["https://blytz.work", "https://staging.blytz.work", "https://www.blytz.work"])
    : ["http://localhost:3000", "http://localhost:3001", "https://blytz.work", "https://staging.blytz.work", "https://www.blytz.work", "https://api.blytz.work"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "DNT", "User-Agent", "X-Requested-With", "If-Modified-Since", "Cache-Control", "Range", "Accept", "Origin"],
  exposedHeaders: ["Access-Control-Allow-Origin", "Access-Control-Allow-Credentials"],
  preflightContinue: false,
  optionsSuccessStatus: 204
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
app.register(vaRoutes, { prefix: "/api" });
app.register(companyRoutes, { prefix: "/api" });
app.register(contractsRoutes, { prefix: "/api" });
app.register(chatRoutes, { prefix: "/api" });

// Error handler
app.setErrorHandler((error, _request, reply) => {
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
    // Initialize database connection with enhanced testing
    const dbConnected = await testDatabaseConnection();
    
    if (!dbConnected) {
      app.log.warn("⚠️ Database connection failed, some features may not work properly");
      app.log.warn("⚠️ Please check your DATABASE_URL environment variable");
    }

    await app.ready();
    await app.listen({
      port: parseInt(process.env.PORT || "3002"), // Use different port for database-only backend
      host: "0.0.0.0"
    });
    app.log.info(`Server listening on port ${process.env.PORT || 3002}`);
    app.log.info(`🗄️ Database status: ${dbConnected ? 'Connected' : 'Disconnected'}`);
    app.log.info(`✅ Separation of Concerns (SoC) architecture implemented`);
    app.log.info(`👤 VA profiles system ready at /api/va/*`);
    app.log.info(`🏢 Company profiles system ready at /api/company/*`);
    app.log.info(`📁 File upload system ready at /api/upload/*`);
    app.log.info(`💼 Job marketplace system ready at /api/jobs/marketplace/*`);
    app.log.info(`🤝 Contract management system ready at /api/contracts/*`);
    app.log.info(`💳 Payment system ready at /api/payments/*`);
    app.log.info(`💬 Chat system ready at /api/chat/*`);
    app.log.info(`🚀 Platform-first implementation complete`);
    app.log.info(`🎯 MVP Database Backend Ready`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

// Export app for testing
export { app };

// Start server
start();