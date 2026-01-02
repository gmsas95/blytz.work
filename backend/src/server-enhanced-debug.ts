// Enhanced Server with WebSocket Support and Auth Fixes - DEBUG VERSION
import Fastify from "fastify";
import cors from "@fastify/cors";
import env from "@fastify/env";
import rateLimit from "@fastify/rate-limit";
import { createServer } from 'http';
import { WebSocketServer } from './services/websocketServer.js';
import { initializeFirebaseAdmin } from './config/firebaseConfig-simplified.js';
import { validateRequiredEnvVars } from './utils/envValidator.js';

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
import { prisma } from "./utils/prisma.js";

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
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname'
      }
    }
  },
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

// Enhanced startup with validation and WebSocket - DEBUG VERSION
const start = async () => {
  try {
    console.log('🚀 Starting Hyred Backend with Enhanced Configuration (DEBUG MODE)...');
    console.log('📊 Environment Information:');
    console.log(`   Node.js version: ${process.version}`);
    console.log(`   Platform: ${process.platform}`);
    console.log(`   Working directory: ${process.cwd()}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'unknown'}`);
    console.log(`   Port: ${process.env.PORT || '3000'}`);
    
    // Step 1: Validate all required environment variables
    console.log('\n🔍 Step 1: Validating environment variables...');
    try {
      validateRequiredEnvVars([
        'NODE_ENV',
        'PORT',
        'DATABASE_URL',
        'JWT_SECRET'
      ]);
      console.log('✅ Environment variables validated');
    } catch (envError: any) {
      console.error('❌ Environment validation failed:', envError.message);
      throw envError;
    }
    
    // Step 2: Test database connection
    console.log('\n🔍 Step 2: Testing database connection...');
    try {
      console.log('🔄 Connecting to database...');
      await prisma.$connect();
      console.log('✅ Database connected successfully');
      
      // Test a simple query
      console.log('🔄 Testing database query...');
      const result = await prisma.$queryRaw`SELECT 1 as test`;
      console.log('✅ Database query successful:', result);
    } catch (dbError: any) {
      console.error('❌ Database connection failed:', dbError.message);
      console.error('💡 Troubleshooting:');
      console.error('   - Check DATABASE_URL environment variable');
      console.error('   - Verify PostgreSQL is running and accessible');
      console.error('   - Check network connectivity between containers');
      throw dbError;
    }
    
    // Step 3: Initialize Firebase Admin (non-blocking)
    console.log('\n🔍 Step 3: Initializing Firebase Admin...');
    let firebaseInitialized = false;
    try {
      console.log('🔄 Initializing Firebase Admin...');
      initializeFirebaseAdmin();
      firebaseInitialized = true;
      console.log('✅ Firebase Admin initialized successfully');
    } catch (firebaseError: any) {
      console.warn('⚠️ Firebase initialization failed, continuing in development mode:', firebaseError.message);
      console.warn('💡 To fix: Update FIREBASE_* environment variables with actual Firebase credentials');
      firebaseInitialized = false;
    }
    
    // Step 4: Create HTTP server with WebSocket support
    console.log('\n🔍 Step 4: Creating HTTP server with WebSocket support...');
    let server: any;
    let wsServer: any;
    
    try {
      server = createServer(app.server);
      console.log('✅ HTTP server created');
      
      console.log('🔄 Initializing WebSocket server...');
      wsServer = new WebSocketServer(server);
      console.log('✅ WebSocket server initialized');
      
      // Make WebSocket available to routes
      app.decorate('wsServer', wsServer);
    } catch (wsError: any) {
      console.error('❌ WebSocket server initialization failed:', wsError.message);
      console.warn('⚠️ Continuing without WebSocket support...');
      
      // Fallback to HTTP only
      server = createServer(app.server);
    }
    
    // Step 5: Start HTTP server with WebSocket support
    console.log('\n🔍 Step 5: Starting HTTP server...');
    const port = parseInt(process.env.PORT || '3000');
    const host = "0.0.0.0";
    
    console.log(`🔄 Starting server on ${host}:${port}...`);
    
    try {
      await server.listen({
        port,
        host
      });
      
      console.log(`🎉 Server started successfully on ${host}:${port}`);
      console.log('💬 WebSocket server ready for real-time communication');
      
      // Test health endpoint
      console.log('\n🔍 Step 6: Testing health endpoint...');
      try {
        const response = await app.inject({
          method: 'GET',
          url: '/health'
        });
        console.log(`✅ Health endpoint responded with status: ${response.statusCode}`);
        console.log('✅ Health endpoint response:', JSON.parse(response.payload));
      } catch (healthError: any) {
        console.error('❌ Health endpoint test failed:', healthError.message);
      }
      
      console.log('\n🎉 Backend startup completed successfully!');
      console.log('📊 Server Status:');
      console.log(`   - HTTP Server: ✅ Running on ${host}:${port}`);
      console.log(`   - Database: ✅ Connected`);
      console.log(`   - Firebase: ${firebaseInitialized ? '✅ Initialized' : '⚠️ Development mode'}`);
      console.log(`   - WebSocket: ${wsServer ? '✅ Enabled' : '❌ Disabled'}`);
      console.log(`   - Health Check: ✅ /health endpoint available`);
      
    } catch (listenError: any) {
      console.error('❌ Failed to start server:', listenError.message);
      console.error('💡 Troubleshooting:');
      console.error('   - Check if port 3000 is already in use');
      console.error('   - Verify network binding permissions');
      console.error('   - Check firewall settings');
      throw listenError;
    }
    
  } catch (error: any) {
    console.error('\n❌ Backend startup failed:', error.message);
    console.error('💡 Troubleshooting tips:');
    console.error('   1. Check environment variables are set correctly');
    console.error('   2. Verify Firebase credentials are valid');
    console.error('   3. Ensure database is accessible');
    console.error('   4. Check network connectivity and port availability');
    console.error('   5. Review error messages above for specific issues');
    
    // Exit with error code to indicate failure
    process.exit(1);
  }
};

// Export app for testing
export { app };

// Start server
start();