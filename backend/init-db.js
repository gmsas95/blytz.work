const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function initDatabase() {
  console.log('🔍 Database connection check...');
  try {
    await prisma.$connect();
    console.log('✅ Database connected');
    
    console.log('📊 Checking tables...');
    const tables = await prisma.$queryRaw`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'blytz_hire'
    `;
    console.log(`Found ${tables.length} tables in blytz_hire schema`);
    
    if (tables.length === 0) {
      console.log('❌ No tables found! Running migrations...');
      const { execSync } = require('child_process');
      const result = execSync('npx prisma migrate deploy', { 
        stdio: 'inherit',
        encoding: 'utf8'
      });
      console.log('Migration output:', result);
      
      const tablesAfter = await prisma.$queryRaw`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'blytz_hire'
      `;
      console.log(`✅ After migration: ${tablesAfter.length} tables`);
    } else {
      console.log('✅ Tables already exist');
    }
    
    console.log('🎯 Database initialization complete');
  } catch (error) {
    console.error('❌ Database init failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

initDatabase();
