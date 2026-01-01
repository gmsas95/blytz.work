#!/bin/sh
set -e

echo "🔄 Starting backend with database migration..."

# Run Prisma migrations before starting the server
echo "📦 Applying database migrations..."
npx prisma migrate deploy || {
  echo "❌ Migration failed, starting server anyway..."
}

echo "✅ Migrations complete, starting server..."
exec npm start
