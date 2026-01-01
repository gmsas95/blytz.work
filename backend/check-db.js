const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');
    
    const result = await prisma.$queryRaw\`SELECT tablename FROM pg_tables WHERE schemaname = 'blytz_hire'\`;
    const tables = result.map(row => row.tablename);
    console.log(\`Tables found: \${tables.length}\`);
    
    process.exit(tables.length > 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ Database check failed:', error);
    process.exit(1);
  }
}

main();
