#!/bin/sh
set -e

echo "🔄 Starting backend with database setup..."

# Run database check script
node /app/check-db.js
DB_CHECK_RESULT=$?

if [ "$DB_CHECK_RESULT" != "0" ]; then
  echo "⚠️  No tables found, running migrations..."
  npx prisma migrate deploy || echo "⚠️  Migration failed, starting anyway..."
  echo "✅ Migration check complete"
else
  echo "✅ Tables exist, skipping migrations"
fi

echo "✅ Database ready, starting server..."
exec npm start
