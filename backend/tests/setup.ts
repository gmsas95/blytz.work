import { beforeAll, afterAll, beforeEach } from '@jest/globals';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_TEST || process.env.DATABASE_URL,
    },
  },
});

beforeAll(async () => {
  // Connect to test database
  await prisma.$connect();
});

afterAll(async () => {
  // Clean up test database
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Clean up data before each test
  await prisma.payment.deleteMany();
  await prisma.match.deleteMany();
  await prisma.matchVote.deleteMany();
  await prisma.jobPosting.deleteMany();
  await prisma.vAProfile.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();
});

export { prisma };