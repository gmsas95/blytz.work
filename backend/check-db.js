const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');
    
    const tables = await prisma.$queryRaw`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'blytz_hire'
    `;
    console.log(`📊 Found ${tables.length} tables in blytz_hire schema`);
    
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
      console.log('✅ Tables exist, skipping migrations');
    }
    
    await prisma.$disconnect();
    console.log('🎯 Database check complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database check failed:', error);
    process.exit(1);
  }
})();
