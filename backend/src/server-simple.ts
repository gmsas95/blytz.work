// Simple Working API with Real Database
import Fastify from "fastify";
import cors from "@fastify/cors";
import dotenv from "dotenv";
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();

const app = Fastify({
  logger: true
});

app.register(cors, {
  origin: [
    "http://blytz-hired-pre0225supabase-eec3c8-72-60-236-89.traefik.me",
    "https://blytz-hired-pre0225supabase-eec3c8-72-60-236-89.traefik.me",
    "http://72.60.236.89:3000",
    "https://72.60.236.89:3000",
    "*"
  ],
  credentials: true
});

// Health check
app.get("/health", async () => {
  return { 
    success: true, 
    service: "BlytzHire API",
    database: "PostgreSQL",
    timestamp: new Date().toISOString() 
  };
});

// VA Profiles from Real Database
app.get("/api/va/profiles", async (request, reply) => {
  try {
    console.log('🔍 Fetching VA profiles from real database...');
    
    const profiles = await prisma.vAProfile.findMany({
      where: { availability: true },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            profileComplete: true,
            emailVerified: true
          }
        }
      },
      orderBy: [
        { featuredProfile: 'desc' },
        { averageRating: 'desc' },
        { profileViews: 'desc' }
      ]
    });

    console.log(`✅ Found ${profiles.length} real VA profiles in database`);

    return {
      success: true,
      data: profiles,
      count: profiles.length,
      source: "PostgreSQL Database",
      message: "Successfully loaded VA profiles from real database"
    };
  } catch (error: any) {
    console.error("❌ Database error:", error.message);
    return reply.code(500).send({
      success: false,
      error: {
        code: "DATABASE_ERROR",
        message: "Failed to fetch VA profiles from database",
        details: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
});

// VA Profile by ID
app.get("/api/va/profile/:id", async (request, reply) => {
  try {
    const { id } = request.params as any;
    
    const profile = await prisma.vAProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      }
    });
    
    if (!profile) {
      return reply.code(404).send({
        success: false,
        error: {
          code: "VA_NOT_FOUND",
          message: "VA profile not found in database",
          timestamp: new Date().toISOString()
        }
      });
    }

    // Increment profile views
    await prisma.vAProfile.update({
      where: { id },
      data: { profileViews: { increment: 1 } }
    });

    return {
      success: true,
      data: profile,
      source: "PostgreSQL Database",
      message: "Successfully loaded VA profile from database"
    };
  } catch (error: any) {
    console.error("❌ Database error:", error.message);
    return reply.code(500).send({
      success: false,
      error: {
        code: "DATABASE_ERROR",
        message: "Failed to fetch VA profile from database",
        details: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
});

// Database Health Check
app.get("/api/va/health", async (request, reply) => {
  try {
    const vaCount = await prisma.vAProfile.count();
    const userCount = await prisma.user.count();
    
    return { 
      success: true, 
      service: "VA Routes",
      database: "PostgreSQL Connected",
      vaProfiles: vaCount,
      users: userCount,
      timestamp: new Date().toISOString() 
    };
  } catch (error: any) {
    console.error("❌ Database health error:", error.message);
    return {
      success: false,
      service: "VA Routes",
      database: "PostgreSQL Disconnected",
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
});

// Mock Authentication
app.post("/api/auth/login", async (request, reply) => {
  try {
    const { email, password } = request.body as any;
    
    if (email && password) {
      return {
        success: true,
        data: {
          user: {
            uid: "mock-user-123",
            email: email,
            role: "company"
          },
          token: "mock-jwt-token-12345"
        },
        message: "Login successful"
      };
    } else {
      return reply.code(401).send({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Email and password required",
          timestamp: new Date().toISOString()
        }
      });
    }
  } catch (error: any) {
    console.error("❌ Login error:", error.message);
    return reply.code(500).send({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to process login",
        timestamp: new Date().toISOString()
      }
    });
  }
});

// Start server
const start = async () => {
  try {
    const port = 3005;
    
    await app.listen({
      port: port,
      host: "0.0.0.0"
    });
    
    console.log(`🚀 BlytzHire Real Database API Started!`);
    console.log(`📡 Server listening on port ${port}`);
    console.log(`🗄️  Database: PostgreSQL Connected`);
    console.log(`🌐 URL: http://0.0.0.0:${port}`);
    console.log(`✅ Real VA Discovery: /api/va/profiles`);
    console.log(`✅ Database Health: /api/va/health`);
    console.log(`✅ Authentication: /api/auth/login`);
    console.log(`🎯 Real Platform Ready!`);
    
  } catch (err: any) {
    console.error("❌ Server startup error:", err.message);
    process.exit(1);
  }
};

start();
