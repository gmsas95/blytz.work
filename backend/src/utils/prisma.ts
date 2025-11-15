import { PrismaClient } from "@prisma/client";

// Debug database connection
const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres:z46fkjvmqzf7z2woihbvo9hr2yloopac@hire-postgres:5432/blytz_hire";

console.log("🔍 DATABASE_URL:", process.env.DATABASE_URL);
console.log("🔍 Using:", databaseUrl);

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl
    }
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});