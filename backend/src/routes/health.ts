import { prisma } from "../utils/prisma.js";
import admin from "firebase-admin";

export default async function healthRoutes(app: any) {
  app.get("/health", async (request: any, reply: any) => {
    const healthStatus = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      checks: {
        database: await checkDatabase(),
        firebase: await checkFirebase(),
      },
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    };

    const allHealthy = Object.values(healthStatus.checks).every((check: any) => check.status === 'ok');
    
    return reply.code(allHealthy ? 200 : 503).send(healthStatus);
  });
  
  app.get("/api/health", async (request: any, reply: any) => {
    const healthStatus = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      checks: {
        database: await checkDatabase(),
        firebase: await checkFirebase(),
      },
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    };

    const allHealthy = Object.values(healthStatus.checks).every((check: any) => check.status === 'ok');
    
    return reply.code(allHealthy ? 200 : 503).send(healthStatus);
  });
}

async function checkDatabase() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', latency: Date.now() };
  } catch (error: any) {
    return { status: 'error', message: error.message };
  }
}

async function checkFirebase() {
  try {
    const adminAuth = admin.auth();
    if (adminAuth) {
      return { status: 'ok' };
    }
    return { status: 'skipped', message: 'Firebase Admin not initialized' };
  } catch (error: any) {
    return { status: 'error', message: error.message };
  }
}