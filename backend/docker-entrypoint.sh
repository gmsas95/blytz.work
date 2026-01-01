#!/bin/sh
set -e

echo "🔄 Starting backend with database setup..."

# Check database tables directly
echo "🔍 Checking database tables..."
node -e "
const { execSync } = require('child_process');
const dbCheck = execSync('psql \"\\\$DATABASE_URL\" -c \"SELECT tablename FROM pg_tables WHERE schemaname = '\"\\'\"\\\"blytz_hire'\\\"'\"', { encoding: 'utf8', stdio: 'inherit' });
const tables = dbCheck.stdout.trim().split('\n').filter(t => t.trim());
console.log('Tables found:', tables.length);

if (tables.length === 0) {
  console.log('❌ No tables found, running migrations...');
  const result = execSync('npx prisma migrate deploy', { encoding: 'utf8', stdio: 'inherit' });
  console.log('Migration result:', result.stdout);
  process.exit(result.status);
} else {
  console.log('✅ Tables exist, skipping migrations');
  process.exit(0);
}
"

DB_CHECK_RESULT=$?

if [ "$DB_CHECK_RESULT" != "0" ]; then
  echo "❌ Database setup failed!"
  exit 1
fi

echo "✅ Database ready, starting server..."
exec npm start
