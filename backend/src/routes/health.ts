import { prisma } from "../utils/prisma.js";
import admin from "firebase-admin";

export default async function healthRoutes(app: any) {
  app.get("/", async (request: any, reply: any) => {
    return reply.send({ status: 'ok', message: 'BlytzWork Backend API' });
  });

  app.get("/health", async (request: any, reply: any) => {
    const uptime = process.uptime();
    const isStartup = uptime < 60;

    const healthStatus = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      checks: {
        database: isStartup ? { status: 'starting' } : await checkDatabase(),
        firebase: isStartup ? { status: 'starting' } : await checkFirebase(),
      },
      uptime: uptime,
      environment: process.env.NODE_ENV || 'development'
    };

    const allHealthy = Object.values(healthStatus.checks).every((check: any) =>
      check.status === 'ok' || check.status === 'skipped' || check.status === 'starting'
    );

    return reply.code(allHealthy ? 200 : 503).send(healthStatus);
  });

  app.get("/api/health", async (request: any, reply: any) => {
    const uptime = process.uptime();
    const isStartup = uptime < 60;

    const healthStatus = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      checks: {
        database: isStartup ? { status: 'starting' } : await checkDatabase(),
        firebase: isStartup ? { status: 'starting' } : await checkFirebase(),
      },
      uptime: uptime,
      environment: process.env.NODE_ENV || 'development'
    };

    const allHealthy = Object.values(healthStatus.checks).every((check: any) =>
      check.status === 'ok' || check.status === 'skipped' || check.status === 'starting'
    );

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