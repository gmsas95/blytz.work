import { PrismaClient } from "@prisma/client";

// Use environment variable for database URL - managed by secrets
const databaseUrl = process.env.DATABASE_URL;

console.log('🔍 Database configuration check:', {
  hasDatabaseUrl: !!databaseUrl,
  databaseUrlPreview: databaseUrl ? databaseUrl.replace(/\/\/.*@/, '//***:***@') : 'none',
  nodeEnv: process.env.NODE_ENV
});

if (!databaseUrl) {
  console.error('❌ DATABASE_URL environment variable is required');
  throw new Error("DATABASE_URL environment variable is required");
}

// Enhanced Prisma client with better error handling
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl
    }
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  errorFormat: 'pretty',
});

// Test database connection on startup
const testDatabaseConnection = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    
    // Type guard to properly handle unknown error type
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorCode = error && typeof error === 'object' && 'code' in error ? error.code : undefined;
    const errorMeta = error && typeof error === 'object' && 'meta' in error ? error.meta : undefined;
    
    console.error('❌ Error details:', {
      message: errorMessage,
      code: errorCode,
      meta: errorMeta
    });
    return false;
  }
};

// Export connection test function
export { testDatabaseConnection };