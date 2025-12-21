// Enhanced Server with WebSocket Support and Auth Fixes
import Fastify from "fastify";
import cors from "@fastify/cors";
import env from "@fastify/env";
import rateLimit from "@fastify/rate-limit";
import { createServer } from 'http';
import { WebSocketServer } from './services/websocketServer';
import { initializeFirebaseAdmin } from './config/firebaseConfig-simplified';
import { validateRequiredEnvVars } from './utils/envValidator';

// Import routes
import healthRoutes from "./routes/health";
import authRoutes from "./routes/auth";
import uploadRoutes from "./routes/upload";
import jobMarketplaceRoutes from "./routes/jobMarketplace";
import paymentRoutes from "./routes/payments";
import vaRoutes from "./routes/va";
import companyRoutes from "./routes/company";
import contractsRoutes from "./routes/contracts";
import chatRoutes from "./routes/chat-final-fix";

// Import utilities
import { prisma } from "./utils/prisma";

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
    ? (process.env.ALLOWED_ORIGINS?.split(',') || ["https://blytz.work"])
    : ["http://localhost:3000", "http://localhost:3001", "https://blytz.work", "https://gateway.blytz.work"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "DNT", "User-Agent", "X-Requested-With", "If-Modified-Since", "Cache-Control", "Range"],
  exposedHeaders: ["Access-Control-Allow-Origin", "Access-Control-Allow-Credentials"]
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

// Enhanced startup with validation and WebSocket
const start = async () => {
  try {
    console.log('🚀 Starting Hyred Backend with Enhanced Configuration...');
    
    // Step 1: Validate all required environment variables
    validateRequiredEnvVars([
      'NODE_ENV',
      'PORT',
      'DATABASE_URL',
      'JWT_SECRET'
    ]);
    
    // Step 2: Test database connection
    console.log('🔄 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Step 3: Initialize Firebase Admin (non-blocking)
    console.log('🔄 Initializing Firebase Admin...');
    try {
      initializeFirebaseAdmin();
      console.log('✅ Firebase Admin initialized successfully');
    } catch (firebaseError: any) {
      console.warn('⚠️ Firebase initialization failed, continuing in development mode:', firebaseError.message);
      console.warn('💡 To fix: Update FIREBASE_* environment variables with actual Firebase credentials');
    }
    
    // Create HTTP server with WebSocket support
    const server = createServer(app.server);
    const wsServer = new WebSocketServer(server);
    
    // Make WebSocket available to routes
    app.decorate('wsServer', wsServer);

    // Step 5: Start HTTP server with WebSocket support
    const port = parseInt(process.env.PORT || '3000');
    console.log(`🚀 Starting server on port ${port}...`);
    
    await server.listen({
      port,
      host: "0.0.0.0"
    });
    
    console.log(`🎉 Server with WebSocket support started on port ${port}`);
    console.log('💬 WebSocket server ready for real-time communication');
    
  } catch (error: any) {
    console.error('❌ Failed to start server:', error);
    console.error('💡 Troubleshooting tips:');
    console.error('   1. Check environment variables are set correctly');
    console.error('   2. Verify Firebase credentials are valid');
    console.error('   3. Ensure database is accessible');
    process.exit(1);
  }
};

// Export app for testing
export { app };

// Start server
start();